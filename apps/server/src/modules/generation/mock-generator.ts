const waterMarkText = '忆境 MemoryPalace'

const anchors = [
  { key: 'a1', x: 0.22, y: 0.2, name: '左上区域' },
  { key: 'a2', x: 0.5, y: 0.18, name: '顶部中央' },
  { key: 'a3', x: 0.78, y: 0.2, name: '右上区域' },
  { key: 'a4', x: 0.2, y: 0.44, name: '左侧区域' },
  { key: 'a5', x: 0.5, y: 0.46, name: '中央区域' },
  { key: 'a6', x: 0.8, y: 0.44, name: '右侧区域' },
  { key: 'a7', x: 0.22, y: 0.72, name: '左下区域' },
  { key: 'a8', x: 0.5, y: 0.75, name: '底部中央' },
  { key: 'a9', x: 0.78, y: 0.72, name: '右下区域' },
]

const wordAnchors = Array.from({ length: 30 }, (_, index) => ({
  key: `a${index + 1}`,
  x: 0.2 + (index % 3) * 0.3,
  y: 0.12 + Math.floor(index / 3) * 0.08,
  name: `词卡位置${index + 1}`,
}))

export function createTextMemoryMock(inputText: string, contentType: string, scenePreference: string) {
  const isAncient = contentType === 'ancient_text' || /[；，。]/.test(inputText)
  const templateId = scenePreference === 'ancient_cottage' || isAncient ? 'ancient_cottage_9' : 'study_room_9'
  const fragments = inputText.replace(/\s+/g, '').split(/[。；;，,、]/).filter(Boolean)
  const count = Math.min(Math.max(Math.ceil(inputText.length / 60), 3), 8)
  const now = new Date()
  const points = Array.from({ length: count }, (_, index) => {
    const anchor = anchors[index]
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
    templateId,
    backgroundImageUrl: '',
    points,
    explanation: '后端 Mock 阶段生成结构化记忆点，后续由 LLM 和通义万相替换。',
    recitationHint: points.map((point) => point.label).join(' → '),
    imagePrompt: 'clean learning memory palace, no text, no numbers, no labels, no watermark, no UI elements',
    watermarkText: waterMarkText,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
  }
}

export function createWordCardMock(words: string[]) {
  const now = new Date()
  const templateId = words.length > 15 ? 'blank_word_card_30' : 'airport_15'
  const normalized = words.map((word) => word.trim()).filter(Boolean)
  return {
    id: '',
    title: '单词记忆卡片',
    type: 'word-card',
    templateId,
    backgroundImageUrl: '',
    words: normalized.map((word, index) => {
      const anchor = wordAnchors[index]
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
    imagePrompt: 'clean vocabulary memory card background, no text, no numbers, no labels, no watermark, no UI elements',
    watermarkText: waterMarkText,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86400000).toISOString(),
  }
}
