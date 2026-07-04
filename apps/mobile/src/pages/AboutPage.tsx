import AiDisclaimer from '../components/AiDisclaimer'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { APP_VERSION } from '../constants/app'
import PageShell from './PageShell'

export default function AboutPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-black">关于忆境</h1>
      <LiquidGlassCard className="mt-5">
        <div className="p-4 text-sm leading-7 text-ink/66">
          忆境 MemoryPalace 是一个 AI 记忆辅助 App，帮助学生把难背内容转成视觉记忆结构。
          <p className="mt-3 text-xs font-semibold text-ink/42">当前版本 v{APP_VERSION}</p>
        </div>
      </LiquidGlassCard>
      <AiDisclaimer className="mt-3" />
    </PageShell>
  )
}
