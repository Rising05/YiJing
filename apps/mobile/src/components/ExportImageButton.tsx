import type { RefObject } from 'react'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { exportNodeToPng, type ExportRatio } from '../services/exportImage'
import GlassButton from './GlassButton'

interface Props {
  targetRef: RefObject<HTMLDivElement | null>
  ratio: ExportRatio
}

export default function ExportImageButton({ targetRef, ratio }: Props) {
  const [loading, setLoading] = useState(false)
  return (
    <GlassButton
      variant="secondary"
      loading={loading}
      onClick={async () => {
        if (!targetRef.current) return
        setLoading(true)
        try {
          await exportNodeToPng(targetRef.current, ratio)
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
