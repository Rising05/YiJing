import { forwardRef } from 'react'
import { getTemplate } from '../templates/memoryTemplates'
import type { WordCardResult } from '../types'

interface Props {
  result: WordCardResult
  exportRatio?: '1:1' | '9:16'
}

const WordMemoryCard = forwardRef<HTMLDivElement, Props>(({ result, exportRatio = '9:16' }, ref) => {
  const template = getTemplate(result.templateId)
  return (
    <div ref={ref} data-testid="export-stage" className={`export-stage ${exportRatio === '1:1' ? 'aspect-square' : 'aspect-[9/16]'}`}>
      <div className="mock-scene word-scene">
        <div className="absolute left-4 top-4 rounded-full bg-white/78 px-3 py-1 text-xs font-semibold text-ink shadow">
          {template.name}
        </div>
        {result.words.map((item) => (
          <div
            key={item.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/70 bg-white/82 px-2.5 py-2 text-center shadow"
            style={{ left: `${item.position.x * 100}%`, top: `${item.position.y * 100}%` }}
          >
            <div className="text-xs font-black leading-none">{item.word}</div>
            <div className="mt-1 text-[10px] font-semibold text-ink/60">{item.partOfSpeech}</div>
          </div>
        ))}
        <div className="watermark">{result.watermarkText}</div>
      </div>
    </div>
  )
})

WordMemoryCard.displayName = 'WordMemoryCard'

export default WordMemoryCard
