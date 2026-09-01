import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { User } from '@/lib/api/client'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
  setLoading: (v: boolean) => void
}

export const useAuthStore = create<AuthStore>()(immer(set => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: user => set(s => { s.user = user; s.isAuthenticated = true; s.isLoading = false }),
  updateUser: updates => set(s => { if (s.user) Object.assign(s.user, updates) }),
  logout: () => set(s => { s.user = null; s.isAuthenticated = false; s.isLoading = false }),
  setLoading: value => set(s => { s.isLoading = value }),
})))
