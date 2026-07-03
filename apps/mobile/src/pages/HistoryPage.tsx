import { Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { useHistoryStore } from '../stores/historyStore'
import PageShell from './PageShell'

export default function HistoryPage() {
  const records = useHistoryStore((state) => state.records)
  const removeRecord = useHistoryStore((state) => state.removeRecord)

  return (
    <PageShell>
      <h1 className="text-2xl font-black">历史记录</h1>
      <p className="mt-2 text-sm text-ink/60">Phase 1 暂用本地缓存，后续切换到 MySQL。</p>
      <div className="mt-5 grid gap-3">
        {records.length ? records.map((record) => (
          <LiquidGlassCard key={record.id} interactive>
            <div className="flex items-center justify-between p-4">
              <Link className="min-w-0 flex-1" to={`/detail/${record.id}`}>
                <p className="truncate font-bold">{record.title}</p>
                <p className="mt-1 text-xs text-ink/54">{record.type === 'text-memory' ? '文本记忆' : '单词卡片'} · {new Date(record.createdAt).toLocaleString()}</p>
              </Link>
              <button className="rounded-full p-3 text-coral" onClick={() => removeRecord(record.id)} aria-label="删除历史">
                <Trash2 className="h-4 w-4" />
              </button>
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
