import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { SendSmsCodeDto, SmsLoginDto } from './dto/sms-auth.dto'
import { TestLoginDto } from './dto/test-login.dto'
import { WechatLoginDto } from './dto/wechat-login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test-login')
  testLogin(@Body() dto: TestLoginDto) {
    return this.authService.testLogin(dto)
  }

  @Post('sms-code')
  sendSmsCode(@Body() dto: SendSmsCodeDto) {
    return this.authService.sendSmsCode(dto)
  }

  @Post('sms-login')
  smsLogin(@Body() dto: SmsLoginDto) {
    return this.authService.smsLogin(dto)
  }

  @Post('wechat-login')
  wechatLogin(@Body() dto: WechatLoginDto) {
    return this.authService.wechatLogin(dto)
  }
}
