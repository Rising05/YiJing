import { Controller, Delete, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { UserService } from './user.service'

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Delete('me')
  deleteMe(@CurrentUser() user: CurrentUser) {
    return this.userService.deleteAccount(user.id)
  }
}
