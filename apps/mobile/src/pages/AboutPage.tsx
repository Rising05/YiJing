import LiquidGlassCard from '../components/LiquidGlassCard'
import PageShell from './PageShell'

export default function AboutPage() {
  return (
    <PageShell>
      <h1 className="text-2xl font-black">关于忆境</h1>
      <LiquidGlassCard className="mt-5">
        <div className="p-4 text-sm leading-7 text-ink/66">
          忆境 MemoryPalace 是一个 AI 记忆辅助 App，帮助学生把难背内容转成视觉记忆结构。AI 生成内容仅供学习辅助，可能存在不准确或不完整的情况，请结合教材、课堂内容和权威资料自行核对。
        </div>
      </LiquidGlassCard>
    </PageShell>
  )
}
