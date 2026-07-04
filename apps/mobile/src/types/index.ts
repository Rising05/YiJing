export type ContentType = 'auto' | 'ancient_text' | 'modern_text' | 'vocabulary'

export type MemoryMethod =
  | 'meaning'
  | 'homophone'
  | 'glyph'
  | 'action'
  | 'emotion'
  | 'logic'
  | 'mixed'

export interface Anchor {
  key: string
  name: string
  description: string
  x: number
  y: number
}

export interface MemoryTemplate {
  id: string
  name: string
  category: 'general' | 'ancient' | 'modern' | 'vocabulary' | 'academic' | 'process'
  scenePrompt: string
  bestFor: ContentType[]
  anchors: Anchor[]
  routePattern: 'clockwise' | 'left_to_right' | 'top_to_bottom' | 'path' | 'center_out'
  maxPoints: number
}

export interface TextMemoryRequest {
  inputText: string
  contentType: 'auto' | 'ancient_text' | 'modern_text'
  scenePreference:
    | 'auto'
    | 'study_room'
    | 'classroom'
    | 'ancient_cottage'
    | 'palace_hall'
    | 'street_path'
    | 'museum_gallery'
}

export interface MemoryPoint {
  id: number
  originalText: string
  keyword: string
  memoryMethod: MemoryMethod
  visualObject: string
  reason: string
  anchorKey: string
  position: { x: number; y: number }
  label: string
}

export interface GenerationCredits {
  remaining: number
  used: number
}

export interface MemoryPalaceResult {
  id: string
  title: string
  type: 'text-memory'
  contentType: 'ancient_text' | 'modern_text'
  templateId: string
  backgroundImageUrl: string
  points: MemoryPoint[]
  explanation: string
  recitationHint: string
  imagePrompt: string
  watermarkText: string
  createdAt: string
  expiresAt: string
  isFavorite?: boolean
  credits?: GenerationCredits
}

export interface WordCardRequest {
  words: string[]
  theme: 'auto'
  cardMode: 'scene' | 'association' | 'simple'
}

export interface WordPoint {
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
  position: { x: number; y: number }
}

export interface WordCardResult {
  id: string
  title: string
  type: 'word-card'
  templateId: string
  backgroundImageUrl: string
  words: WordPoint[]
  imagePrompt: string
  watermarkText: string
  createdAt: string
  expiresAt: string
  isFavorite?: boolean
  credits?: GenerationCredits
}

export type GenerationResult = MemoryPalaceResult | WordCardResult
