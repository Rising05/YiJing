import { appendImagePromptRequirements } from '@memory-palace/prompts'
import { TEMPLATE_MAP } from '@memory-palace/shared'
import type { MemoryTemplate, WordCardRequest, WordCardResult } from '../types'

const partOfSpeech = ['n.', 'v.', 'adj.', 'phr.']

function getWordTemplate(templateId: string): MemoryTemplate {
  return TEMPLATE_MAP[templateId] ?? TEMPLATE_MAP.blank_word_card_30
}

export function createMockWordResult(request: WordCardRequest): WordCardResult {
  const templateId = request.cardMode === 'simple' || request.words.length > 15 ? 'blank_word_card_30' : 'airport_15'
  const template = getWordTemplate(templateId)
  const now = new Date()
  return {
    id: `word-${now.getTime()}`,
    title: request.cardMode === 'simple' ? '单词信息卡片' : '单词记忆卡片',
    type: 'word-card',
    cardMode: request.cardMode,
    templateId,
    backgroundImageUrl: '',
    words: request.words.map((word, index) => {
      const anchor = template.anchors[index]
      const isPhrase = word.includes(' ')
      return {
        id: index + 1,
        word,
        partOfSpeech: isPhrase ? 'phr.' : partOfSpeech[index % 3],
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
      request.cardMode === 'simple'
        ? 'clean blank vocabulary information card background, soft grid layout, generous whitespace'
        : template.scenePrompt,
    ),
    watermarkText: '忆境 MemoryPalace',
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
  }
}
