'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { authApi, usersApi, type UserSession } from '@/lib/api/client'
import { Button } from '@/components/ui/Button'
import {
  CreditCard, Check, Zap, Shield, Trash2,
  Download, AlertTriangle, Bell, BellOff, Loader2, KeyRound,
  MonitorSmartphone, RefreshCw, ShieldCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// ===================================================================
// BillingSection
// ===================================================================

const PLANS = [
  {
    id: 'FREE', label: 'Gratuito', price: 'R$ 0',
    features: ['500 tarefas', '10 hábitos', '5 projetos', 'Analytics básico'],
    color: 'text-foreground-muted', border: 'border-border',
  },
  {
    id: 'PRO', label: 'Pro', price: 'R$ 29', period: '/mês',
    features: ['Tarefas ilimitadas', 'Hábitos ilimitados', 'Projetos ilimitados',
               'Analytics avançado', 'Insights com IA', 'Exportação de dados', 'Suporte prioritário'],
    color: 'text-brand', border: 'border-brand',
    highlight: true,
  },
]

export function BillingSection() {
  const { user } = useAuthStore()
  const isPro = user?.plan !== 'FREE'

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Plano e Cobrança</h2>
        <p className="text-sm text-foreground-muted mt-1">Gerencie sua assinatura do Lumina</p>
      </div>

      {/* Current Plan */}
      <div className="p-4 bg-background-overlay rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-foreground-subtle uppercase tracking-wider mb-1">Plano atual</p>
            <p className="text-lg font-bold">{user?.plan ?? 'FREE'}</p>
          </div>
          {isPro && (
            <div className="flex items-center gap-1.5 text-brand text-sm">
              <Zap className="size-4" />
              Ativo
            </div>
          )}
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLANS.map(plan => (
          <div key={plan.id}
            className={cn('p-5 rounded-xl border-2 relative transition-all', plan.border,
              plan.highlight && 'shadow-brand-sm')}>
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Recomendado
                </span>
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className={cn('text-base font-bold', plan.color)}>{plan.label}</h3>
                <div className="flex items-baseline gap-0.5 mt-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-sm text-foreground-muted">{plan.period}</span>}
                </div>
              </div>
              {user?.plan === plan.id && (
                <span className="badge bg-success-muted text-success text-xs">Atual</span>
              )}
            </div>

            <ul className="space-y-2 mb-5">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-foreground-muted">
                  <Check className="size-3.5 text-success shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            {user?.plan !== plan.id && (
              <Button
                variant={plan.highlight ? 'primary' : 'secondary'}
                size="sm" className="w-full"
                onClick={() => {
                  if (plan.id === 'PRO') {
                    window.location.href = `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/billing/upgrade`
                  }
                }}
              >
                {plan.id === 'PRO' ? 'Fazer upgrade' : 'Downgrade'}
              </Button>
            )}
          </div>
        ))}
      </div>

      {isPro && (
        <div className="p-4 bg-background-overlay rounded-xl border border-border space-y-2">
          <h3 className="text-sm font-semibold">Gerenciar assinatura</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary">
              <CreditCard className="size-3.5" /> Atualizar cartão
            </Button>
            <Button size="sm" variant="ghost" className="text-danger hover:bg-danger-muted">
              Cancelar assinatura
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ===================================================================
// NotificationsSection
// ===================================================================

const NOTIFICATION_SETTINGS = [
  { id: 'task_due',        label: 'Tarefas vencendo',       desc: 'Alertas de tarefas com prazo próximo'    },
  { id: 'habit_reminder',  label: 'Lembretes de hábitos',   desc: 'Lembretes diários dos seus hábitos'     },
  { id: 'goal_checkpoint', label: 'Check-ins de metas',     desc: 'Lembretes de check-in nas suas metas'   },
  { id: 'friend_activity', label: 'Atividade de amigos',    desc: 'Quando amigos conquistas algo'          },
  { id: 'achievement',     label: 'Conquistas',             desc: 'Quando você desbloqueia uma conquista'  },
  { id: 'streak_alert',    label: 'Alerta de streak',       desc: 'Quando seu streak estiver em risco'     },
  { id: 'weekly_review',   label: 'Revisão semanal',        desc: 'Resumo de desempenho toda segunda-feira'},
]

export function NotificationsSection() {
  const [settings, setSettings] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_SETTINGS.map(s => [s.id, true]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    usersApi.getPreferences()
      .then(preferences => {
        if (!active) return
        setSettings(current => ({ ...current, ...preferences.notificationSettings }))
      })
      .catch(() => toast.error('Não foi possível carregar as preferências'))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await usersApi.updatePreferences({ notificationSettings: settings })
      toast.success('Notificações atualizadas!')
    } catch {
      toast.error('Não foi possível salvar as preferências')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Notificações</h2>
        <p className="text-sm text-foreground-muted mt-1">
          Escolha quais notificações você deseja receber
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-foreground-muted">
          <Loader2 className="size-4 animate-spin" /> Carregando preferências...
        </div>
      ) : <div className="space-y-1">
        {NOTIFICATION_SETTINGS.map(setting => (
          <div key={setting.id}
            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-background-overlay transition-colors">
            <div className="flex items-start gap-3">
              <div className={cn('size-8 rounded-lg flex items-center justify-center mt-0.5',
                settings[setting.id] ? 'bg-brand/10' : 'bg-background-overlay')}>
                {settings[setting.id]
                  ? <Bell className="size-4 text-brand" />
                  : <BellOff className="size-4 text-foreground-subtle" />
                }
              </div>
              <div>
                <p className="text-sm font-medium">{setting.label}</p>
                <p className="text-xs text-foreground-muted">{setting.desc}</p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings[setting.id]}
              aria-label={`${setting.label}: ${settings[setting.id] ? 'ativado' : 'desativado'}`}
              onClick={() => setSettings(s => ({ ...s, [setting.id]: !s[setting.id] }))}
              className={cn(
                'relative inline-flex size-11 w-11 h-6 rounded-full transition-colors duration-200 shrink-0',
                settings[setting.id] ? 'bg-brand' : 'bg-background-overlay border border-border'
              )}
            >
              <span className={cn(
                'absolute top-1 size-4 bg-white rounded-full shadow-sm transition-transform duration-200',
                settings[setting.id] ? 'translate-x-6' : 'translate-x-1'
              )} />
            </button>
          </div>
        ))}
      </div>}

      <Button onClick={handleSave} size="sm" loading={saving} disabled={loading}>Salvar preferências</Button>
    </div>
  )
}

// ===================================================================
// SecuritySection
// ===================================================================

export function SecuritySection() {
  const { user } = useAuthStore()
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [revokingId, setRevokingId] = useState('')
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; qrCodeUrl: string } | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [twoFactorLoading, setTwoFactorLoading] = useState(false)

  useEffect(() => {
    let active = true
    setLoadingSessions(true)
    authApi.getSessions()
      .then(data => { if (active) setSessions(Array.isArray(data) ? data : []) })
      .catch(() => toast.error('Não foi possível carregar as sessões'))
      .finally(() => { if (active) setLoadingSessions(false) })
    return () => { active = false }
  }, [])

  async function refreshSessions() {
    setLoadingSessions(true)
    try {
      const data = await authApi.getSessions()
      setSessions(Array.isArray(data) ? data : [])
    } catch {
      toast.error('Não foi possível atualizar as sessões')
    } finally {
      setLoadingSessions(false)
    }
  }

  async function revokeSession(id: string) {
    setRevokingId(id)
    try {
      await authApi.revokeSession(id)
      setSessions(current => current.filter(session => session.id !== id))
      toast.success('Sessão revogada')
    } catch {
      toast.error('Não foi possível revogar a sessão')
    } finally {
      setRevokingId('')
    }
  }

  async function startTwoFactorSetup() {
    setTwoFactorLoading(true)
    try {
      const setup = await authApi.enable2fa()
      setTwoFactorSetup(setup)
    } catch {
      toast.error('Não foi possível iniciar a configuração de 2FA')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  async function confirmTwoFactor() {
    if (twoFactorCode.trim().length < 6) return
    setTwoFactorLoading(true)
    try {
      await authApi.confirm2fa(twoFactorCode.trim())
      setTwoFactorSetup(null)
      setTwoFactorCode('')
      toast.success('Autenticação em duas etapas ativada')
    } catch {
      toast.error('Código inválido ou expirado')
    } finally {
      setTwoFactorLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Segurança</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Proteja sua conta, revise acessos e gerencie métodos de segurança.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <KeyRound className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Senha</h3>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                Redefina sua senha usando um link seguro enviado para seu e-mail.
              </p>
            </div>
          </div>
          <Link href="/auth/forgot-password" className="btn-secondary inline-flex h-8 items-center justify-center rounded-lg px-3 text-xs font-medium">
            Redefinir senha
          </Link>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', user?.twoFactorEnabled ? 'bg-success-muted text-success' : 'bg-background-overlay text-foreground-muted')}>
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Autenticação em duas etapas</h3>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                {user?.twoFactorEnabled
                  ? '2FA está ativado para sua conta.'
                  : 'Adicione uma camada extra de proteção ao entrar.'}
              </p>
            </div>
          </div>

          {user?.twoFactorEnabled ? (
            <span className="badge bg-success-muted text-success text-xs">Ativado</span>
          ) : twoFactorSetup ? (
            <div className="space-y-3">
              {twoFactorSetup.qrCodeUrl && (
                <img src={twoFactorSetup.qrCodeUrl} alt="QR Code para configurar 2FA" className="size-36 rounded-lg border border-border bg-white p-2" />
              )}
              <div>
                <p className="text-xs text-foreground-muted">Chave manual</p>
                <code className="mt-1 block rounded-lg bg-background-overlay px-3 py-2 text-xs text-foreground">{twoFactorSetup.secret}</code>
              </div>
              <div className="flex gap-2">
                <input
                  inputMode="numeric"
                  maxLength={8}
                  value={twoFactorCode}
                  onChange={event => setTwoFactorCode(event.target.value.replace(/\D/g, ''))}
                  className="input-base h-8 min-w-0 flex-1 text-xs"
                  placeholder="Código do app"
                />
                <Button size="sm" loading={twoFactorLoading} disabled={twoFactorCode.length < 6} onClick={confirmTwoFactor}>
                  Confirmar
                </Button>
              </div>
            </div>
          ) : (
            <Button size="sm" variant="secondary" loading={twoFactorLoading} onClick={startTwoFactorSetup}>
              Configurar 2FA
            </Button>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-background-overlay text-foreground-muted">
              <MonitorSmartphone className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Sessões ativas</h3>
              <p className="text-xs text-foreground-muted">Revogue acessos que você não reconhece.</p>
            </div>
          </div>
          <Button size="xs" variant="ghost" onClick={() => void refreshSessions()} loading={loadingSessions}>
            <RefreshCw className="size-3.5" /> Atualizar
          </Button>
        </div>

        {loadingSessions ? (
          <div className="flex items-center gap-2 py-6 text-sm text-foreground-muted">
            <Loader2 className="size-4 animate-spin" /> Carregando sessões...
          </div>
        ) : sessions.length === 0 ? (
          <p className="rounded-xl bg-background-overlay px-4 py-6 text-center text-xs text-foreground-muted">
            Nenhuma sessão registrada.
          </p>
        ) : (
          <div className="space-y-2">
            {sessions.map(session => (
              <div key={session.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background-overlay">
                  <MonitorSmartphone className="size-4 text-foreground-muted" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{session.deviceName || session.deviceType || 'Dispositivo'}</p>
                    {session.current && <span className="badge bg-brand/10 text-brand text-2xs">Atual</span>}
                  </div>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    {session.ipAddress ? `${session.ipAddress} · ` : ''}
                    último uso {formatSessionDate(session.lastUsedAt)}
                  </p>
                </div>
                {!session.current && (
                  <Button
                    size="xs"
                    variant="ghost"
                    loading={revokingId === session.id}
                    onClick={() => void revokeSession(session.id)}
                    className="text-danger hover:bg-danger-muted"
                  >
                    Revogar
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatSessionDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'desconhecido'
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

// ===================================================================
// DataSection
// ===================================================================

export function DataSection() {
  const { user, logout } = useAuthStore()
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteForm, setShowDeleteForm] = useState(false)

  const handleExport = async () => {
    try {
      const response = await usersApi.exportData()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `lumina-data-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('Dados exportados com sucesso!')
    } catch {
      toast.error('Erro ao exportar dados')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      toast.error('E-mail incorreto')
      return
    }
    setDeleting(true)
    try {
      await usersApi.deleteAccount(deleteConfirm)
      logout()
    } catch {
      toast.error('Erro ao excluir conta')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Dados e Privacidade</h2>
        <p className="text-sm text-foreground-muted mt-1">
          Gerencie seus dados pessoais conforme a LGPD
        </p>
      </div>

      {/* Export */}
      <div className="p-5 bg-background-overlay rounded-xl border border-border space-y-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Download className="size-4 text-brand" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Exportar meus dados</h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Baixe todos os seus dados em formato JSON, incluindo tarefas, hábitos, metas, diário e mais.
            </p>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={handleExport}>
          <Download className="size-3.5" /> Exportar tudo
        </Button>
      </div>

      {/* Data info */}
      <div className="space-y-2 text-xs text-foreground-muted">
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-success shrink-0" />
          Seus dados são armazenados de forma segura e criptografada
        </div>
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-success shrink-0" />
          Nunca vendemos ou compartilhamos seus dados pessoais
        </div>
        <div className="flex items-center gap-2">
          <Shield className="size-3.5 text-success shrink-0" />
          Você tem o direito de acessar, corrigir e excluir seus dados (LGPD)
        </div>
      </div>

      {/* Delete Account */}
      <div className="pt-4 border-t border-border space-y-4">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-lg bg-danger-muted flex items-center justify-center shrink-0">
            <Trash2 className="size-4 text-danger" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-danger">Excluir conta</h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.
            </p>
          </div>
        </div>

        {!showDeleteForm ? (
          <Button variant="danger" size="sm" onClick={() => setShowDeleteForm(true)}>
            <Trash2 className="size-3.5" /> Excluir minha conta
          </Button>
        ) : (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-danger-muted border border-danger/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs text-danger">
              <AlertTriangle className="size-4 shrink-0" />
              <span className="font-medium">Esta ação não pode ser desfeita</span>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-muted">
                Digite <span className="font-bold text-foreground">{user?.email}</span> para confirmar
              </label>
              <input type="text" value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                placeholder="Seu e-mail" className="input-base border-danger/30 focus:ring-danger" />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setShowDeleteForm(false); setDeleteConfirm('') }}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" loading={deleting}
                disabled={deleteConfirm !== user?.email}
                onClick={handleDeleteAccount}>
                Confirmar exclusão
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
