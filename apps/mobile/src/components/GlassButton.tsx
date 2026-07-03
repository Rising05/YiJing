import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { Loader2 } from 'lucide-react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'ghost'
}

const variants = {
  primary: 'bg-ink text-white shadow-glass',
  secondary: 'bg-white/60 text-ink border border-white/60',
  ghost: 'bg-transparent text-ink',
}

export default function GlassButton({ children, loading, disabled, variant = 'primary', className = '', ...props }: Props) {
  return (
    <button
      className={`min-h-11 rounded-2xl px-4 py-3 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {children}
      </span>
    </button>
  )
}
