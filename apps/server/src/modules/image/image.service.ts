import { BadGatewayException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { StorageService } from './storage.service'

interface WanxResponse {
  output?: {
    choices?: Array<{
      message?: {
        content?: Array<{
          image?: string
          type?: string
        }>
      }
    }>
  }
  request_id?: string
  code?: string
  message?: string
}

interface GenerateImageInput {
  prompt: string
  size?: string
}

const negativePrompt = [
  'text',
  'Chinese characters',
  'English letters',
  'numbers',
  'labels',
  'watermark',
  'UI elements',
  'religious symbols',
  'political symbols',
  'low quality',
  'cluttered composition',
].join(', ')

@Injectable()
export class ImageService {
  constructor(
    private readonly config: ConfigService,
    private readonly storage: StorageService,
  ) {}

  async generateBackground(input: GenerateImageInput) {
    if (this.shouldUseMock()) {
      return {
        backgroundImageUrl: '',
        provider: 'mock',
        model: 'mock',
        rawResponse: null,
      }
    }

    const body = await this.callWanx(input)
    const imageUrl = body.output?.choices?.[0]?.message?.content?.find((item) => item.type === 'image' && item.image)?.image
    if (!imageUrl) {
      throw new BadGatewayException({ code: 'IMAGE_GENERATION_FAILED', message: '通义万相未返回图片地址' })
    }

    return {
      backgroundImageUrl: await this.storage.saveRemoteImage(imageUrl),
      provider: 'wanx',
      model: this.model,
      rawResponse: body,
    }
  }

  private async callWanx(input: GenerateImageInput) {
    const response = await fetch(`${this.baseUrl}/api/v1/services/aigc/multimodal-generation/generation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        input: {
          messages: [
            {
              role: 'user',
              content: [{ text: input.prompt }],
            },
          ],
        },
        parameters: {
          prompt_extend: true,
          watermark: false,
          n: 1,
          negative_prompt: negativePrompt,
          size: input.size ?? this.size,
        },
      }),
    })

    const body = (await response.json().catch(() => null)) as WanxResponse | null
    if (!response.ok) {
      throw new BadGatewayException({
        code: 'IMAGE_GENERATION_FAILED',
        message: body?.message ?? `通义万相请求失败：${response.status}`,
      })
    }
    if (!body) {
      throw new BadGatewayException({ code: 'IMAGE_GENERATION_FAILED', message: '通义万相响应为空' })
    }
    return body
  }

  private shouldUseMock() {
    return this.config.get<string>('IMAGE_MOCK_MODE') !== 'false' || !this.apiKey
  }

  private get baseUrl() {
    return (this.config.get<string>('WANX_BASE_URL') ?? 'https://dashscope.aliyuncs.com').replace(/\/$/, '')
  }

  private get apiKey() {
    return this.config.get<string>('WANX_API_KEY') ?? ''
  }

  private get model() {
    return this.config.get<string>('WANX_MODEL') ?? 'wan2.6-t2i'
  }

  private get size() {
    return this.config.get<string>('WANX_SIZE') ?? '960*1696'
  }
}
