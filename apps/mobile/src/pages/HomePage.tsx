import { ArrowRight, BookOpen, Sparkles, Type } from 'lucide-react'
import { Link } from 'react-router-dom'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { useAuthStore } from '../stores/authStore'
import { useHistoryStore } from '../stores/historyStore'
import PageShell from './PageShell'

export default function HomePage() {
  const records = useHistoryStore((state) => state.records)
  const user = useAuthStore((state) => state.user)

  return (
    <PageShell>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ink/54">{user ? `${user.nickname}，欢迎回来` : '游客预览模式'}</p>
          <h1 className="mt-1 text-3xl font-black tracking-normal">今天要记什么？</h1>
          {user?.remainingCredits !== undefined ? (
            <p className="mt-2 text-xs font-bold text-ink/50">剩余生成 {user.remainingCredits} 次</p>
          ) : null}
        </div>
        <Sparkles className="h-8 w-8 text-coral" />
      </div>
      <p className="mb-5 text-sm leading-6 text-ink/62">把难背的内容变成一张能看懂的记忆图。</p>

      <div className="grid gap-4">
        <Link className="block" to="/text-memory">
          <LiquidGlassCard interactive>
            <div className="p-5">
              <BookOpen className="h-7 w-7 text-leaf" />
              <h2 className="mt-4 text-xl font-black">文本记忆宫殿</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">适合古文诗词、现代文背诵，把段落拆成记忆路线。</p>
              <GlassButton className="mt-4 w-full">
                开始生成 <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </div>
          </LiquidGlassCard>
        </Link>
        <Link className="block" to="/word-card">
          <LiquidGlassCard interactive>
            <div className="p-5">
              <Type className="h-7 w-7 text-coral" />
              <h2 className="mt-4 text-xl font-black">单词记忆卡片</h2>
              <p className="mt-2 text-sm leading-6 text-ink/60">最多 30 个单词或短语，图上显示英文和词性。</p>
              <GlassButton className="mt-4 w-full" variant="secondary">
                生成单词卡片 <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </div>
          </LiquidGlassCard>
        </Link>
      </div>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black">最近生成</h2>
          <Link className="text-sm font-semibold text-ink/55" to="/history">
            查看全部
          </Link>
        </div>
        {records.length ? (
          <div className="grid gap-3">
            {records.slice(0, 3).map((record) => (
              <Link className="block" key={record.id} to={`/detail/${record.id}`}>
                <LiquidGlassCard interactive>
                  <div className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-bold">{record.title}</p>
                      <p className="mt-1 text-xs text-ink/56">{new Date(record.createdAt).toLocaleString()}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-ink/42" />
                  </div>
                </LiquidGlassCard>
              </Link>
            ))}
          </div>
        ) : (
          <LiquidGlassCard>
            <div className="p-5 text-sm text-ink/58">生成结果会自动出现在这里。</div>
          </LiquidGlassCard>
        )}
      </section>
    </PageShell>
  )
}
