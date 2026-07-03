import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class StorageService {
  constructor(private readonly config: ConfigService) {}

  async saveRemoteImage(imageUrl: string) {
    const provider = this.config.get<string>('STORAGE_PROVIDER') ?? 'none'
    if (provider === 'none' || provider === 'mock') {
      return imageUrl
    }

    // OSS upload is intentionally isolated behind this service. The next step can
    // add ali-oss here without changing generation/image service contracts.
    return imageUrl
  }
}
