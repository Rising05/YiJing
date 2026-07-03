import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import LoadingGenerate from '../components/LoadingGenerate'
import { createMockMemoryResult } from '../mocks/memoryMock'
import { useAuthStore } from '../stores/authStore'
import { useGenerationStore } from '../stores/generationStore'
import { useHistoryStore } from '../stores/historyStore'
import type { TextMemoryRequest } from '../types'
import PageShell from './PageShell'

export default function TextMemoryPage() {
  const [inputText, setInputText] = useState('道可道，非常道；名可名，非常名。无名，万物之始；有名，万物之母。')
  const [contentType, setContentType] = useState<TextMemoryRequest['contentType']>('auto')
  const [scenePreference, setScenePreference] = useState<TextMemoryRequest['scenePreference']>('auto')
  const [advanced, setAdvanced] = useState(false)
  const [error, setError] = useState('')
  const user = useAuthStore((state) => state.user)
  const openAuth = useAuthStore((state) => state.openAuth)
  const setGenerating = useGenerationStore((state) => state.setGenerating)
  const setCurrentResult = useGenerationStore((state) => state.setCurrentResult)
  const addRecord = useHistoryStore((state) => state.addRecord)
  const isGenerating = useGenerationStore((state) => state.isGenerating)
  const navigate = useNavigate()

  function generate() {
    const trimmed = inputText.trim()
    if (!trimmed) return setError('请输入需要背诵的文本')
    if (trimmed.length > 500) return setError('文本最多 500 字，请缩短后再生成')
    const request = { inputText: trimmed, contentType, scenePreference }
    setError('')
    setGenerating(true)
    window.setTimeout(() => {
      const result = createMockMemoryResult(request)
      setCurrentResult(result)
      addRecord(result)
      setGenerating(false)
      navigate(`/result/${result.id}`)
    }, 520)
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black">文本记忆宫殿</h1>
      <p className="mt-2 text-sm leading-6 text-ink/62">输入古文诗词或现代文，Mock 阶段会生成可导出的记忆结构。</p>
      <div className="mt-5 grid gap-4">
        <LiquidGlassCard>
          <div className="p-4">
            <label className="form-label">背诵文本</label>
            <textarea
              className="form-input min-h-44 resize-none"
              maxLength={500}
              value={inputText}
              onChange={(event) => setInputText(event.target.value)}
            />
            <div className="mt-2 text-right text-xs text-ink/52">{inputText.length}/500</div>
            <label className="form-label mt-3">内容类型</label>
            <select className="form-input" value={contentType} onChange={(event) => setContentType(event.target.value as TextMemoryRequest['contentType'])}>
              <option value="auto">自动判断</option>
              <option value="ancient_text">古文/诗词</option>
              <option value="modern_text">现代文</option>
            </select>
            <button className="mt-3 text-sm font-semibold text-ink/62" onClick={() => setAdvanced((value) => !value)}>
              {advanced ? '收起高级选项' : '展开高级选项'}
            </button>
            {advanced ? (
              <div className="mt-3">
                <label className="form-label">场景偏好</label>
                <select className="form-input" value={scenePreference} onChange={(event) => setScenePreference(event.target.value as TextMemoryRequest['scenePreference'])}>
                  <option value="auto">自动选择</option>
                  <option value="study_room">书房</option>
                  <option value="classroom">教室</option>
                  <option value="ancient_cottage">古风小屋</option>
                  <option value="palace_hall">宫殿大厅</option>
                  <option value="street_path">街道路线</option>
                  <option value="museum_gallery">博物馆展厅</option>
                </select>
              </div>
            ) : null}
            {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
            <GlassButton className="mt-4 w-full" loading={isGenerating} onClick={() => (user ? generate() : openAuth(generate))}>
              生成记忆宫殿
            </GlassButton>
          </div>
        </LiquidGlassCard>
        {isGenerating ? <LoadingGenerate /> : null}
      </div>
    </PageShell>
  )
}
