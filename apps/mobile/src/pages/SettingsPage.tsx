import { Link } from 'react-router-dom'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { deleteAccount } from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { useHistoryStore } from '../stores/historyStore'
import PageShell from './PageShell'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const logout = useAuthStore((state) => state.logout)
  const clearRecords = useHistoryStore((state) => state.clearRecords)

  function clearCache() {
    localStorage.removeItem('memory-palace-history')
    clearRecords()
  }

  async function handleDeleteAccount() {
    if (token && token !== 'local-mock-token') {
      await deleteAccount(token).catch(() => undefined)
    }
    clearCache()
    logout()
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black">我的</h1>
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
        <GlassButton variant="secondary" onClick={clearCache}>清除缓存</GlassButton>
        <GlassButton variant="secondary" onClick={() => void handleDeleteAccount()}>删除账号与历史数据</GlassButton>
        <div className="grid gap-2">
          <Link className="settings-link" to="/privacy">隐私政策</Link>
          <Link className="settings-link" to="/terms">用户协议</Link>
          <Link className="settings-link" to="/about">关于我们</Link>
        </div>
        <p className="text-center text-xs text-ink/42">忆境 MemoryPalace v0.1.0</p>
      </div>
    </PageShell>
  )
}
