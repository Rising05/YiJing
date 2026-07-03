import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { GenerationController } from './generation.controller'
import { GenerationService } from './generation.service'

@Module({
  imports: [AuthModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
