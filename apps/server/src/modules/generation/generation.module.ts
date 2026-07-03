import { Module } from '@nestjs/common'
import { AiModule } from '../ai/ai.module'
import { AuthModule } from '../auth/auth.module'
import { GenerationController } from './generation.controller'
import { GenerationService } from './generation.service'

@Module({
  imports: [AuthModule, AiModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
