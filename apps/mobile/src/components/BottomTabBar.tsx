import { BookOpen, History, Home, Settings } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/', label: '首页', icon: Home },
  { to: '/text-memory', label: '生成', icon: BookOpen },
  { to: '/history', label: '历史', icon: History },
  { to: '/settings', label: '我的', icon: Settings },
]

export default function BottomTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(10px+env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-md grid-cols-4 rounded-[26px] border border-white/60 bg-white/58 p-2 shadow-glass backdrop-blur-2xl">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex min-h-12 flex-col items-center justify-center gap-1 rounded-2xl text-xs transition ${
                isActive ? 'bg-ink text-white' : 'text-ink/58'
              }`
            }
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
