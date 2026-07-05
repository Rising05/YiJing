import { BadGatewayException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import { createHash, createHmac, randomUUID } from 'node:crypto'

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

    if (this.isS3Provider) {
      return this.saveRemoteImageToS3(imageUrl)
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

    if (this.isS3Provider) {
      return this.deleteS3Image(imageUrl)
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
    const objectKey = this.createObjectKey(this.extensionFor(contentType, imageUrl), this.ossObjectPrefix)
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

  private async saveRemoteImageToS3(imageUrl: string) {
    const { bytes, contentType } = await this.downloadRemoteImage(imageUrl)
    const objectKey = this.createObjectKey(this.extensionFor(contentType, imageUrl), this.s3ObjectPrefix)
    const response = await fetch(this.s3ObjectUrl(objectKey), {
      method: 'PUT',
      headers: this.s3Headers('PUT', objectKey, bytes, contentType),
      body: bytes,
    })

    if (!response.ok) {
      throw new BadGatewayException({
        code: 'IMAGE_STORAGE_FAILED',
        message: `S3 图片上传失败：${response.status}`,
      })
    }

    return this.s3PublicUrl(objectKey)
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

  private async deleteS3Image(imageUrl: string): Promise<DeleteStoredImageResult> {
    const objectKey = this.objectKeyFromS3ImageUrl(imageUrl)
    if (!objectKey) {
      return { status: 'skipped', reason: 'not_s3_image_url' }
    }

    const response = await fetch(this.s3ObjectUrl(objectKey), {
      method: 'DELETE',
      headers: this.s3Headers('DELETE', objectKey),
    })

    if (response.ok || response.status === 404) {
      return { status: 'deleted' }
    }

    return { status: 'unsupported', reason: `s3_delete_failed:${response.status}` }
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

  private createObjectKey(extension: string, prefix: string) {
    const normalizedPrefix = prefix
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

  private s3Headers(method: 'PUT' | 'DELETE', objectKey: string, body = Buffer.alloc(0), contentType = '') {
    const now = new Date()
    const amzDate = toAmzDate(now)
    const dateStamp = amzDate.slice(0, 8)
    const payloadHash = sha256Hex(body)
    const url = new URL(this.s3ObjectUrl(objectKey))
    const headers: Record<string, string> = {
      Host: url.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    }
    if (contentType) headers['Content-Type'] = contentType

    const canonicalHeaders = Object.entries(headers)
      .map(([key, value]) => [key.toLowerCase(), value.trim()] as const)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}:${value}\n`)
      .join('')
    const signedHeaders = Object.keys(headers)
      .map((key) => key.toLowerCase())
      .sort()
      .join(';')
    const canonicalRequest = [
      method,
      url.pathname,
      url.searchParams.toString(),
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n')
    const scope = `${dateStamp}/${this.s3Region}/s3/aws4_request`
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n')
    const signingKey = s3SigningKey(this.s3SecretAccessKey, dateStamp, this.s3Region)
    const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex')

    return {
      ...headers,
      Authorization: `AWS4-HMAC-SHA256 Credential=${this.s3AccessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    }
  }

  private s3ObjectUrl(objectKey: string) {
    return `${this.s3Endpoint}/${encodePath(this.s3Bucket)}/${encodePath(objectKey)}`
  }

  private s3PublicUrl(objectKey: string) {
    return `${this.s3PublicBaseUrl}/${encodePath(objectKey)}`
  }

  private objectKeyFromS3ImageUrl(imageUrl: string) {
    try {
      const url = new URL(imageUrl)
      const candidates = [this.s3PublicBaseUrl, `${this.s3Endpoint}/${encodePath(this.s3Bucket)}`]
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

  private get isS3Provider() {
    return this.provider === 's3' || this.provider === 's3-compatible'
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

  private get s3Bucket() {
    return requireConfig(this.config, 'S3_BUCKET')
  }

  private get s3Region() {
    return this.config.get<string>('S3_REGION') || 'auto'
  }

  private get s3Endpoint() {
    return requireConfig(this.config, 'S3_ENDPOINT').replace(/\/$/, '')
  }

  private get s3PublicBaseUrl() {
    const configured = this.config.get<string>('S3_PUBLIC_BASE_URL')?.replace(/\/$/, '')
    if (configured) return configured
    return `${this.s3Endpoint}/${encodePath(this.s3Bucket)}`
  }

  private get s3ObjectPrefix() {
    return this.config.get<string>('S3_OBJECT_PREFIX') ?? 'generated-images'
  }

  private get s3AccessKeyId() {
    return requireConfig(this.config, 'S3_ACCESS_KEY_ID')
  }

  private get s3SecretAccessKey() {
    return requireConfig(this.config, 'S3_SECRET_ACCESS_KEY')
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

function sha256Hex(input: string | Buffer) {
  return createHash('sha256').update(input).digest('hex')
}

function toAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function s3SigningKey(secret: string, dateStamp: string, region: string) {
  const dateKey = createHmac('sha256', `AWS4${secret}`).update(dateStamp).digest()
  const regionKey = createHmac('sha256', dateKey).update(region).digest()
  const serviceKey = createHmac('sha256', regionKey).update('s3').digest()
  return createHmac('sha256', serviceKey).update('aws4_request').digest()
}
