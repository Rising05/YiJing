import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'

export interface DeleteStoredImageResult {
  status: 'skipped' | 'deleted' | 'unsupported'
  reason?: string
}

const imageExtensionsByType: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  async saveRemoteImage(imageUrl: string) {
    if (this.provider === 'none' || this.provider === 'mock') {
      return imageUrl
    }

    if (this.provider === 'local') {
      return this.saveRemoteImageToLocalDisk(imageUrl)
    }

    // OSS upload is intentionally isolated behind this service. The next step can
    // add ali-oss here without changing generation/image service contracts.
    return imageUrl
  }

  async deleteImage(imageUrl: string | null | undefined): Promise<DeleteStoredImageResult> {
    if (!imageUrl) {
      return { status: 'skipped', reason: 'empty_url' }
    }

    if (this.provider === 'none' || this.provider === 'mock') {
      return { status: 'skipped', reason: `provider:${this.provider}` }
    }

    if (this.provider === 'local') {
      return this.deleteLocalImage(imageUrl)
    }

    // Real object-store deletion stays behind this service so API callers do not
    // depend on a specific vendor SDK. Until OSS is configured, do not pretend the
    // remote object was deleted.
    return { status: 'unsupported', reason: `delete_not_configured:${this.provider}` }
  }

  getLocalImagePath(fileName: string) {
    const safeName = basename(fileName)
    if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/i.test(safeName)) {
      return null
    }
    return resolve(this.localStorageDir, safeName)
  }

  private async saveRemoteImageToLocalDisk(imageUrl: string) {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new BadGatewayException({ code: 'IMAGE_STORAGE_FAILED', message: `图片下载失败：${response.status}` })
    }

    const contentType = response.headers.get('content-type')?.split(';')[0]?.toLowerCase() ?? ''
    if (!contentType.startsWith('image/')) {
      throw new BadGatewayException({ code: 'IMAGE_STORAGE_FAILED', message: '远程地址不是图片资源' })
    }

    const bytes = Buffer.from(await response.arrayBuffer())
    if (!bytes.length) {
      throw new BadGatewayException({ code: 'IMAGE_STORAGE_FAILED', message: '远程图片为空' })
    }

    await mkdir(this.localStorageDir, { recursive: true })
    const fileName = `${randomUUID()}${this.extensionFor(contentType, imageUrl)}`
    const filePath = resolve(this.localStorageDir, fileName)
    try {
      await writeFile(filePath, bytes, { flag: 'wx' })
    } catch {
      throw new InternalServerErrorException({ code: 'IMAGE_STORAGE_FAILED', message: '图片保存失败' })
    }

    return `${this.publicBaseUrl}/api/images/${fileName}`
  }

  private async deleteLocalImage(imageUrl: string): Promise<DeleteStoredImageResult> {
    const fileName = this.fileNameFromLocalImageUrl(imageUrl)
    if (!fileName) {
      return { status: 'skipped', reason: 'not_local_image_url' }
    }

    const filePath = this.getLocalImagePath(fileName)
    if (!filePath) {
      return { status: 'skipped', reason: 'invalid_local_image_name' }
    }

    await rm(filePath, { force: true })
    return { status: 'deleted' }
  }

  private fileNameFromLocalImageUrl(imageUrl: string) {
    try {
      const url = new URL(imageUrl, this.publicBaseUrl)
      if (!url.pathname.startsWith('/api/images/')) return ''
      return basename(url.pathname)
    } catch {
      return ''
    }
  }

  private extensionFor(contentType: string, imageUrl: string) {
    if (imageExtensionsByType[contentType]) return imageExtensionsByType[contentType]
    const extension = extname(new URL(imageUrl).pathname).toLowerCase()
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) return extension
    return '.png'
  }

  private get provider() {
    return (this.config.get<string>('STORAGE_PROVIDER') ?? 'none').toLowerCase()
  }

  private get localStorageDir() {
    return resolve(process.cwd(), this.config.get<string>('LOCAL_STORAGE_DIR') ?? 'uploads/generated-images')
  }

  private get publicBaseUrl() {
    const configured = this.config.get<string>('PUBLIC_BASE_URL')?.replace(/\/$/, '')
    if (configured) return configured
    return `http://localhost:${this.config.get<string>('PORT') ?? 3000}`
  }
}
