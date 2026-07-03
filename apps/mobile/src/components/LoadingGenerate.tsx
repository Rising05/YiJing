import { Sparkles } from 'lucide-react'
import LiquidGlassCard from './LiquidGlassCard'

export default function LoadingGenerate() {
  return (
    <LiquidGlassCard>
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Sparkles className="h-9 w-9 animate-pulse text-coral" />
        <p className="mt-4 text-lg font-bold">正在搭建记忆场景</p>
        <p className="mt-2 text-sm text-ink/60">Mock 阶段会快速生成结构化结果。</p>
      </div>
    </LiquidGlassCard>
  )
}
