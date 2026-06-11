'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { authApi, usersApi } from '@/lib/api/client'
import { getApiErrorMessage } from '@/lib/api/errors'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const setTokens = useAuthStore(state => state.setTokens)
  const setUser = useAuthStore(state => state.setUser)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const tokens = await authApi.login({ email, password })
      setTokens(tokens.accessToken, tokens.refreshToken)
      const user = await usersApi.getMe()
      setUser(user)
      router.replace('/dashboard')
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        'Não foi possível entrar. Verifique suas credenciais e tente novamente.',
      ))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand">Bem-vindo de volta</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Entre na sua conta</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-muted">
          Continue de onde parou e mantenha seu progresso em movimento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={event => setEmail(event.target.value)}
                className="input-base h-11 pl-10"
                placeholder="voce@exemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <span className="text-xs text-foreground-subtle">Mínimo de 8 caracteres</span>
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                minLength={8}
                value={password}
                onChange={event => setPassword(event.target.value)}
                className="input-base h-11 px-10"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle transition-colors hover:text-foreground"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-danger-muted px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" loading={isSubmitting} className="h-11 w-full">
            Entrar
          </Button>

          <p className="text-center text-sm text-foreground-muted">
            Ainda não tem uma conta?{' '}
            <Link href="/auth/register" className="font-medium text-brand hover:underline">
              Criar conta
            </Link>
          </p>
      </form>
    </>
  )
}
