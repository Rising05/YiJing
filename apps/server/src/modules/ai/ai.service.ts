import { BadGatewayException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { buildImagePrompt } from '../../../../../packages/prompts/src/imagePrompt'
import { buildTextMemoryPrompt } from '../../../../../packages/prompts/src/textMemoryPrompt'
import { buildWordCardPrompt } from '../../../../../packages/prompts/src/wordCardPrompt'
import { TextMemoryDto } from '../generation/dto/text-memory.dto'
import { WordCardDto } from '../generation/dto/word-card.dto'
import { createTextMemoryMock, createWordCardMock } from '../generation/mock-generator'
import { parseStrictJson } from './json-utils'
import { aiTemplates, getAiTemplate } from './memory-templates'
import { validateTextMemoryPlan, validateWordCardPlan } from './ai-validator'
import type { TextMemoryPlan, WordCardPlan } from './ai.types'

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

@Injectable()
export class AiService {
  constructor(private readonly config: ConfigService) {}

  async createTextMemoryResult(dto: TextMemoryDto) {
    if (this.shouldUseMock()) {
      return {
        result: createTextMemoryMock(dto.inputText, dto.contentType, dto.scenePreference),
        promptUsed: 'mock-text-memory-v1',
        provider: 'mock',
        model: 'mock',
        rawResponse: null,
      }
    }

    const prompt = buildTextMemoryPrompt({
      inputText: dto.inputText,
      contentType: dto.contentType,
      scenePreference: dto.scenePreference,
      templates: aiTemplates,
    })
    const plan = validateTextMemoryPlan(await this.callJsonWithRetry<TextMemoryPlan>(prompt))
    const template = getAiTemplate(plan.templateId)
    const imagePrompt = buildImagePrompt({
      templateScenePrompt: template.scenePrompt,
      visualObjects: plan.points.map((point) => point.visualObject),
      anchorDescriptions: plan.points.map((point) => {
        const anchor = template.anchors.find((item) => item.key === point.anchorKey)
        return `${anchor?.name ?? point.anchorKey}: ${point.visualObject}`
      }),
    })
    const now = new Date()
    return {
      result: {
        ...plan,
        id: '',
        type: 'text-memory',
        backgroundImageUrl: '',
        imagePrompt,
        watermarkText: '忆境 MemoryPalace',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
      },
      promptUsed: prompt,
      provider: 'openai-compatible',
      model: this.model,
      rawResponse: plan,
    }
  }

  async createWordCardResult(dto: WordCardDto) {
    if (this.shouldUseMock()) {
      return {
        result: createWordCardMock(dto.words, dto.cardMode),
        promptUsed: 'mock-word-card-v1',
        provider: 'mock',
        model: 'mock',
        rawResponse: null,
      }
    }

    const prompt = buildWordCardPrompt({
      words: dto.words,
      theme: dto.theme,
      cardMode: dto.cardMode,
      templates: aiTemplates,
    })
    const plan = validateWordCardPlan(await this.callJsonWithRetry<WordCardPlan>(prompt))
    const template = getAiTemplate(plan.templateId)
    const imagePrompt = buildImagePrompt({
      templateScenePrompt: template.scenePrompt,
      visualObjects: plan.words.map((word) => word.visualObject),
      anchorDescriptions: plan.words.map((word) => {
        const anchor = template.anchors.find((item) => item.key === word.anchorKey)
        return `${anchor?.name ?? word.anchorKey}: ${word.visualObject}`
      }),
    })
    const now = new Date()
    return {
      result: {
        ...plan,
        id: '',
        type: 'word-card',
        cardMode: dto.cardMode,
        backgroundImageUrl: '',
        imagePrompt,
        watermarkText: '忆境 MemoryPalace',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
      },
      promptUsed: prompt,
      provider: 'openai-compatible',
      model: this.model,
      rawResponse: plan,
    }
  }

  private async callJsonWithRetry<T>(prompt: string): Promise<T> {
    const retryCount = Number(this.config.get<string>('LLM_JSON_RETRY_COUNT') ?? 1)
    let lastError: unknown
    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      try {
        const content = await this.callChatCompletion(
          attempt === 0
            ? prompt
            : `${prompt}\n\n上次输出不是合法 JSON 或字段不合法。请只重新输出严格 JSON 对象，不要 Markdown。`,
        )
        return parseStrictJson<T>(content)
      } catch (error) {
        lastError = error
      }
    }
    throw lastError
  }

  private async callChatCompletion(prompt: string) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: '你必须输出严格 JSON 对象，不要输出 Markdown、解释性文字或代码块。',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.4,
        response_format: { type: 'json_object' },
      }),
    })
    if (!response.ok) {
      throw new BadGatewayException({ code: 'LLM_REQUEST_FAILED', message: `LLM 请求失败：${response.status}` })
    }
    const body = (await response.json()) as ChatCompletionResponse
    const content = body.choices?.[0]?.message?.content
    if (!content) {
      throw new BadGatewayException({ code: 'LLM_EMPTY_RESPONSE', message: 'LLM 返回为空' })
    }
    return content
  }

  private shouldUseMock() {
    return this.config.get<string>('AI_MOCK_MODE') !== 'false' || !this.apiKey
  }

  private get baseUrl() {
    return (this.config.get<string>('LLM_BASE_URL') ?? 'https://api.deepseek.com/v1').replace(/\/$/, '')
  }

  private get apiKey() {
    return this.config.get<string>('LLM_API_KEY') ?? ''
  }

  private get model() {
    return this.config.get<string>('LLM_MODEL') ?? 'deepseek-chat'
  }
}
