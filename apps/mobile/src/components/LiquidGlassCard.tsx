import LiquidGlass from 'liquid-glass-react'
import type { PropsWithChildren } from 'react'

interface Props extends PropsWithChildren {
  className?: string
  interactive?: boolean
  blur?: number
  displacementScale?: number
  aberrationIntensity?: number
  elasticity?: number
}

export default function LiquidGlassCard({
  children,
  className = '',
  interactive = false,
  blur = 0.08,
  displacementScale = 14,
  aberrationIntensity = 0.45,
  elasticity,
}: Props) {
  return (
    <div className={`glass-shell min-w-0 transition-transform duration-150 ${interactive ? 'active:scale-[0.99]' : ''} ${className}`}>
      <div className="glass-effect-layer" aria-hidden="true">
        <LiquidGlass
          displacementScale={displacementScale}
          blurAmount={blur}
          saturation={135}
          aberrationIntensity={aberrationIntensity}
          elasticity={elasticity ?? (interactive ? 0.08 : 0.03)}
          cornerRadius={24}
          className="glass-liquid h-full w-full"
          padding="0"
          style={{ position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%' }}
          overLight
        >
          <span className="glass-effect-fill" aria-hidden="true" />
        </LiquidGlass>
      </div>
      <div className="glass-fallback">{children}</div>
    </div>
  )
}
