import { useState } from 'react'
import { Link } from 'react-router-dom'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { APP_VERSION } from '../constants/app'
import { deleteAccount } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useHistoryStore } from '../stores/historyStore'
import { getUserFacingErrorMessage } from '../utils/apiError'
import PageShell from './PageShell'

export default function SettingsPage() {
  const [confirmAction, setConfirmAction] = useState<'clear-cache' | 'delete-account' | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const clearRecords = useHistoryStore((state) => state.clearRecords)

  function clearCache() {
    setError('')
    localStorage.removeItem('memory-palace-history')
    clearRecords()
    setConfirmAction(null)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setError('')
    try {
      if (token && token !== 'local-mock-token') {
        await deleteAccount(token)
      }
      clearCache()
      logout()
    } catch (error) {
      setError(getUserFacingErrorMessage(error, '删除账号失败，请稍后重试'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black">我的</h1>
      {error ? <p className="mt-3 text-sm text-coral" data-testid="settings-error">{error}</p> : null}
      <div className="mt-5 grid gap-3">
        <LiquidGlassCard>
          <div className="p-4">
            <p className="text-sm font-bold">账号</p>
            <p className="mt-1 text-sm text-ink/60">{user ? `${user.nickname} · ${user.phone}` : '未登录'}</p>
            {user?.remainingCredits !== undefined ? (
              <p className="mt-2 text-xs font-semibold text-ink/50">剩余生成次数：{user.remainingCredits}</p>
            ) : null}
          </div>
        </LiquidGlassCard>
        {confirmAction ? (
          <LiquidGlassCard>
            <div className="p-4">
              <p className="text-sm font-bold">{confirmAction === 'delete-account' ? '确认删除账号？' : '确认清除缓存？'}</p>
              <p className="mt-2 text-sm leading-6 text-ink/60">
                {confirmAction === 'delete-account'
                  ? '这会删除当前账号、历史记录和本地缓存。操作完成后需要重新登录。'
                  : '这会清除本机保存的历史缓存，不会删除后端账号。'}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <GlassButton variant="secondary" onClick={() => setConfirmAction(null)}>取消</GlassButton>
                <GlassButton
                  loading={deleting}
                  onClick={() => confirmAction === 'delete-account' ? void handleDeleteAccount() : clearCache()}
                >
                  确认
                </GlassButton>
              </div>
            </div>
          </LiquidGlassCard>
        ) : null}
        <GlassButton variant="secondary" onClick={() => setConfirmAction('clear-cache')}>清除缓存</GlassButton>
        <GlassButton variant="secondary" onClick={() => setConfirmAction('delete-account')}>删除账号与历史数据</GlassButton>
        <div className="grid gap-2">
          <Link className="settings-link" to="/privacy">隐私政策</Link>
          <Link className="settings-link" to="/terms">用户协议</Link>
          <Link className="settings-link" to="/about">关于我们</Link>
        </div>
        <p className="text-center text-xs text-ink/42">忆境 MemoryPalace v{APP_VERSION}</p>
      </div>
    </PageShell>
  )
}
