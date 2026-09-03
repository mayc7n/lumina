'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { migrateLegacySession, usersApi } from '@/lib/api/client'

const PUBLIC = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/auth/2fa']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const { user, setUser, setLoading, logout } = useAuthStore()
  const isPublicRoute = PUBLIC.some(path => pathname?.startsWith(path))

  useEffect(() => {
    let cancelled = false

    async function validateSession() {
      if (user) {
        setChecking(false)
        if (isPublicRoute) router.replace('/dashboard')
        return
      }

      setChecking(true)
      try {
        await migrateLegacySession()
        const currentUser = await usersApi.getMe()
        if (cancelled) return
        setUser(currentUser)
        setChecking(false)
        if (isPublicRoute) router.replace('/dashboard')
      } catch {
        if (cancelled) return
        logout()
        setChecking(false)
        router.replace('/auth/login')
      }
    }

    void validateSession()
    return () => { cancelled = true }
  }, [isPublicRoute, logout, router, setLoading, setUser, user])

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-foreground-muted">
          <div className="flex size-11 items-center justify-center rounded-xl bg-brand text-white shadow-brand-sm">
            <Sparkles size={20} strokeWidth={2.5} />
          </div>
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Carregando seu espaço...</span>
        </div>
      </main>
    )
  }

  return <>{children}</>
}
