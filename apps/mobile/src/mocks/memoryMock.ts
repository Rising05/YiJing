import { appendImagePromptRequirements } from '@memory-palace/prompts'
import { TEMPLATE_MAP } from '@memory-palace/shared'
import type { MemoryPalaceResult, MemoryTemplate, TextMemoryRequest } from '../types'

/**
 * 根据文本长度计算记忆点数量，对齐 SPEC §7.2 三层规则：
 * - 1-120 字：3-5 个点
 * - 121-280 字：5-8 个点
 * - 281-500 字：8-12 个点
 */
function textMemoryPointCount(inputText: string) {
  const length = inputText.replace(/\s+/g, '').length
  if (length <= 120) return clamp(Math.ceil(length / 30), 3, 5)
  if (length <= 280) return clamp(Math.ceil(length / 40) + 1, 5, 8)
  return clamp(Math.floor((length - 281) / 44) + 8, 8, 12)
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function selectTextTemplate(input: { desiredCount: number; isAncient: boolean; scenePreference: string }): MemoryTemplate {
  const preferredTemplate = scenePreferenceToTemplate(input.scenePreference)
  if (preferredTemplate && preferredTemplate.maxPoints >= input.desiredCount) return preferredTemplate
  if (preferredTemplate && input.desiredCount <= 9) return preferredTemplate
  if (input.desiredCount > 9) return getTemplate(input.isAncient ? 'palace_hall_12' : 'museum_gallery_12')
  return getTemplate(input.isAncient ? 'ancient_cottage_9' : 'study_room_9')
}

function scenePreferenceToTemplate(scenePreference: string): MemoryTemplate | null {
  const map: Record<string, string> = {
    study_room: 'study_room_9',
    classroom: 'classroom_9',
    ancient_cottage: 'ancient_cottage_9',
    palace_hall: 'palace_hall_12',
    street_path: 'street_path_8',
    museum_gallery: 'museum_gallery_12',
  }
  return map[scenePreference] ? getTemplate(map[scenePreference]) : null
}

function getTemplate(templateId: string): MemoryTemplate {
  return TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP.study_room_9
}

export function createMockMemoryResult(request: TextMemoryRequest): MemoryPalaceResult {
  const isAncient = request.contentType === 'ancient_text' || /[；，。]/.test(request.inputText)
  const desiredCount = textMemoryPointCount(request.inputText)
  const template = selectTextTemplate({ desiredCount, isAncient, scenePreference: request.scenePreference })
  const fragments = request.inputText
    .replace(/\s+/g, '')
    .split(/[。；;，,、]/)
    .filter(Boolean)
  const count = Math.min(desiredCount, template.maxPoints)
  const points = Array.from({ length: count }, (_, index) => {
    const anchor = template.anchors[index]
    const text = fragments[index] ?? (request.inputText.slice(index * 18, index * 18 + 18) || '核心句')
    const keyword = text.slice(0, Math.min(4, text.length))
    return {
      id: index + 1,
      originalText: text,
      keyword,
      memoryMethod: index % 2 === 0 ? 'homophone' as const : 'meaning' as const,
      visualObject: index % 2 === 0 ? `${keyword}联想物` : `${keyword}场景`,
      reason: `把"${keyword}"放到${anchor.name}，形成清晰画面线索，帮助按顺序回忆原文。`,
      anchorKey: anchor.key,
      position: { x: anchor.x, y: anchor.y },
      label: keyword,
    }
  })
  const now = new Date()
  return {
    id: `memory-${now.getTime()}`,
    title: isAncient ? '古文记忆宫殿' : '文本记忆宫殿',
    type: 'text-memory',
    contentType: isAncient ? 'ancient_text' : 'modern_text',
    templateId: template.id,
    backgroundImageUrl: '',
    points,
    explanation: 'Mock 阶段用结构化记忆点模拟 LLM 输出，背景用前端生成的无文字学习场景占位。',
    recitationHint: points.map((point) => point.label).join(' → '),
    imagePrompt: appendImagePromptRequirements(template.scenePrompt),
    watermarkText: '忆境 MemoryPalace',
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
  }
}
