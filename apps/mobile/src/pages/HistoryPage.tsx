import { useEffect, useState } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { deleteHistory, fetchHistory, toggleHistoryFavorite } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useHistoryStore } from '../stores/historyStore'
import type { GenerationResult } from '../types'
import PageShell from './PageShell'

export default function HistoryPage() {
  const localRecords = useHistoryStore((state) => state.records)
  const removeRecord = useHistoryStore((state) => state.removeRecord)
  const setFavorite = useHistoryStore((state) => state.setFavorite)
  const token = useAuthStore((state) => state.token)
  const [remoteRecords, setRemoteRecords] = useState<Array<Pick<GenerationResult, 'id' | 'type' | 'title' | 'templateId' | 'createdAt' | 'expiresAt' | 'isFavorite'>> | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token || token === 'local-mock-token') {
      setRemoteRecords(null)
      return
    }
    setLoading(true)
    fetchHistory(token)
      .then(setRemoteRecords)
      .catch(() => setRemoteRecords(null))
      .finally(() => setLoading(false))
  }, [token])

  const records = remoteRecords ?? localRecords

  async function handleDelete(id: string) {
    if (token && token !== 'local-mock-token') {
      await deleteHistory(token, id).catch(() => undefined)
      setRemoteRecords((items) => items?.filter((item) => item.id !== id) ?? null)
    }
    removeRecord(id)
  }

  async function handleFavorite(id: string, currentValue?: boolean) {
    const nextValue = !currentValue
    if (token && token !== 'local-mock-token') {
      const updated = await toggleHistoryFavorite(token, id).catch(() => null)
      const favoriteValue = updated?.isFavorite ?? nextValue
      setRemoteRecords((items) => items?.map((item) => item.id === id ? { ...item, isFavorite: favoriteValue } : item) ?? null)
      setFavorite(id, favoriteValue)
      return
    }
    setFavorite(id, nextValue)
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black">历史记录</h1>
      <p className="mt-2 text-sm text-ink/60">{token && token !== 'local-mock-token' ? '优先读取后端 MySQL 历史，失败时回退本地缓存。' : '当前使用本地缓存历史。'}</p>
      <div className="mt-5 grid gap-3">
        {loading ? (
          <LiquidGlassCard>
            <div className="p-5 text-sm text-ink/58">正在读取历史记录...</div>
          </LiquidGlassCard>
        ) : records.length ? records.map((record) => (
          <LiquidGlassCard key={record.id} interactive>
            <div className="flex items-center justify-between p-4">
              <Link className="min-w-0 flex-1" to={`/detail/${record.id}`}>
                <p className="truncate font-bold">{record.title}</p>
                <p className="mt-1 text-xs text-ink/54">{record.type === 'text-memory' ? '文本记忆' : '单词卡片'} · {new Date(record.createdAt).toLocaleString()}</p>
              </Link>
              <div className="flex shrink-0 items-center">
                <button
                  className={`rounded-full p-3 ${record.isFavorite ? 'text-coral' : 'text-ink/38'}`}
                  onClick={() => void handleFavorite(record.id, record.isFavorite)}
                  aria-label={record.isFavorite ? '取消收藏' : '收藏历史'}
                >
                  <Star className="h-4 w-4" fill={record.isFavorite ? 'currentColor' : 'none'} />
                </button>
                <button className="rounded-full p-3 text-coral" onClick={() => void handleDelete(record.id)} aria-label="删除历史">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </LiquidGlassCard>
        )) : (
          <LiquidGlassCard>
            <div className="p-5 text-sm text-ink/58">还没有生成记录。</div>
          </LiquidGlassCard>
        )}
      </div>
    </PageShell>
  )
}
