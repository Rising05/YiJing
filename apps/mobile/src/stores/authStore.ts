import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { testLogin } from '../services/api'

interface User {
  id: string
  nickname: string
  phone: string
}

interface AuthState {
  user: User | null
  token: string | null
  pendingAction: (() => void) | null
  isAuthOpen: boolean
  openAuth: (afterLogin?: () => void) => void
  closeAuth: () => void
  login: (phone: string, code: string) => Promise<boolean>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      pendingAction: null,
      isAuthOpen: false,
      openAuth: (afterLogin) => set({ isAuthOpen: true, pendingAction: afterLogin ?? null }),
      closeAuth: () => set({ isAuthOpen: false, pendingAction: null }),
      login: async (phone, code) => {
        if (phone !== '13800000000' || code !== '123456') return false
        try {
          const response = await testLogin(phone, code)
          set({ user: response.user, token: response.token, isAuthOpen: false })
        } catch {
          set({ user: { id: 'test-user', nickname: '测试用户', phone }, token: 'local-mock-token', isAuthOpen: false })
        }
        get().pendingAction?.()
        set({ pendingAction: null })
        return true
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: 'memory-palace-auth' },
  ),
)
