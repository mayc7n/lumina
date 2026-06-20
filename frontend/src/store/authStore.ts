import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { User } from '@/lib/api/client'

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

const getAuthStorage = (): StateStorage => {
  if (typeof window === 'undefined') return memoryStorage

  return {
    getItem: name => {
      const value = localStorage.getItem(name)
      if (!value) return null

      try {
        JSON.parse(value)
        return value
      } catch {
        localStorage.removeItem(name)
        return null
      }
    },
    setItem: (name, value) => localStorage.setItem(name, value),
    removeItem: name => localStorage.removeItem(name),
  }
}

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
    {
      name: 'lumina-auth',
      storage: createJSONStorage(getAuthStorage),
      partialize: s => ({ accessToken: s.accessToken, refreshToken: s.refreshToken }),
    }
  )
)
