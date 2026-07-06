import { appendImagePromptRequirements } from '../../../../../packages/prompts/src/imagePrompt'
import { TEMPLATE_MAP } from '../../../../../packages/shared/src/templates'
import type { MemoryTemplate } from '../../../../../packages/shared/src/types'

const waterMarkText = '忆境 MemoryPalace'

export function createTextMemoryMock(inputText: string, contentType: string, scenePreference: string) {
  const isAncient = contentType === 'ancient_text' || /[；，。]/.test(inputText)
  const desiredCount = textMemoryPointCount(inputText)
  const template = selectTextTemplate({ desiredCount, isAncient, scenePreference })
  const fragments = inputText.replace(/\s+/g, '').split(/[。；;，,、]/).filter(Boolean)
  const count = Math.min(desiredCount, template.maxPoints)
  const now = new Date()
  const points = Array.from({ length: count }, (_, index) => {
    const anchor = template.anchors[index]
    const text = fragments[index] ?? (inputText.slice(index * 18, index * 18 + 18) || '核心句')
    const keyword = text.slice(0, Math.min(4, text.length))
    return {
      id: index + 1,
      originalText: text,
      keyword,
      memoryMethod: index % 2 === 0 ? 'homophone' : 'meaning',
      visualObject: index % 2 === 0 ? `${keyword}联想物` : `${keyword}场景`,
      reason: `把“${keyword}”放到${anchor.name}，形成清晰画面线索，帮助按顺序回忆原文。`,
      anchorKey: anchor.key,
      position: { x: anchor.x, y: anchor.y },
      label: keyword,
    }
  })

  return {
    id: '',
    title: isAncient ? '古文记忆宫殿' : '文本记忆宫殿',
    type: 'text-memory',
    contentType: isAncient ? 'ancient_text' : 'modern_text',
    templateId: template.id,
    backgroundImageUrl: '',
    points,
    explanation: '后端 Mock 阶段生成结构化记忆点，后续由 LLM 和通义万相替换。',
    recitationHint: points.map((point) => point.label).join(' → '),
    imagePrompt: appendImagePromptRequirements('clean learning memory palace background'),
    watermarkText: waterMarkText,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
  }
}

export function createWordCardMock(words: string[], cardMode: 'scene' | 'association' | 'simple' = 'scene') {
  const now = new Date()
  const templateId = cardMode === 'simple' || words.length > 15 ? 'blank_word_card_30' : 'airport_15'
  const template = getTemplate(templateId)
  const normalized = words.map((word) => word.trim()).filter(Boolean)
  return {
    id: '',
    title: cardMode === 'simple' ? '单词信息卡片' : '单词记忆卡片',
    type: 'word-card',
    cardMode,
    templateId,
    backgroundImageUrl: '',
    words: normalized.map((word, index) => {
      const anchor = template.anchors[index]
      const isPhrase = word.includes(' ')
      return {
        id: index + 1,
        word,
        partOfSpeech: isPhrase ? 'phr.' : ['n.', 'v.', 'adj.'][index % 3],
        phonetic: isPhrase ? '' : `/${word.slice(0, 3)}.../`,
        chinese: isPhrase ? '常用短语' : '核心释义',
        example: `Remember ${word} with a clear scene.`,
        wordType: isPhrase ? 'scene' : index % 2 === 0 ? 'concrete' : 'abstract',
        visualObject: isPhrase ? `${word} 场景` : `${word} 对应物体`,
        memoryHint: `把 ${word} 放在${anchor.name}，用位置帮助回忆词性和拼写。`,
        anchorKey: anchor.key,
        position: { x: anchor.x, y: anchor.y },
      }
    }),
    imagePrompt: appendImagePromptRequirements(
      cardMode === 'simple'
        ? 'clean blank vocabulary information card background, soft grid layout, generous whitespace'
        : 'clean vocabulary memory card background',
    ),
    watermarkText: waterMarkText,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
  }
}

function textMemoryPointCount(inputText: string) {
  const length = inputText.replace(/\s+/g, '').length
  if (length <= 120) return clamp(Math.ceil(length / 30), 3, 5)
  if (length <= 280) return clamp(Math.ceil(length / 40) + 1, 5, 8)
  return clamp(Math.floor((length - 281) / 44) + 8, 8, 12)
}

function selectTextTemplate(input: { desiredCount: number; isAncient: boolean; scenePreference: string }) {
  const preferredTemplate = scenePreferenceToTemplate(input.scenePreference)
  if (preferredTemplate && preferredTemplate.maxPoints >= input.desiredCount) return preferredTemplate
  if (preferredTemplate && input.desiredCount <= 9) return preferredTemplate
  if (input.desiredCount > 9) return input.isAncient ? getTemplate('palace_hall_12') : getTemplate('museum_gallery_12')
  return input.isAncient ? getTemplate('ancient_cottage_9') : getTemplate('study_room_9')
}

function scenePreferenceToTemplate(scenePreference: string) {
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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}
