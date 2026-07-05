import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AiDisclaimer from '../components/AiDisclaimer'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import LoadingGenerate from '../components/LoadingGenerate'
import { createMockWordResult } from '../mocks/wordMock'
import { ApiError, createWordCard } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useGenerationStore } from '../stores/generationStore'
import { useHistoryStore } from '../stores/historyStore'
import type { WordCardRequest } from '../types'
import { getUserFacingErrorMessage, shouldOpenAuthForError } from '../utils/apiError'
import { parseWords } from '../utils/wordParser'
import PageShell from './PageShell'

export default function WordCardPage() {
  const [input, setInput] = useState('counter\nluggage\npassport\nboarding gate\nsecurity officer')
  const [cardMode, setCardMode] = useState<WordCardRequest['cardMode']>('scene')
  const [advanced, setAdvanced] = useState(false)
  const [error, setError] = useState('')
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const openAuth = useAuthStore((state) => state.openAuth)
  const consumeCredit = useAuthStore((state) => state.consumeCredit)
  const setRemainingCredits = useAuthStore((state) => state.setRemainingCredits)
  const setGenerating = useGenerationStore((state) => state.setGenerating)
  const setCurrentResult = useGenerationStore((state) => state.setCurrentResult)
  const addRecord = useHistoryStore((state) => state.addRecord)
  const isGenerating = useGenerationStore((state) => state.isGenerating)
  const navigate = useNavigate()
  const words = parseWords(input)

  function generate() {
    if (!words.length) return setError('请输入至少一个单词或短语')
    if (words.length > 30) return setError('一次最多 30 个单词或短语，请减少输入')
    if (user?.remainingCredits !== undefined && user.remainingCredits <= 0) return setError('生成次数不足，请稍后补充次数')
    setError('')
    setGenerating(true)
    window.setTimeout(async () => {
      const request = { words, theme: 'auto' as const, cardMode }
      try {
        const result = token && token !== 'local-mock-token'
          ? await createWordCard(token, request).catch((error) => {
              if (error instanceof ApiError) throw error
              if (!consumeCredit()) throw new ApiError('生成次数不足，请稍后补充次数。', 'QUOTA_EXCEEDED')
              return createMockWordResult(request)
            })
          : (() => {
              if (!consumeCredit()) throw new ApiError('生成次数不足，请稍后补充次数。', 'QUOTA_EXCEEDED')
              return createMockWordResult(request)
            })()
        if (result.credits) setRemainingCredits(result.credits.remaining)
        setCurrentResult(result)
        addRecord(result)
        navigate(`/result/${result.id}`)
      } catch (error) {
        if (shouldOpenAuthForError(error)) openAuth(generate)
        setError(getUserFacingErrorMessage(error, '生成失败，请稍后重试'))
      } finally {
        setGenerating(false)
      }
    }, 520)
  }

  return (
    <PageShell>
      <div data-testid="word-card-page" className="sr-only">单词记忆卡片页面</div>
      <h1 className="text-2xl font-black">单词记忆卡片</h1>
      <p className="mt-2 text-sm leading-6 text-ink/62">支持一行一个，也支持逗号分隔。图上只显示英文和词性。</p>
      <div className="mt-5 grid gap-4">
        <LiquidGlassCard>
          <div className="p-4">
            <label className="form-label">单词或短语</label>
            <textarea className="form-input min-h-52 resize-none" value={input} onChange={(event) => setInput(event.target.value)} />
            <div className="mt-2 text-right text-xs text-ink/52">已识别 {words.length}/30 个</div>
            <button
              className="mt-3 text-sm font-semibold text-ink/62"
              onClick={() => setAdvanced((value) => !value)}
              data-testid="word-card-advanced-toggle"
            >
              {advanced ? '收起高级选项' : '展开高级选项'}
            </button>
            {advanced ? (
              <div className="mt-3">
                <label className="form-label">卡片模式</label>
                <select
                  className="form-input"
                  value={cardMode}
                  onChange={(event) => setCardMode(event.target.value as WordCardRequest['cardMode'])}
                  data-testid="word-card-mode"
                >
                  <option value="scene">场景记忆图</option>
                  <option value="association">联想记忆图</option>
                  <option value="simple">简洁信息卡</option>
                </select>
                <p className="mt-2 text-xs leading-5 text-ink/52">
                  简洁信息卡会优先使用空白词卡模板，适合大量单词和短语。
                </p>
              </div>
            ) : null}
            {error ? <p className="mt-3 text-sm text-coral" data-testid="word-card-error">{error}</p> : null}
            <GlassButton className="mt-4 w-full" loading={isGenerating} onClick={() => (user ? generate() : openAuth(generate))} data-testid="word-card-generate">
              生成单词卡片
            </GlassButton>
          </div>
        </LiquidGlassCard>
        {isGenerating ? <LoadingGenerate /> : null}
        <AiDisclaimer />
      </div>
    </PageShell>
  )
}
