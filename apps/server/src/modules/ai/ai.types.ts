export interface TextMemoryPlan {
  title: string
  contentType: 'ancient_text' | 'modern_text'
  templateId: string
  points: Array<{
    id: number
    originalText: string
    keyword: string
    memoryMethod: 'meaning' | 'homophone' | 'glyph' | 'action' | 'emotion' | 'logic' | 'mixed'
    visualObject: string
    reason: string
    anchorKey: string
    label: string
  }>
  explanation: string
  recitationHint: string
}

export interface WordCardPlan {
  title: string
  templateId: string
  words: Array<{
    id: number
    word: string
    partOfSpeech: string
    phonetic?: string
    chinese?: string
    example?: string
    wordType: 'concrete' | 'abstract' | 'action' | 'emotion' | 'scene'
    visualObject: string
    memoryHint?: string
    anchorKey: string
  }>
}
