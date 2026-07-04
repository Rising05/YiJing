import { Module } from '@nestjs/common'
import { ImageController } from './image.controller'
import { ImageService } from './image.service'
import { StorageService } from './storage.service'

@Module({
  controllers: [ImageController],
  providers: [ImageService, StorageService],
  exports: [ImageService, StorageService],
})
export class ImageModule {}
