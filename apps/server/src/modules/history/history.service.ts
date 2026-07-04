import { Injectable, NotFoundException } from '@nestjs/common'
import { GenerationRecord } from '@prisma/client'
import { StorageService } from '../image/storage.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class HistoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async list(userId: string) {
    const records = await this.prisma.generationRecord.findMany({
      where: { userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
    return records.map((record) => this.toHistoryItem(record))
  }

  async detail(userId: string, id: string) {
    const record = await this.findOwnedRecord(userId, id)
    return this.toResult(record)
  }

  async remove(userId: string, id: string) {
    const record = await this.findOwnedRecord(userId, id)
    await this.storage.deleteImage(record.backgroundImageUrl)
    await this.prisma.generationRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    return { ok: true }
  }

  async toggleFavorite(userId: string, id: string) {
    const record = await this.findOwnedRecord(userId, id)
    const updated = await this.prisma.generationRecord.update({
      where: { id },
      data: { isFavorite: !record.isFavorite },
    })
    return this.toHistoryItem(updated)
  }

  private async findOwnedRecord(userId: string, id: string) {
    const record = await this.prisma.generationRecord.findFirst({
      where: { id, userId, deletedAt: null },
    })
    if (!record) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '历史记录不存在' })
    }
    return record
  }

  private toHistoryItem(record: GenerationRecord) {
    return {
      id: record.id,
      type: record.type,
      title: record.title,
      contentType: record.contentType,
      templateId: record.templateId,
      backgroundImageUrl: record.backgroundImageUrl,
      isFavorite: record.isFavorite,
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
    }
  }

  private toResult(record: GenerationRecord) {
    return {
      ...(record.resultJson as Record<string, unknown>),
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
      isFavorite: record.isFavorite,
    }
  }
}
