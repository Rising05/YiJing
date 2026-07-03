import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { TestLoginDto } from './dto/test-login.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('test-login')
  testLogin(@Body() dto: TestLoginDto) {
    return this.authService.testLogin(dto)
  }
}
