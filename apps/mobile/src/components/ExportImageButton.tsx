import type { RefObject } from 'react'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportNodeToPng, type ExportRatio } from '../services/exportImage'
import GlassButton from './GlassButton'

interface Props {
  targetRef: RefObject<HTMLDivElement | null>
  ratio: ExportRatio
  onError?: (error: unknown) => void
  onStart?: () => void
}

export default function ExportImageButton({ targetRef, ratio, onError, onStart }: Props) {
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
          await exportNodeToPng(targetRef.current, ratio)
        } catch (error) {
          onError?.(error)
        } finally {
          setLoading(false)
        }
      }}
    >
      <Download className="h-4 w-4" />
      导出 PNG
    </GlassButton>
  )
}
