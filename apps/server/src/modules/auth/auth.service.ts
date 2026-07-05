import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import type { User, UserQuota } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { SendSmsCodeDto, SmsLoginDto } from './dto/sms-auth.dto'
import { TestLoginDto } from './dto/test-login.dto'
import { WechatLoginDto } from './dto/wechat-login.dto'

type UserWithQuota = User & { quota: UserQuota | null }

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async testLogin(dto: TestLoginDto) {
    if (dto.phone !== '13800000000' || dto.code !== '123456') {
      throw new BadRequestException({ code: 'INVALID_INPUT', message: '请使用测试手机号 13800000000 和验证码 123456' })
    }

    const user = await this.prisma.user.upsert({
      where: { phone: dto.phone },
      update: {
        nickname: '测试用户',
        deletedAt: null,
        quota: {
          upsert: {
            create: {
              remainingCredits: 20,
              usedCredits: 0,
            },
            update: {
              remainingCredits: 20,
              usedCredits: 0,
            },
          },
        },
      },
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

    return this.issueToken(user)
  }

  async sendSmsCode(_dto: SendSmsCodeDto) {
    this.throwAuthProviderNotConfigured('短信验证码服务尚未配置，MVP 阶段请使用测试登录。')
  }

  async smsLogin(_dto: SmsLoginDto) {
    this.throwAuthProviderNotConfigured('短信登录服务尚未配置，MVP 阶段请使用测试登录。')
  }

  async wechatLogin(_dto: WechatLoginDto) {
    this.throwAuthProviderNotConfigured('微信登录尚未配置，MVP 阶段请使用测试登录。')
  }

  private async issueToken(user: UserWithQuota) {
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

  private throwAuthProviderNotConfigured(message: string): never {
    throw new ServiceUnavailableException({ code: 'FEATURE_NOT_CONFIGURED', message })
  }
}
