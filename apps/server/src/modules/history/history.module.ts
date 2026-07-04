import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { ImageModule } from '../image/image.module'
import { HistoryController } from './history.controller'
import { HistoryService } from './history.service'

@Module({
  imports: [AuthModule, ImageModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
