import { Injectable } from '@nestjs/common'
import { StorageService } from '../image/storage.service'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async deleteAccount(userId: string) {
    const records = await this.prisma.generationRecord.findMany({
      where: { userId },
      select: { backgroundImageUrl: true },
    })
    await Promise.all(records.map((record) => this.storage.deleteImage(record.backgroundImageUrl)))

    await this.prisma.$transaction([
      this.prisma.aiUsageLog.updateMany({
        where: { userId },
        data: { userId: null, errorMessage: 'user_deleted' },
      }),
      this.prisma.generationRecord.deleteMany({ where: { userId } }),
      this.prisma.userQuota.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ])
    return { ok: true }
  }
}
