'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { authApi } from '@/lib/api/client'
import { getApiErrorMessage } from '@/lib/api/errors'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) return

    setError('')
    setIsSubmitting(true)
    try {
      await authApi.forgotPassword(normalizedEmail)
      setSentTo(normalizedEmail)
    } catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        'Não foi possível solicitar a recuperação agora. Tente novamente em alguns instantes.',
      ))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (sentTo) {
    return (
      <>
        <div className="mb-8">
          <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-success-muted text-success">
            <CheckCircle2 className="size-5" />
          </div>
          <p className="text-sm font-medium text-brand">Verifique seu e-mail</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Enviamos as instruções</h1>
          <p className="mt-3 text-sm leading-6 text-foreground-muted">
            Se existir uma conta para <span className="font-medium text-foreground">{sentTo}</span>, você receberá
            um link seguro para redefinir sua senha. O link expira por segurança.
          </p>
        </div>

        <div className="space-y-3">
          <Button type="button" size="lg" className="h-11 w-full" onClick={() => { setSentTo(''); setEmail(sentTo) }}>
            Reenviar instruções
          </Button>
          <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground">
            <ArrowLeft className="size-4" /> Voltar para login
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand">Recuperar acesso</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em]">Esqueceu sua senha?</h1>
        <p className="mt-2 text-sm leading-6 text-foreground-muted">
          Informe o e-mail da conta. Enviaremos um link seguro para criar uma nova senha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

        {error && (
          <p role="alert" className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2.5 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={isSubmitting} disabled={!email.trim()} className="h-11 w-full">
          Enviar link de recuperação
        </Button>

        <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm font-medium text-foreground-muted hover:text-foreground">
          <ArrowLeft className="size-4" /> Voltar para login
        </Link>
      </form>
    </>
  )
}
