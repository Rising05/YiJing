import { Link } from 'react-router-dom'
import GlassButton from '../components/GlassButton'
import LiquidGlassCard from '../components/LiquidGlassCard'
import { useAuthStore } from '../stores/authStore'
import { useHistoryStore } from '../stores/historyStore'
import PageShell from './PageShell'

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const clearRecords = useHistoryStore((state) => state.clearRecords)

  function clearCache() {
    localStorage.removeItem('memory-palace-history')
    clearRecords()
  }

  return (
    <PageShell>
      <h1 className="text-2xl font-black">我的</h1>
      <div className="mt-5 grid gap-3">
        <LiquidGlassCard>
          <div className="p-4">
            <p className="text-sm font-bold">账号</p>
            <p className="mt-1 text-sm text-ink/60">{user ? `${user.nickname} · ${user.phone}` : '未登录'}</p>
          </div>
        </LiquidGlassCard>
        <GlassButton variant="secondary" onClick={clearCache}>清除缓存</GlassButton>
        <GlassButton variant="secondary" onClick={() => { clearCache(); logout() }}>删除测试账号与本地历史</GlassButton>
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
