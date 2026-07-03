import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteAccount(userId: string) {
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
