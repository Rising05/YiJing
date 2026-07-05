import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GenerationResult } from '../types'

const now = () => Date.now()

interface HistoryState {
  records: GenerationResult[]
  addRecord: (record: GenerationResult) => void
  removeRecord: (id: string) => void
  setFavorite: (id: string, isFavorite: boolean) => void
  clearRecords: () => void
  getRecord: (id: string) => GenerationResult | undefined
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({
          records: [record, ...pruneExpiredRecords(state.records).filter((item) => item.id !== record.id)],
        })),
      removeRecord: (id) => set((state) => ({ records: state.records.filter((item) => item.id !== id) })),
      setFavorite: (id, isFavorite) =>
        set((state) => ({
          records: pruneExpiredRecords(state.records).map((item) => item.id === id ? { ...item, isFavorite } : item),
        })),
      clearRecords: () => set({ records: [] }),
      getRecord: (id) => {
        const records = pruneExpiredRecords(get().records)
        if (records.length !== get().records.length) set({ records })
        return records.find((item) => item.id === id)
      },
    }),
    {
      name: 'memory-palace-history',
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<HistoryState>),
        records: pruneExpiredRecords((persistedState as Partial<HistoryState>)?.records ?? []),
      }),
    },
  ),
)

function pruneExpiredRecords(records: GenerationResult[]) {
  return records.filter((record) => !isExpired(record))
}

function isExpired(record: GenerationResult) {
  const expiresAt = new Date(record.expiresAt).getTime()
  if (Number.isNaN(expiresAt)) return false
  return expiresAt <= now()
}
