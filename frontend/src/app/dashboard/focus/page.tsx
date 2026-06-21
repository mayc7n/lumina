'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Check, Clock3, Flame, Play, Square, Timer, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useFocus } from '@/hooks/useFocus'
import { clamp, cn, formatDate, formatDuration } from '@/lib/utils'

const MODES = [
  { id: 'POMODORO', label: 'Pomodoro', minutes: 25, icon: Timer, color: '#6366f1' },
  { id: 'DEEP_WORK', label: 'Trabalho profundo', minutes: 50, icon: Brain, color: '#8b5cf6' },
  { id: 'QUICK_BURST', label: 'Sprint rápido', minutes: 15, icon: Zap, color: '#f97316' },
  { id: 'FLOW', label: 'Flow', minutes: 90, icon: Flame, color: '#ec4899' },
]

export default function FocusPage() {
  const { sessions, activeSession, stats, isLoading, startSession, completeSession, abandonSession, isStarting } = useFocus()
  const [mode, setMode] = useState(MODES[0])
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!activeSession) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [activeSession])

  const elapsedSeconds = activeSession
    ? Math.max(0, Math.floor((now - safeTime(activeSession.startedAt)) / 1000))
    : 0
  const plannedSeconds = (activeSession?.plannedMins ?? mode.minutes) * 60
  const remaining = Math.max(0, plannedSeconds - elapsedSeconds)
  const progress = plannedSeconds > 0 ? clamp(elapsedSeconds / plannedSeconds * 100) : 0
  const clock = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`
  const completedSessions = useMemo(() => sessions.filter(session => session.status === 'COMPLETED'), [sessions])

  async function begin() {
    try {
      await startSession({ mode: mode.id, plannedMins: mode.minutes })
      setNow(Date.now())
    } catch {
      // Toast is handled by the hook.
    }
  }

  return (
    <div className="min-h-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/10">
            <Timer className="size-4 text-purple-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Foco</h1>
            <p className="text-xs text-foreground-muted">Proteja seu tempo e trabalhe com intenção.</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="card relative overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: activeSession ? '#8b5cf6' : mode.color }} />
            {!activeSession && (
              <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {MODES.map(item => {
                  const Icon = item.icon
                  return (
                    <button key={item.id} onClick={() => setMode(item)}
                      className={cn('rounded-xl border p-3 text-left transition-all',
                        mode.id === item.id ? 'border-brand bg-brand/8' : 'border-border hover:border-border-strong')}>
                      <Icon className="mb-2 size-4" style={{ color: item.color }} />
                      <p className="text-xs font-medium">{item.label}</p>
                      <p className="mt-0.5 text-2xs text-foreground-subtle">{item.minutes} minutos</p>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="flex flex-col items-center py-6">
              <div className="relative flex size-64 items-center justify-center rounded-full"
                style={{ background: `conic-gradient(${activeSession ? '#8b5cf6' : mode.color} ${progress}%, var(--color-border, #27272a) ${progress}%)` }}>
                <div className="flex size-[244px] flex-col items-center justify-center rounded-full bg-background-elevated">
                  <p className="text-6xl font-semibold tracking-tight tabular-nums">{activeSession ? clock : `${mode.minutes}:00`}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-foreground-subtle">
                    {activeSession ? 'sessão em andamento' : mode.label}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-2">
                {activeSession ? (
                  <>
                    <Button onClick={() => void completeSession({ id: activeSession.id, focusScore: 8 }).catch(() => undefined)}>
                      <Check className="size-4" /> Concluir
                    </Button>
                    <Button variant="secondary" onClick={() => void abandonSession(activeSession.id).catch(() => undefined)}>
                      <Square className="size-3.5 fill-current" /> Encerrar
                    </Button>
                  </>
                ) : (
                  <Button size="lg" onClick={begin} loading={isStarting}>
                    <Play className="size-4 fill-current" /> Iniciar sessão
                  </Button>
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Esta semana', value: formatDuration(stats?.weeklyMins ?? 0), icon: Clock3 },
                { label: 'Sessões', value: stats?.totalSessions ?? 0, icon: Check },
                { label: 'Tempo total', value: formatDuration(stats?.totalFocusMins ?? 0), icon: Timer },
                { label: 'Sequência', value: `${stats?.currentStreakDays ?? 0}d`, icon: Flame },
              ].map(item => (
                <div key={item.label} className="card p-4">
                  <item.icon className="mb-3 size-4 text-foreground-subtle" />
                  <p className="text-xl font-bold tabular-nums">{item.value}</p>
                  <p className="mt-0.5 text-xs text-foreground-muted">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="card p-5">
              <h2 className="mb-4 text-sm font-semibold">Sessões recentes</h2>
              {isLoading ? (
                <div className="h-24 animate-pulse rounded-lg bg-background-overlay" />
              ) : completedSessions.length === 0 ? (
                <p className="py-6 text-center text-xs text-foreground-muted">Sua primeira sessão aparecerá aqui.</p>
              ) : (
                <div className="space-y-1">
                  {completedSessions.slice(0, 6).map(session => (
                    <div key={session.id} className="flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-background-overlay">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10">
                        <Timer className="size-3.5 text-purple-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium">{MODES.find(item => item.id === session.mode)?.label ?? session.mode}</p>
                        <p className="text-2xs text-foreground-subtle">{formatDate(session.startedAt)}</p>
                      </div>
                      <span className="text-xs font-medium tabular-nums">{formatDuration(session.actualMins)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function safeTime(value: string) {
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Date.now() : time
}
