'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { authApi, usersApi } from '@/lib/api/client'
import { getApiErrorMessage } from '@/lib/api/errors'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const setTokens = useAuthStore(state => state.setTokens)
  const setUser = useAuthStore(state => state.setUser)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!/^[a-z0-9_]{3,50}$/.test(username)) {
      setError('O usuário deve ter de 3 a 50 caracteres, usando letras minúsculas, números ou _.')
      return
    }

    setIsSubmitting(true)
    try {
      const tokens = await authApi.register({ email, username, displayName, password })
      setTokens(tokens.accessToken, tokens.refreshToken)
      const user = await usersApi.getMe()
      setUser(user)
      router.replace('/dashboard')
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        'Não foi possível criar sua conta. Revise os dados e tente novamente.',
      ))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand">Comece agora</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Crie sua conta</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-muted">
          Configure seu espaço em poucos segundos. Sem cartão de crédito.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="displayName" className="text-sm font-medium">Nome</label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
                value={displayName}
                onChange={event => setDisplayName(event.target.value)}
                className="input-base h-11 pl-10"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">Usuário</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground-subtle">@</span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={50}
                pattern="[a-z0-9_]+"
                value={username}
                onChange={event => setUsername(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="input-base h-11 pl-9"
                placeholder="seu_usuario"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">E-mail</label>
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
            <span className="text-xs text-foreground-subtle">8 a 128 caracteres</span>
          </div>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="input-base h-11 px-10"
              placeholder="Crie uma senha segura"
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
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} className="h-11 w-full">
          Criar minha conta
        </Button>

        <p className="text-center text-sm text-foreground-muted">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="font-medium text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </>
  )
}
