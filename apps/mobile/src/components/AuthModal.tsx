import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import GlassButton from './GlassButton'
import LiquidGlassCard from './LiquidGlassCard'

export default function AuthModal() {
  const { isAuthOpen, closeAuth, login } = useAuthStore()
  const [phone, setPhone] = useState('13800000000')
  const [code, setCode] = useState('123456')
  const [error, setError] = useState('')

  if (!isAuthOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-ink/28 p-4 pb-[calc(16px+env(safe-area-inset-bottom))] backdrop-blur-sm">
      <LiquidGlassCard className="w-full">
        <div className="p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">登录后开始生成</h2>
              <p className="mt-1 text-sm text-ink/62">生成结果会自动保存到你的历史记录。</p>
            </div>
            <button className="rounded-full p-2" onClick={closeAuth} aria-label="关闭登录弹窗">
              <X className="h-5 w-5" />
            </button>
          </div>
          <label className="form-label">测试手机号</label>
          <input className="form-input" value={phone} onChange={(event) => setPhone(event.target.value)} />
          <label className="form-label mt-4">验证码</label>
          <input className="form-input" value={code} onChange={(event) => setCode(event.target.value)} />
          {error ? <p className="mt-3 text-sm text-coral">{error}</p> : null}
          <GlassButton
            className="mt-5 w-full"
            onClick={() => {
              const ok = login(phone, code)
              setError(ok ? '' : '请使用测试手机号 13800000000 和验证码 123456')
            }}
          >
            登录并继续
          </GlassButton>
        </div>
      </LiquidGlassCard>
    </div>
  )
}
