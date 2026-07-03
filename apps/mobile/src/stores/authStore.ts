import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  nickname: string
  phone: string
}

interface AuthState {
  user: User | null
  pendingAction: (() => void) | null
  isAuthOpen: boolean
  openAuth: (afterLogin?: () => void) => void
  closeAuth: () => void
  login: (phone: string, code: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      pendingAction: null,
      isAuthOpen: false,
      openAuth: (afterLogin) => set({ isAuthOpen: true, pendingAction: afterLogin ?? null }),
      closeAuth: () => set({ isAuthOpen: false, pendingAction: null }),
      login: (phone, code) => {
        if (phone !== '13800000000' || code !== '123456') return false
        set({ user: { id: 'test-user', nickname: '测试用户', phone }, isAuthOpen: false })
        get().pendingAction?.()
        set({ pendingAction: null })
        return true
      },
      logout: () => set({ user: null }),
    }),
    { name: 'memory-palace-auth' },
  ),
)
