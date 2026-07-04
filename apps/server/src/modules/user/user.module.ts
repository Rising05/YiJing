import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ImageModule } from '../image/image.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [AuthModule, ImageModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
