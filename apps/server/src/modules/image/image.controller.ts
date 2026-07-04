import { Controller, Get, NotFoundException, Param, StreamableFile } from '@nestjs/common'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname } from 'node:path'
import { StorageService } from './storage.service'

const contentTypesByExtension: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

@Controller('images')
export class ImageController {
  constructor(private readonly storage: StorageService) {}

  @Get(':fileName')
  async getImage(@Param('fileName') fileName: string) {
    const filePath = this.storage.getLocalImagePath(fileName)
    if (!filePath) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '图片不存在' })
    }

    try {
      await stat(filePath)
    } catch {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '图片不存在' })
    }

    const contentType = contentTypesByExtension[extname(filePath).toLowerCase()] ?? 'application/octet-stream'
    return new StreamableFile(createReadStream(filePath), {
      type: contentType,
      disposition: `inline; filename="${fileName}"`,
    })
  }
}
