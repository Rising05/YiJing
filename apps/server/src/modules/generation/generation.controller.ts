import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { TextMemoryDto } from './dto/text-memory.dto'
import { WordCardDto } from './dto/word-card.dto'
import { GenerationService } from './generation.service'

@Controller('generation')
@UseGuards(JwtAuthGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  @Post('text-memory')
  createTextMemory(@CurrentUser() user: CurrentUser, @Body() dto: TextMemoryDto) {
    return this.generationService.createTextMemory(user.id, dto)
  }

  @Post('word-card')
  createWordCard(@CurrentUser() user: CurrentUser, @Body() dto: WordCardDto) {
    return this.generationService.createWordCard(user.id, dto)
  }

  @Post(':id/regenerate')
  regenerate(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.generationService.regenerate(user.id, id)
  }
}
