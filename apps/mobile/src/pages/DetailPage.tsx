import { Link, useParams } from 'react-router-dom'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { useHistoryStore } from '../stores/historyStore'
import PageShell from './PageShell'

export default function DetailPage() {
  const { id = '' } = useParams()
  const record = useHistoryStore((state) => state.getRecord(id))

  if (!record) {
    return (
      <PageShell>
        <LiquidGlassCard>
          <div className="p-5">
            <h1 className="text-xl font-black">记录不存在</h1>
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
      <div className="mt-5 grid gap-3">
        <LiquidGlassCard>
          <div className="p-4">
            <p className="text-sm font-bold">模板</p>
            <p className="mt-1 text-sm text-ink/62">{record.templateId}</p>
            <p className="mt-4 text-sm font-bold">生图 Prompt</p>
            <p className="mt-1 text-sm leading-6 text-ink/62">{record.imagePrompt}</p>
          </div>
        </LiquidGlassCard>
        <Link to={`/result/${record.id}`}>
          <GlassButton className="w-full">查看结果图</GlassButton>
        </Link>
      </div>
    </PageShell>
  )
}
