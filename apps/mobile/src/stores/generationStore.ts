import { create } from 'zustand'
import type { GenerationResult } from '../types'

interface GenerationState {
  currentResult: GenerationResult | null
  isGenerating: boolean
  setGenerating: (value: boolean) => void
  setCurrentResult: (result: GenerationResult) => void
}

export const useGenerationStore = create<GenerationState>((set) => ({
  currentResult: null,
  isGenerating: false,
  setGenerating: (value) => set({ isGenerating: value }),
  setCurrentResult: (result) => set({ currentResult: result }),
}))
