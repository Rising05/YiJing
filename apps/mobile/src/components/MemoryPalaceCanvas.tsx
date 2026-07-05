import { forwardRef, useState } from 'react'
import { getTemplate } from '../templates/memoryTemplates'
import type { MemoryPalaceResult } from '../types'
import LabelBubble from './LabelBubble'
import NumberMarker from './NumberMarker'

interface Props {
  result: MemoryPalaceResult
  exportRatio?: '1:1' | '9:16'
}

const MemoryPalaceCanvas = forwardRef<HTMLDivElement, Props>(({ result, exportRatio = '9:16' }, ref) => {
  const [active, setActive] = useState(result.points[0]?.id ?? 1)
  const activePoint = result.points.find((point) => point.id === active)
  const template = getTemplate(result.templateId)

  return (
    <div ref={ref} data-testid="export-stage" className={`export-stage ${exportRatio === '1:1' ? 'aspect-square' : 'aspect-[9/16]'}`}>
      <div className="mock-scene memory-scene">
        <div className="absolute left-4 top-4 rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-ink shadow">
          {template.name}
        </div>
        {result.points.map((point) => (
          <NumberMarker
            key={point.id}
            id={point.id}
            x={point.position.x}
            y={point.position.y}
            active={active === point.id}
            onClick={() => setActive(point.id)}
          />
        ))}
        {activePoint ? <LabelBubble text={activePoint.label} x={activePoint.position.x} y={activePoint.position.y} /> : null}
        <div className="watermark">{result.watermarkText}</div>
      </div>
    </div>
  )
})

MemoryPalaceCanvas.displayName = 'MemoryPalaceCanvas'

export default MemoryPalaceCanvas
