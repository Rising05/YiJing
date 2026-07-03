import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest()
    const header = request.headers.authorization as string | undefined
    const token = header?.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token) {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '请先登录' })
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; phone?: string }>(token)
      request.user = { id: payload.sub, phone: payload.phone }
      return true
    } catch {
      throw new UnauthorizedException({ code: 'UNAUTHORIZED', message: '登录状态已失效，请重新登录' })
    }
  }
}
