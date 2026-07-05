import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'

interface ErrorResponse {
  code?: string
  message?: string | string[]
  details?: unknown
}

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const payload = exception instanceof HttpException ? exception.getResponse() : {}
    const body = typeof payload === 'object' && payload !== null ? (payload as ErrorResponse) : { message: payload }

    response.status(status).json({
      code: body.code ?? this.statusCodeToCode(status),
      message: Array.isArray(body.message) ? body.message.join('; ') : body.message ?? '服务暂时不可用',
      details: body.details ?? null,
      path: request.url,
      timestamp: new Date().toISOString(),
    })
  }

  private statusCodeToCode(status: number) {
    if (status === HttpStatus.UNAUTHORIZED) return 'UNAUTHORIZED'
    if (status === HttpStatus.BAD_REQUEST) return 'INVALID_INPUT'
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND'
    return 'INTERNAL_ERROR'
  }
}
