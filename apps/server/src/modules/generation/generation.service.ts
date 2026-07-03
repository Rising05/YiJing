import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { assertSafeLearningContent } from './content-safety'
import { TextMemoryDto } from './dto/text-memory.dto'
import { WordCardDto } from './dto/word-card.dto'
import { createTextMemoryMock, createWordCardMock } from './mock-generator'

@Injectable()
export class GenerationService {
  constructor(private readonly prisma: PrismaService) {}

  async createTextMemory(userId: string, dto: TextMemoryDto) {
    assertSafeLearningContent(dto.inputText)
    const result = createTextMemoryMock(dto.inputText, dto.contentType, dto.scenePreference)
    return this.saveRecord(userId, {
      type: 'text-memory',
      title: result.title,
      contentType: result.contentType,
      inputText: dto.inputText,
      inputWords: Prisma.JsonNull,
      templateId: result.templateId,
      result,
      imagePrompt: result.imagePrompt,
      promptUsed: 'mock-text-memory-v1',
    })
  }

  async createWordCard(userId: string, dto: WordCardDto) {
    const words = [...new Set(dto.words.map((word) => word.trim()).filter(Boolean))]
    if (words.length > 30) {
      throw new BadRequestException({ code: 'TOO_MANY_WORDS', message: '一次最多 30 个单词或短语，请减少输入。' })
    }
    assertSafeLearningContent(words.join(' '))
    const result = createWordCardMock(words)
    return this.saveRecord(userId, {
      type: 'word-card',
      title: result.title,
      contentType: null,
      inputText: null,
      inputWords: words,
      templateId: result.templateId,
      result,
      imagePrompt: result.imagePrompt,
      promptUsed: 'mock-word-card-v1',
    })
  }

  async regenerate(userId: string, id: string) {
    const record = await this.prisma.generationRecord.findFirst({ where: { id, userId, deletedAt: null } })
    if (!record) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '生成记录不存在' })
    }
    if (record.type === 'text-memory' && record.inputText) {
      return this.createTextMemory(userId, {
        inputText: record.inputText,
        contentType: (record.contentType as TextMemoryDto['contentType']) ?? 'auto',
        scenePreference: 'auto',
      })
    }
    const words = Array.isArray(record.inputWords) ? (record.inputWords as string[]) : []
    return this.createWordCard(userId, { words, theme: 'auto', cardMode: 'scene' })
  }

  private async saveRecord(
    userId: string,
    input: {
      type: string
      title: string
      contentType: string | null
      inputText: string | null
      inputWords: Prisma.InputJsonValue | typeof Prisma.JsonNull
      templateId: string
      result: Record<string, unknown>
      imagePrompt: string
      promptUsed: string
    },
  ) {
    const expiresAt = new Date(Date.now() + 30 * 86400000)
    const record = await this.prisma.generationRecord.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        contentType: input.contentType,
        inputText: input.inputText,
        inputWords: input.inputWords,
        templateId: input.templateId,
        backgroundImageUrl: '',
        resultJson: input.result as Prisma.InputJsonValue,
        imagePrompt: input.imagePrompt,
        promptUsed: input.promptUsed,
        expiresAt,
      },
    })
    await this.prisma.aiUsageLog.create({
      data: {
        userId,
        recordId: record.id,
        provider: 'mock',
        model: input.promptUsed,
        status: 'success',
        imageCount: 0,
      },
    })
    return {
      ...input.result,
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
    }
  }
}
