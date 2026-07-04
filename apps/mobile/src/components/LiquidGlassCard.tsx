import LiquidGlass from 'liquid-glass-react'
import type { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  className?: string
  interactive?: boolean
  blur?: number
}

export default function LiquidGlassCard({ children, className = '', interactive = false, blur = 0.08 }: Props) {
  return (
    <div className={`glass-shell transition-transform duration-150 ${interactive ? 'active:scale-[0.99]' : ''} ${className}`}>
      <LiquidGlass
        displacementScale={24}
        blurAmount={blur}
        saturation={135}
        aberrationIntensity={0.9}
        elasticity={interactive ? 0.16 : 0.06}
        cornerRadius={24}
        className="glass-liquid h-full w-full"
        padding="0"
        overLight
      >
        <div className="glass-fallback h-full w-full">{children}</div>
      </LiquidGlass>
    </div>
  )
}
