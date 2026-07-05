import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AiService } from '../ai/ai.service'
import { ImageService } from '../image/image.service'
import { PrismaService } from '../prisma/prisma.service'
import { assertSafeLearningContent } from './content-safety'
import { TextMemoryDto } from './dto/text-memory.dto'
import { WordCardDto } from './dto/word-card.dto'

@Injectable()
export class GenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly imageService: ImageService,
  ) {}

  async createTextMemory(userId: string, dto: TextMemoryDto) {
    assertSafeLearningContent(dto.inputText)
    await this.ensureQuota(userId)
    const aiResult = await this.aiService.createTextMemoryResult(dto)
    const result = aiResult.result
    const imageResult = await this.imageService.generateBackground({ prompt: result.imagePrompt })
    result.backgroundImageUrl = imageResult.backgroundImageUrl
    return this.saveRecord(userId, {
      type: 'text-memory',
      title: result.title,
      contentType: result.contentType,
      inputText: dto.inputText,
      inputWords: Prisma.JsonNull,
      templateId: result.templateId,
      result,
      backgroundImageUrl: imageResult.backgroundImageUrl,
      imagePrompt: result.imagePrompt,
      promptUsed: aiResult.promptUsed,
      aiProvider: aiResult.provider,
      aiModel: aiResult.model,
      rawResponse: aiResult.rawResponse ? (aiResult.rawResponse as unknown as Prisma.InputJsonValue) : null,
      imageProvider: imageResult.provider,
      imageModel: imageResult.model,
      imageRawResponse: imageResult.rawResponse ? (imageResult.rawResponse as unknown as Prisma.InputJsonValue) : null,
    })
  }

  async createWordCard(userId: string, dto: WordCardDto) {
    const words = this.normalizeWords(dto.words)
    if (words.length > 30) {
      throw new BadRequestException({ code: 'TOO_MANY_WORDS', message: '一次最多 30 个单词或短语，请减少输入。' })
    }
    assertSafeLearningContent(words.join(' '))
    await this.ensureQuota(userId)
    const aiResult = await this.aiService.createWordCardResult({ ...dto, words })
    const result = aiResult.result
    const imageResult = await this.imageService.generateBackground({ prompt: result.imagePrompt })
    result.backgroundImageUrl = imageResult.backgroundImageUrl
    return this.saveRecord(userId, {
      type: 'word-card',
      title: result.title,
      contentType: null,
      inputText: null,
      inputWords: words,
      templateId: result.templateId,
      result,
      backgroundImageUrl: imageResult.backgroundImageUrl,
      imagePrompt: result.imagePrompt,
      promptUsed: aiResult.promptUsed,
      aiProvider: aiResult.provider,
      aiModel: aiResult.model,
      rawResponse: aiResult.rawResponse ? (aiResult.rawResponse as unknown as Prisma.InputJsonValue) : null,
      imageProvider: imageResult.provider,
      imageModel: imageResult.model,
      imageRawResponse: imageResult.rawResponse ? (imageResult.rawResponse as unknown as Prisma.InputJsonValue) : null,
    })
  }

  async regenerate(userId: string, id: string) {
    const record = await this.prisma.generationRecord.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
    })
    if (!record) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '生成记录不存在' })
    }
    if (record.type === 'text-memory' && record.inputText) {
      return this.createTextMemory(userId, {
        inputText: record.inputText,
        contentType: (record.contentType as TextMemoryDto['contentType']) ?? 'auto',
        scenePreference: 'auto',
      })
    }
    const words = Array.isArray(record.inputWords) ? (record.inputWords as string[]) : []
    return this.createWordCard(userId, { words, theme: 'auto', cardMode: this.inferWordCardMode(record.resultJson) })
  }

  private normalizeWords(input: string[]) {
    const seen = new Set<string>()
    return input
      .map((word) => word.trim())
      .filter(Boolean)
      .filter((word) => {
        const key = word.toLowerCase()
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
  }

  private async ensureQuota(userId: string) {
    const quota = await this.prisma.userQuota.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        remainingCredits: 20,
        usedCredits: 0,
      },
    })
    if (quota.remainingCredits <= 0) {
      throw new BadRequestException({ code: 'INSUFFICIENT_CREDITS', message: '生成次数不足，请稍后补充次数。' })
    }
    return quota
  }

  private inferWordCardMode(resultJson: unknown): WordCardDto['cardMode'] {
    if (resultJson && typeof resultJson === 'object' && !Array.isArray(resultJson)) {
      const result = resultJson as Record<string, unknown>
      if (result.cardMode === 'scene' || result.cardMode === 'association' || result.cardMode === 'simple') {
        return result.cardMode
      }
      if (result.templateId === 'blank_word_card_30') return 'simple'
    }
    return 'scene'
  }

  private async saveRecord(
    userId: string,
    input: {
      type: string
      title: string
      contentType: string | null
      inputText: string | null
      inputWords: Prisma.InputJsonValue | typeof Prisma.JsonNull
      templateId: string
      result: Record<string, unknown>
      backgroundImageUrl: string
      imagePrompt: string
      promptUsed: string
      aiProvider: string
      aiModel: string
      rawResponse: Prisma.InputJsonValue | null
      imageProvider: string
      imageModel: string
      imageRawResponse: Prisma.InputJsonValue | null
    },
  ) {
    const expiresAt = new Date(Date.now() + 30 * 86400000)
    const { record, quota } = await this.prisma.$transaction(async (tx) => {
      const quotaUpdate = await tx.userQuota.updateMany({
        where: { userId, remainingCredits: { gt: 0 } },
        data: {
          remainingCredits: { decrement: 1 },
          usedCredits: { increment: 1 },
        },
      })
      if (quotaUpdate.count !== 1) {
        throw new BadRequestException({ code: 'INSUFFICIENT_CREDITS', message: '生成次数不足，请稍后补充次数。' })
      }

      const record = await tx.generationRecord.create({
        data: {
          userId,
          type: input.type,
          title: input.title,
          contentType: input.contentType,
          inputText: input.inputText,
          inputWords: input.inputWords,
          templateId: input.templateId,
          backgroundImageUrl: input.backgroundImageUrl,
          resultJson: input.result as Prisma.InputJsonValue,
          imagePrompt: input.imagePrompt,
          promptUsed: this.persistedPrompt(input.promptUsed),
          expiresAt,
        },
      })
      await tx.aiUsageLog.create({
        data: {
          userId,
          recordId: record.id,
          provider: input.aiProvider,
          model: input.aiModel,
          status: 'success',
          imageCount: 0,
          rawPrompt: this.rawPromptForLog(input.promptUsed),
          rawResponse: this.rawJsonForLog(input.rawResponse),
        },
      })
      await tx.aiUsageLog.create({
        data: {
          userId,
          recordId: record.id,
          provider: input.imageProvider,
          model: input.imageModel,
          status: 'success',
          imageCount: input.imageProvider === 'mock' ? 0 : 1,
          rawPrompt: this.rawPromptForLog(input.imagePrompt),
          rawResponse: this.rawJsonForLog(input.imageRawResponse),
        },
      })
      const quota = await tx.userQuota.findUniqueOrThrow({ where: { userId } })
      return { record, quota }
    })
    return {
      ...input.result,
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      expiresAt: record.expiresAt.toISOString(),
      credits: {
        remaining: quota.remainingCredits,
        used: quota.usedCredits,
      },
    }
  }

  private persistedPrompt(prompt: string) {
    if (!this.isProduction) return prompt
    return `[redacted:${this.shortHash(prompt)}]`
  }

  private rawPromptForLog(prompt: string) {
    return this.isProduction ? null : prompt
  }

  private rawJsonForLog(value: Prisma.InputJsonValue | null) {
    return this.isProduction ? Prisma.JsonNull : value ?? Prisma.JsonNull
  }

  private shortHash(value: string) {
    let hash = 0
    for (let index = 0; index < value.length; index += 1) {
      hash = Math.imul(31, hash) + value.charCodeAt(index)
      hash |= 0
    }
    return Math.abs(hash).toString(36)
  }

  private get isProduction() {
    return process.env.NODE_ENV === 'production'
  }
}
