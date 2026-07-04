import { AlertTriangle } from 'lucide-react'
import LiquidGlassCard from './LiquidGlassCard'

interface Props {
  className?: string
}

export default function AiDisclaimer({ className = '' }: Props) {
  return (
    <LiquidGlassCard className={className}>
      <div className="flex gap-3 p-4 text-xs leading-5 text-ink/58">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
        <p>AI 生成内容仅供学习辅助，可能存在不准确或不完整的情况。请结合教材、课堂内容和权威资料自行核对。</p>
      </div>
    </LiquidGlassCard>
  )
}
