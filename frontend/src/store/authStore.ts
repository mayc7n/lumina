import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User } from '@/lib/api/client'

interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  setTokens: (access: string, refresh: string) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    immer(set => ({
      user: null, accessToken: null, refreshToken: null,
      isAuthenticated: false, isLoading: true,
      setUser: user => set(s => { s.user = user; s.isAuthenticated = true; s.isLoading = false }),
      setTokens: (accessToken, refreshToken) => set(s => { s.accessToken = accessToken; s.refreshToken = refreshToken; s.isAuthenticated = true }),
      updateUser: updates => set(s => { if (s.user) Object.assign(s.user, updates) }),
      logout: () => set(s => { s.user = null; s.accessToken = null; s.refreshToken = null; s.isAuthenticated = false; s.isLoading = false }),
      setLoading: v => set(s => { s.isLoading = v }),
    })),
    { name: 'lumina-auth', storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} }), partialize: s => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }) }
  )
)
