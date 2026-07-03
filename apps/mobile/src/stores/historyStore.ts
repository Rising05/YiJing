import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GenerationResult } from '../types'

interface HistoryState {
  records: GenerationResult[]
  addRecord: (record: GenerationResult) => void
  removeRecord: (id: string) => void
  clearRecords: () => void
  getRecord: (id: string) => GenerationResult | undefined
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({
          records: [record, ...state.records.filter((item) => item.id !== record.id)],
        })),
      removeRecord: (id) => set((state) => ({ records: state.records.filter((item) => item.id !== id) })),
      clearRecords: () => set({ records: [] }),
      getRecord: (id) => get().records.find((item) => item.id === id),
    }),
    { name: 'memory-palace-history' },
  ),
)
