import type { RefObject } from 'react'
import { useState } from 'react'
import { Share2 } from 'lucide-react'
import { shareNodeAsPng, type ExportRatio } from '../services/exportImage'
import GlassButton from './GlassButton'

interface Props {
  targetRef: RefObject<HTMLDivElement | null>
  ratio: ExportRatio
  onError?: (error: unknown) => void
  onStart?: () => void
}

export default function ShareImageButton({ targetRef, ratio, onError, onStart }: Props) {
  const [loading, setLoading] = useState(false)
  return (
    <GlassButton
      variant="secondary"
      loading={loading}
      onClick={async () => {
        if (!targetRef.current) return
        onStart?.()
        setLoading(true)
        try {
          await shareNodeAsPng(targetRef.current, ratio)
        } catch (error) {
          onError?.(error)
        } finally {
          setLoading(false)
        }
      }}
    >
      <Share2 className="h-4 w-4" />
      分享/保存
    </GlassButton>
  )
}
