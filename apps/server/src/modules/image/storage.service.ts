import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface DeleteStoredImageResult {
  status: 'skipped' | 'deleted' | 'unsupported'
  reason?: string
}

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  async saveRemoteImage(imageUrl: string) {
    if (this.provider === 'none' || this.provider === 'mock') {
      return imageUrl
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

    // Real object-store deletion stays behind this service so API callers do not
    // depend on a specific vendor SDK. Until OSS is configured, do not pretend the
    // remote object was deleted.
    return { status: 'unsupported', reason: `delete_not_configured:${this.provider}` }
  }

  private get provider() {
    return this.config.get<string>('STORAGE_PROVIDER') ?? 'none'
  }
}
