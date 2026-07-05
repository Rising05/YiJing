import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { fetchHistoryDetail, toggleHistoryFavorite } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useHistoryStore } from '../stores/historyStore'
import type { GenerationResult, MemoryPalaceResult, WordCardResult } from '../types'
import { getUserFacingErrorMessage } from '../utils/apiError'
import PageShell from './PageShell'

export default function DetailPage() {
  const { id = '' } = useParams()
  const localRecord = useHistoryStore((state) => state.getRecord(id))
  const addRecord = useHistoryStore((state) => state.addRecord)
  const setFavorite = useHistoryStore((state) => state.setFavorite)
  const token = useAuthStore((state) => state.token)
  const [remoteRecord, setRemoteRecord] = useState<GenerationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const record = localRecord ?? remoteRecord

  useEffect(() => {
    if (localRecord || !token || token === 'local-mock-token' || !id) return
    setLoading(true)
    setError('')
    fetchHistoryDetail(token, id)
      .then((result) => {
        setRemoteRecord(result)
        addRecord(result)
      })
      .catch((error) => {
        setRemoteRecord(null)
        setError(getUserFacingErrorMessage(error, '读取历史详情失败'))
      })
      .finally(() => setLoading(false))
  }, [addRecord, id, localRecord, token])

  async function handleFavorite() {
    if (!record) return
    const nextValue = !record.isFavorite
    setError('')
    if (token && token !== 'local-mock-token') {
      let updated: Awaited<ReturnType<typeof toggleHistoryFavorite>>
      try {
        updated = await toggleHistoryFavorite(token, record.id)
      } catch (error) {
        setError(getUserFacingErrorMessage(error, '收藏状态同步失败，请稍后重试'))
        return
      }
      const favoriteValue = updated?.isFavorite ?? nextValue
      setFavorite(record.id, favoriteValue)
      setRemoteRecord((item) => item?.id === record.id ? { ...item, isFavorite: favoriteValue } : item)
      return
    }
    setFavorite(record.id, nextValue)
  }

  if (!record) {
    return (
      <PageShell>
        <LiquidGlassCard>
          <div className="p-5">
            <h1 className="text-xl font-black">{loading ? '正在读取记录' : '记录不存在'}</h1>
            {error ? <p className="mt-3 text-sm leading-6 text-coral" data-testid="detail-error">{error}</p> : null}
            <Link to="/history">
              <GlassButton className="mt-4 w-full">返回历史</GlassButton>
            </Link>
          </div>
        </LiquidGlassCard>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black">{record.title}</h1>
      <p className="mt-2 text-sm text-ink/60">{new Date(record.createdAt).toLocaleString()}</p>
      {error ? <p className="mt-3 text-sm text-coral" data-testid="detail-error">{error}</p> : null}
      <div className="mt-5 grid gap-3">
        <GlassButton variant="secondary" onClick={() => void handleFavorite()}>
          <Star className="h-4 w-4" fill={record.isFavorite ? 'currentColor' : 'none'} />
          {record.isFavorite ? '已收藏' : '收藏'}
        </GlassButton>
        <LiquidGlassCard>
          <div className="p-4">
            <p className="text-sm font-bold">模板</p>
            <p className="mt-1 text-sm text-ink/62">{record.templateId}</p>
            <p className="mt-4 text-sm font-bold">生图 Prompt</p>
            <p className="mt-1 text-sm leading-6 text-ink/62">{record.imagePrompt || '历史摘要暂无 prompt，打开结果页后会读取完整记录。'}</p>
          </div>
        </LiquidGlassCard>
        <Link to={`/result/${record.id}`}>
          <GlassButton className="w-full">查看结果图</GlassButton>
        </Link>
        {record.type === 'text-memory' ? <TextMemoryDetail record={record} /> : <WordCardDetail record={record} />}
      </div>
    </PageShell>
  )
}

function TextMemoryDetail({ record }: { record: MemoryPalaceResult }) {
  return (
    <section className="grid gap-3">
      <h2 className="mt-3 text-lg font-black">记忆点详情</h2>
      {record.points.map((point) => (
        <LiquidGlassCard key={point.id}>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="badge">{point.id}</span>
              <strong>{point.keyword}</strong>
              <span className="text-xs text-ink/50">{point.memoryMethod}</span>
            </div>
            <p className="mt-3 text-xs font-bold text-ink/44">原文片段</p>
            <p className="mt-1 text-sm leading-6 text-ink/68">{point.originalText}</p>
            <p className="mt-3 text-xs font-bold text-ink/44">视觉物体</p>
            <p className="mt-1 text-sm leading-6 text-ink/68">{point.visualObject}</p>
            <p className="mt-3 text-xs font-bold text-ink/44">记忆解释</p>
            <p className="mt-1 text-sm leading-6 text-ink/68">{point.reason}</p>
          </div>
        </LiquidGlassCard>
      ))}
    </section>
  )
}

function WordCardDetail({ record }: { record: WordCardResult }) {
  return (
    <section className="grid gap-3">
      <h2 className="mt-3 text-lg font-black">单词详情</h2>
      {record.words.map((word) => (
        <LiquidGlassCard key={word.id}>
          <div className="p-4">
            <div className="flex items-center gap-2">
              <span className="badge">{word.id}</span>
              <strong>{word.word}</strong>
              <span className="text-xs text-ink/50">{word.partOfSpeech}</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <DetailField label="音标" value={word.phonetic || '-'} />
              <DetailField label="中文" value={word.chinese || '-'} />
            </div>
            <DetailField className="mt-3" label="例句" value={word.example || '-'} />
            <DetailField className="mt-3" label="视觉物体" value={word.visualObject} />
            <DetailField className="mt-3" label="记忆提示" value={word.memoryHint || '-'} />
          </div>
        </LiquidGlassCard>
      ))}
    </section>
  )
}

function DetailField({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-bold text-ink/44">{label}</p>
      <p className="mt-1 text-sm leading-6 text-ink/68">{value}</p>
    </div>
  )
}
