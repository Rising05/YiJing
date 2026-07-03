import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { HistoryService } from './history.service'

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get()
  list(@CurrentUser() user: CurrentUser) {
    return this.historyService.list(user.id)
  }

  @Get(':id')
  detail(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.historyService.detail(user.id, id)
  }

  @Delete(':id')
  remove(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.historyService.remove(user.id, id)
  }

  @Patch(':id/favorite')
  favorite(@CurrentUser() user: CurrentUser, @Param('id') id: string) {
    return this.historyService.toggleFavorite(user.id, id)
  }
}
