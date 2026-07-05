import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const header = request.headers.authorization as string | undefined
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '请先登录' })
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; phone?: string }>(token)
      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, deletedAt: null },
        select: { id: true, phone: true },
      })
      if (!user) {
        throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '登录状态已失效，请重新登录' })
      }
      request.user = { id: payload.sub, phone: payload.phone }
      return true
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '登录状态已失效，请重新登录' })
    }
  }
}
