import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import { createHmac, randomUUID } from 'node:crypto'

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

    if (this.provider === 'oss') {
      return this.saveRemoteImageToOss(imageUrl)
    }

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

    if (this.provider === 'oss') {
      return this.deleteOssImage(imageUrl)
    }

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
    const { bytes, contentType } = await this.downloadRemoteImage(imageUrl)

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

  private async saveRemoteImageToOss(imageUrl: string) {
    const { bytes, contentType } = await this.downloadRemoteImage(imageUrl)
    const objectKey = this.createObjectKey(this.extensionFor(contentType, imageUrl))
    const response = await fetch(this.ossObjectUrl(objectKey), {
      method: 'PUT',
      headers: this.ossHeaders('PUT', objectKey, contentType),
      body: bytes,
    })

    if (!response.ok) {
      const message = await response.text().catch(() => '')
      throw new BadGatewayException({
        code: 'IMAGE_STORAGE_FAILED',
        message: message ? `OSS 图片上传失败：${response.status}` : `OSS 图片上传失败：${response.status}`,
      })
    }

    return this.ossPublicUrl(objectKey)
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

  private async deleteOssImage(imageUrl: string): Promise<DeleteStoredImageResult> {
    const objectKey = this.objectKeyFromOssImageUrl(imageUrl)
    if (!objectKey) {
      return { status: 'skipped', reason: 'not_oss_image_url' }
    }

    const response = await fetch(this.ossObjectUrl(objectKey), {
      method: 'DELETE',
      headers: this.ossHeaders('DELETE', objectKey),
    })

    if (response.ok || response.status === 404) {
      return { status: 'deleted' }
    }

    return { status: 'unsupported', reason: `oss_delete_failed:${response.status}` }
  }

  private async downloadRemoteImage(imageUrl: string) {
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

    return { bytes, contentType }
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

  private createObjectKey(extension: string) {
    const normalizedPrefix = this.ossObjectPrefix
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean)
      .join('/')
    const fileName = `${randomUUID()}${extension}`
    return normalizedPrefix ? `${normalizedPrefix}/${fileName}` : fileName
  }

  private ossHeaders(method: 'PUT' | 'DELETE', objectKey: string, contentType = '') {
    const date = new Date().toUTCString()
    const canonicalResource = `/${this.ossBucket}/${objectKey}`
    const stringToSign = `${method}\n\n${contentType}\n${date}\n${canonicalResource}`
    const signature = createHmac('sha1', this.ossAccessKeySecret).update(stringToSign).digest('base64')
    const headers: Record<string, string> = {
      Authorization: `OSS ${this.ossAccessKeyId}:${signature}`,
      Date: date,
    }
    if (contentType) headers['Content-Type'] = contentType
    return headers
  }

  private ossObjectUrl(objectKey: string) {
    return `${this.ossEndpoint}/${encodePath(objectKey)}`
  }

  private ossPublicUrl(objectKey: string) {
    return `${this.ossPublicBaseUrl}/${encodePath(objectKey)}`
  }

  private objectKeyFromOssImageUrl(imageUrl: string) {
    try {
      const url = new URL(imageUrl)
      const candidates = [this.ossPublicBaseUrl, this.ossEndpoint]
      for (const candidate of candidates) {
        const base = new URL(candidate)
        if (url.origin !== base.origin) continue
        const basePath = trimSlashes(base.pathname)
        const path = trimSlashes(url.pathname)
        if (basePath && !path.startsWith(`${basePath}/`)) continue
        const objectKey = basePath ? path.slice(basePath.length + 1) : path
        return decodeURIComponent(objectKey)
      }
    } catch {
      return ''
    }
    return ''
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

  private get ossBucket() {
    return requireConfig(this.config, 'OSS_BUCKET')
  }

  private get ossRegion() {
    return requireConfig(this.config, 'OSS_REGION')
  }

  private get ossAccessKeyId() {
    return requireConfig(this.config, 'OSS_ACCESS_KEY_ID')
  }

  private get ossAccessKeySecret() {
    return requireConfig(this.config, 'OSS_ACCESS_KEY_SECRET')
  }

  private get ossEndpoint() {
    const configured = this.config.get<string>('OSS_ENDPOINT')?.replace(/\/$/, '')
    if (configured) return configured
    return `https://${this.ossBucket}.${this.ossRegion}.aliyuncs.com`
  }

  private get ossPublicBaseUrl() {
    const configured = this.config.get<string>('OSS_PUBLIC_BASE_URL')?.replace(/\/$/, '')
    if (configured) return configured
    return this.ossEndpoint
  }

  private get ossObjectPrefix() {
    return this.config.get<string>('OSS_OBJECT_PREFIX') ?? 'generated-images'
  }
}

function requireConfig(config: ConfigService, name: string) {
  const value = config.get<string>(name)
  if (!value) {
    throw new InternalServerErrorException({ code: 'IMAGE_STORAGE_FAILED', message: `缺少存储配置：${name}` })
  }
  return value
}

function encodePath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function trimSlashes(path: string) {
  return path.replace(/^\/+|\/+$/g, '')
}
