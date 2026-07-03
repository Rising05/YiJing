import LiquidGlass from 'liquid-glass-react'
import type { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  className?: string
  interactive?: boolean
  blur?: number
  opacity?: number
}

export default function LiquidGlassCard({ children, className = '', interactive = false, blur = 0.08 }: Props) {
  return (
    <div className={`glass-shell ${interactive ? 'active:scale-[0.99]' : ''} ${className}`}>
      <LiquidGlass
        displacementScale={42}
        blurAmount={blur}
        saturation={135}
        aberrationIntensity={1.2}
        elasticity={interactive ? 0.22 : 0.08}
        cornerRadius={24}
        className="h-full w-full"
        padding="0"
        overLight
      >
        <div className="glass-fallback h-full w-full">{children}</div>
      </LiquidGlass>
    </div>
  )
}
