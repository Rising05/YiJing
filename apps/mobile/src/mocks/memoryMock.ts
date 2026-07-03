import { getTemplate } from '../templates/memoryTemplates'
import type { MemoryPalaceResult, TextMemoryRequest } from '../types'
import { anchorPosition } from '../utils/anchor'

export function createMockMemoryResult(request: TextMemoryRequest): MemoryPalaceResult {
  const templateId = request.scenePreference === 'ancient_cottage' || request.contentType === 'ancient_text' ? 'ancient_cottage_9' : 'study_room_9'
  const template = getTemplate(templateId)
  const fragments = request.inputText
    .replace(/\s+/g, '')
    .split(/[。；;，,、]/)
    .filter(Boolean)
  const count = Math.min(Math.max(Math.ceil(request.inputText.length / 60), 3), 8)
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
      reason: `把“${keyword}”放到${anchor.name}，形成清晰画面线索，帮助按顺序回忆原文。`,
      anchorKey: anchor.key,
      position: anchorPosition(template.anchors, anchor.key),
      label: keyword,
    }
  })
  const now = new Date()
  return {
    id: `memory-${now.getTime()}`,
    title: request.contentType === 'ancient_text' ? '古文记忆宫殿' : '文本记忆宫殿',
    type: 'text-memory',
    contentType: request.contentType === 'modern_text' ? 'modern_text' : 'ancient_text',
    templateId,
    backgroundImageUrl: '',
    points,
    explanation: 'Mock 阶段用结构化记忆点模拟 LLM 输出，背景用前端生成的无文字学习场景占位。',
    recitationHint: points.map((point) => point.label).join(' → '),
    imagePrompt: `${template.scenePrompt}; no text, no numbers, no labels, no watermark, no UI elements`,
    watermarkText: '忆境 MemoryPalace',
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
  }
}
