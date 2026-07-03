import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ExportImageButton from '../components/ExportImageButton'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import MemoryPalaceCanvas from '../components/MemoryPalaceCanvas'
import WordMemoryCard from '../components/WordMemoryCard'
import { useGenerationStore } from '../stores/generationStore'
import { useHistoryStore } from '../stores/historyStore'
import type { ExportRatio } from '../services/exportImage'
import PageShell from './PageShell'

export default function GenerateResultPage() {
  const { id = '' } = useParams()
  const currentResult = useGenerationStore((state) => state.currentResult)
  const getRecord = useHistoryStore((state) => state.getRecord)
  const result = useMemo(() => currentResult?.id === id ? currentResult : getRecord(id), [currentResult, getRecord, id])
  const exportRef = useRef<HTMLDivElement>(null)
  const [ratio, setRatio] = useState<ExportRatio>('9:16')

  if (!result) {
    return (
      <PageShell>
        <LiquidGlassCard>
          <div className="p-5">
            <h1 className="text-xl font-black">结果不存在</h1>
            <Link to="/">
              <GlassButton className="mt-4 w-full">返回首页</GlassButton>
            </Link>
          </div>
        </LiquidGlassCard>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black">{result.title}</h1>
      <p className="mt-2 text-sm text-ink/60">已自动保存到历史记录。</p>
      <div className="mt-5">
        {result.type === 'text-memory' ? (
          <MemoryPalaceCanvas ref={exportRef} result={result} exportRatio={ratio} />
        ) : (
          <WordMemoryCard ref={exportRef} result={result} exportRatio={ratio} />
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button className={`segmented ${ratio === '9:16' ? 'segmented-active' : ''}`} onClick={() => setRatio('9:16')}>
          9:16
        </button>
        <button className={`segmented ${ratio === '1:1' ? 'segmented-active' : ''}`} onClick={() => setRatio('1:1')}>
          1:1
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <ExportImageButton targetRef={exportRef} ratio={ratio} />
        <Link to={result.type === 'text-memory' ? '/text-memory' : '/word-card'}>
          <GlassButton className="w-full">重新生成</GlassButton>
        </Link>
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-black">记忆详情</h2>
        <div className="grid gap-3">
          {result.type === 'text-memory'
            ? result.points.map((point) => (
                <LiquidGlassCard key={point.id}>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="badge">{point.id}</span>
                      <strong>{point.keyword}</strong>
                      <span className="text-xs text-ink/50">{point.memoryMethod}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink/64">{point.reason}</p>
                  </div>
                </LiquidGlassCard>
              ))
            : result.words.map((word) => (
                <LiquidGlassCard key={word.id}>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="badge">{word.id}</span>
                      <strong>{word.word}</strong>
                      <span className="text-xs text-ink/50">{word.partOfSpeech}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink/64">{word.memoryHint}</p>
                  </div>
                </LiquidGlassCard>
              ))}
        </div>
      </section>
    </PageShell>
  )
}
