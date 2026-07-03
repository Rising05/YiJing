import { BadRequestException, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'
import { TestLoginDto } from './dto/test-login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async testLogin(dto: TestLoginDto) {
    if (dto.phone !== '13800000000' || dto.code !== '123456') {
      throw new BadRequestException({ code: 'INVALID_TEST_CODE', message: '请使用测试手机号 13800000000 和验证码 123456' })
    }

    const user = await this.prisma.user.upsert({
      where: { phone: dto.phone },
      update: { nickname: '测试用户', deletedAt: null },
      create: {
        phone: dto.phone,
        nickname: '测试用户',
        quota: {
          create: {
            remainingCredits: 20,
            usedCredits: 0,
          },
        },
      },
      include: { quota: true },
    })

    const token = await this.jwtService.signAsync({ sub: user.id, phone: user.phone })
    return {
      token,
      user: {
        id: user.id,
        nickname: user.nickname,
        phone: user.phone,
        remainingCredits: user.quota?.remainingCredits ?? 0,
      },
    }
  }
}
