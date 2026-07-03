import { Module } from '@nestjs/common'
import { AiModule } from '../ai/ai.module'
import { AuthModule } from '../auth/auth.module'
import { ImageModule } from '../image/image.module'
import { GenerationController } from './generation.controller'
import { GenerationService } from './generation.service'

@Module({
  imports: [AuthModule, AiModule, ImageModule],
  controllers: [GenerationController],
  providers: [GenerationService],
})
export class GenerationModule {}
