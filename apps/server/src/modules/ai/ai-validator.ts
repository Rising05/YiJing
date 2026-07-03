import { BadRequestException } from '@nestjs/common'
import { getAiTemplate } from './memory-templates'
import { requireArray, requireString } from './json-utils'
import type { TextMemoryPlan, WordCardPlan } from './ai.types'

const memoryMethods = new Set(['meaning', 'homophone', 'glyph', 'action', 'emotion', 'logic', 'mixed'])
const wordTypes = new Set(['concrete', 'abstract', 'action', 'emotion', 'scene'])

export function validateTextMemoryPlan(plan: TextMemoryPlan): TextMemoryPlan {
  requireString(plan.title, 'title')
  requireString(plan.templateId, 'templateId')
  const points = requireArray<TextMemoryPlan['points'][number]>(plan.points, 'points')
  const template = getAiTemplate(plan.templateId)
  if (points.length > template.maxPoints) {
    throw new BadRequestException({ code: 'TEMPLATE_CAPACITY_EXCEEDED', message: '记忆点超过模板容量，请减少输入。' })
  }
  const allowedAnchors = new Map(template.anchors.map((anchor) => [anchor.key, anchor]))
  const used = new Set<string>()
  const normalizedPoints = points.map((point, index) => {
    requireString(point.originalText, `points.${index}.originalText`)
    requireString(point.keyword, `points.${index}.keyword`)
    requireString(point.visualObject, `points.${index}.visualObject`)
    requireString(point.reason, `points.${index}.reason`)
    requireString(point.anchorKey, `points.${index}.anchorKey`)
    requireString(point.label, `points.${index}.label`)
    if (!memoryMethods.has(point.memoryMethod)) {
      throw new BadRequestException({ code: 'AI_SCHEMA_INVALID', message: `非法记忆方法：${point.memoryMethod}` })
    }
    const anchor = allowedAnchors.get(point.anchorKey)
    if (!anchor) {
      throw new BadRequestException({ code: 'AI_ANCHOR_INVALID', message: `非法 anchorKey：${point.anchorKey}` })
    }
    if (used.has(point.anchorKey)) {
      throw new BadRequestException({ code: 'AI_ANCHOR_DUPLICATED', message: `重复 anchorKey：${point.anchorKey}` })
    }
    used.add(point.anchorKey)
    return {
      ...point,
      id: point.id || index + 1,
      position: { x: anchor.x, y: anchor.y },
    }
  })
  return {
    ...plan,
    contentType: plan.contentType === 'modern_text' ? 'modern_text' : 'ancient_text',
    points: normalizedPoints,
    explanation: plan.explanation ?? '',
    recitationHint: plan.recitationHint ?? normalizedPoints.map((point) => point.label).join(' → '),
  } as TextMemoryPlan
}

export function validateWordCardPlan(plan: WordCardPlan): WordCardPlan {
  requireString(plan.title, 'title')
  requireString(plan.templateId, 'templateId')
  const words = requireArray<WordCardPlan['words'][number]>(plan.words, 'words')
  const template = getAiTemplate(plan.templateId)
  if (words.length > template.maxPoints) {
    throw new BadRequestException({ code: 'TEMPLATE_CAPACITY_EXCEEDED', message: '单词数量超过模板容量，请减少输入。' })
  }
  const allowedAnchors = new Map(template.anchors.map((anchor) => [anchor.key, anchor]))
  const used = new Set<string>()
  const normalizedWords = words.map((word, index) => {
    requireString(word.word, `words.${index}.word`)
    requireString(word.partOfSpeech, `words.${index}.partOfSpeech`)
    requireString(word.visualObject, `words.${index}.visualObject`)
    requireString(word.anchorKey, `words.${index}.anchorKey`)
    if (!wordTypes.has(word.wordType)) {
      throw new BadRequestException({ code: 'AI_SCHEMA_INVALID', message: `非法单词类型：${word.wordType}` })
    }
    const anchor = allowedAnchors.get(word.anchorKey)
    if (!anchor) {
      throw new BadRequestException({ code: 'AI_ANCHOR_INVALID', message: `非法 anchorKey：${word.anchorKey}` })
    }
    if (used.has(word.anchorKey)) {
      throw new BadRequestException({ code: 'AI_ANCHOR_DUPLICATED', message: `重复 anchorKey：${word.anchorKey}` })
    }
    used.add(word.anchorKey)
    return {
      ...word,
      id: word.id || index + 1,
      position: { x: anchor.x, y: anchor.y },
    }
  })
  return {
    ...plan,
    words: normalizedWords,
  } as WordCardPlan
}
