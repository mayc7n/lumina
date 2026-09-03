'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from 'lucide-react'
import { authApi } from '@/lib/api/client'
import { getApiErrorMessage } from '@/lib/api/errors'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const strength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }, [password])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!token) {
      setError('O link de redefinição está ausente ou inválido. Solicite um novo link.')
      return
    }

    if (password.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não conferem.')
      return
    }

    setIsSubmitting(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        'Não foi possível redefinir a senha. O link pode ter expirado; solicite um novo.',
      ))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (done) {
    return (
      <>
        <div className="mb-8">
          <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-success-muted text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-sm font-medium text-brand">Senha atualizada</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Seu acesso foi recuperado</h1>
          <p className="mt-3 text-sm leading-6 text-foreground-muted">
            Use sua nova senha para entrar no Lumina. Por segurança, mantenha-a única e não reutilize senhas antigas.
          </p>
        </div>
        <Link href="/auth/login" className="btn-primary flex h-11 w-full items-center justify-center rounded-xl text-base font-medium">
          Entrar com nova senha
        </Link>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand">Nova senha</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Redefina seu acesso</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-muted">
          Crie uma senha forte para proteger sua conta e manter seus dados pessoais seguros.
        </p>
      </div>

      {!token && (
        <p role="alert" className="mb-5 rounded-lg border border-warning/20 bg-warning-muted px-3 py-2.5 text-sm text-warning">
          Link inválido ou incompleto. Solicite uma nova recuperação de senha.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <PasswordInput
          id="password"
          label="Nova senha"
          autoComplete="new-password"
          value={password}
          show={showPassword}
          onChange={setPassword}
          onToggleShow={() => setShowPassword(value => !value)}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirmar senha"
          autoComplete="new-password"
          value={confirmPassword}
          show={showPassword}
          onChange={setConfirmPassword}
          onToggleShow={() => setShowPassword(value => !value)}
        />

        <div className="rounded-xl border border-border bg-background-overlay p-3">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="font-medium text-foreground-muted">Força da senha</span>
            <span className={cn('font-semibold', strength >= 3 ? 'text-success' : strength >= 2 ? 'text-warning' : 'text-danger')}>
              {strength >= 3 ? 'Boa' : strength >= 2 ? 'Média' : 'Fraca'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className={cn('h-1.5 rounded-full', index < strength ? 'bg-brand' : 'bg-border')} />
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-foreground-subtle">
            Use pelo menos 8 caracteres. Letras maiúsculas, números e símbolos aumentam a segurança.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} disabled={!token || !password || !confirmPassword} className="h-11 w-full">
          Redefinir senha
        </Button>

        <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar para login
        </Link>
      </form>
    </>
  )
}

function PasswordInput({
  id,
  label,
  autoComplete,
  value,
  show,
  onChange,
  onToggleShow,
}: {
  id: string
  label: string
  autoComplete: string
  value: string
  show: boolean
  onChange: (value: string) => void
  onToggleShow: () => void
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative">
        {id === 'password'
          ? <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
          : <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
        }
        <input
          id={id}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          required
          minLength={8}
          maxLength={128}
          value={value}
          onChange={event => onChange(event.target.value)}
          className="input-base h-11 px-10"
          placeholder="Digite sua senha"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-subtle transition-colors hover:text-foreground"
          aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}
