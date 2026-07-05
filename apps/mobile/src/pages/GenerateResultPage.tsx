import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AiDisclaimer from '../components/AiDisclaimer'
import ExportImageButton from '../components/ExportImageButton'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import MemoryPalaceCanvas from '../components/MemoryPalaceCanvas'
import ShareImageButton from '../components/ShareImageButton'
import WordMemoryCard from '../components/WordMemoryCard'
import { createMockMemoryResult } from '../mocks/memoryMock'
import { createMockWordResult } from '../mocks/wordMock'
import { ApiError, regenerateGeneration } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useGenerationStore } from '../stores/generationStore'
import { useHistoryStore } from '../stores/historyStore'
import type { ExportRatio } from '../services/exportImage'
import type { GenerationResult } from '../types'
import { getUserFacingErrorMessage, shouldOpenAuthForError } from '../utils/apiError'
import PageShell from './PageShell'

export default function GenerateResultPage() {
  const { id = '' } = useParams()
  const currentResult = useGenerationStore((state) => state.currentResult)
  const setCurrentResult = useGenerationStore((state) => state.setCurrentResult)
  const getRecord = useHistoryStore((state) => state.getRecord)
  const addRecord = useHistoryStore((state) => state.addRecord)
  const result = useMemo(() => currentResult?.id === id ? currentResult : getRecord(id), [currentResult, getRecord, id])
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const openAuth = useAuthStore((state) => state.openAuth)
  const consumeCredit = useAuthStore((state) => state.consumeCredit)
  const setRemainingCredits = useAuthStore((state) => state.setRemainingCredits)
  const exportRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const [ratio, setRatio] = useState<ExportRatio>('9:16')
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState('')

  function createLocalRegeneration(source: GenerationResult) {
    if (source.type === 'text-memory') {
      return createMockMemoryResult({
        inputText: source.points.map((point) => point.originalText).join('。'),
        contentType: source.contentType,
        scenePreference: 'auto',
      })
    }
    return createMockWordResult({
      words: source.words.map((word) => word.word),
      theme: 'auto',
      cardMode: inferWordCardMode(source),
    })
  }

  async function regenerate() {
    if (!result) return
    if (!user) return
    if (user.remainingCredits !== undefined && user.remainingCredits <= 0) {
      setError('生成次数不足，请稍后补充次数')
      return
    }
    setError('')
    setRegenerating(true)
    try {
      const nextResult = token && token !== 'local-mock-token'
        ? await regenerateGeneration(token, result.id).catch((error) => {
            if (error instanceof ApiError) throw error
            if (!consumeCredit()) throw new ApiError('生成次数不足，请稍后补充次数。', 'INSUFFICIENT_CREDITS')
            return createLocalRegeneration(result)
          })
        : (() => {
            if (!consumeCredit()) throw new ApiError('生成次数不足，请稍后补充次数。', 'INSUFFICIENT_CREDITS')
            return createLocalRegeneration(result)
          })()
      if (nextResult.credits) setRemainingCredits(nextResult.credits.remaining)
      setCurrentResult(nextResult)
      addRecord(nextResult)
      navigate(`/result/${nextResult.id}`)
    } catch (error) {
      if (shouldOpenAuthForError(error)) openAuth(regenerate)
      setError(getUserFacingErrorMessage(error, '重新生成失败，请稍后重试'))
    } finally {
      setRegenerating(false)
    }
  }

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
      <div data-testid="result-page" className="sr-only">生成结果页面</div>
      <h1 className="text-2xl font-black">{result.title}</h1>
      <p className="mt-2 text-sm text-ink/60">已自动保存到历史记录。</p>
      {error ? <p className="mt-3 text-sm text-coral" data-testid="result-error">{error}</p> : null}
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
        <ShareImageButton targetRef={exportRef} ratio={ratio} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link to={`/detail/${result.id}`}>
          <GlassButton className="w-full" variant="secondary">查看详情</GlassButton>
        </Link>
        <GlassButton className="w-full" loading={regenerating} onClick={() => (user ? void regenerate() : openAuth())}>
          重新生成
        </GlassButton>
      </div>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-black">记忆详情</h2>
        <div className="grid gap-3">
          <AiDisclaimer />
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

function inferWordCardMode(result: Extract<GenerationResult, { type: 'word-card' }>) {
  if (result.cardMode) return result.cardMode
  return result.templateId === 'blank_word_card_30' ? 'simple' : 'scene'
}
