'use client'

import { useHabitStreak } from '@/hooks/useHabits'
import { X, Flame, Trophy, Trash2, Check } from 'lucide-react'
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { format, subDays, eachDayOfInterval, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useHabitCompletions, useHabits } from '@/hooks/useHabits'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/api/client'
import { IconRenderer } from '@/components/ui/Icons'

interface HabitDetailProps {
  habit: Habit
  onClose: () => void
}

export function HabitDetail({ habit, onClose }: HabitDetailProps) {
  const { data: streak } = useHabitStreak(habit.id)
  const { deleteHabit } = useHabits()

  const from = format(subDays(new Date(), 29), 'yyyy-MM-dd')
  const to   = format(new Date(), 'yyyy-MM-dd')
  const { data: completions } = useHabitCompletions(habit.id, from, to)

  const completedSet = new Set(completions?.map(c => c.completedDate) ?? [])

  // Build last 30 days chart data
  const last30 = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
  const chartData = last30.map(day => ({
    date: format(day, 'yyyy-MM-dd'),
    completed: completedSet.has(format(day, 'yyyy-MM-dd')) ? 1 : 0,
  }))

  // Compute last 7 days completion rate
  const last7 = last30.slice(-7)
  const last7Completed = last7.filter(d => completedSet.has(format(d, 'yyyy-MM-dd'))).length
  const last7Rate = Math.round(last7Completed / 7 * 100)

  const handleDelete = async () => {
    try {
      await deleteHabit(habit.id)
      onClose()
    } catch {
      // Toast is handled by the hook.
    }
  }

  return (
    <div className="h-full flex flex-col bg-background-elevated">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl flex items-center justify-center"
            style={{ background: habit.color + '20' }}>
            <IconRenderer name={habit.icon ?? 'flame'} size={17} style={{ color: habit.color }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold">{habit.name}</h2>
            <p className="text-xs text-foreground-muted capitalize">
              {habit.frequency === 'DAILY' ? 'Diário' : habit.frequency === 'WEEKLY' ? 'Semanal' : 'Mensal'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleDelete} className="btn-ghost p-2 text-foreground-muted hover:text-danger">
            <Trash2 className="size-4" />
          </button>
          <button onClick={onClose} className="btn-ghost p-2">
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {/* Streak Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Streak atual', value: `${streak?.currentStreak ?? 0}d`, icon: Flame, color: 'text-orange-500' },
            { label: 'Recorde',      value: `${streak?.longestStreak ?? 0}d`, icon: Trophy, color: 'text-amber-500'  },
            { label: 'Total',        value: `${streak?.totalCompletions ?? 0}×`, icon: Check, color: 'text-success'  },
          ].map(item => (
            <div key={item.label} className="p-3 bg-background-overlay rounded-xl border border-border text-center">
              <item.icon className={cn('size-4 mx-auto mb-1', item.color)} />
              <p className="text-lg font-bold tabular-nums">{item.value}</p>
              <p className="text-2xs text-foreground-subtle">{item.label}</p>
            </div>
          ))}
        </div>

        {/* 7-day rate */}
        <div className="p-3 bg-background-overlay rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-foreground-muted">Taxa últimos 7 dias</p>
            <span className={cn('text-sm font-bold',
              last7Rate >= 80 ? 'text-success' : last7Rate >= 50 ? 'text-warning' : 'text-danger')}>
              {last7Rate}%
            </span>
          </div>
          <div className="flex gap-1">
            {last7.map((day, i) => {
              const done = completedSet.has(format(day, 'yyyy-MM-dd'))
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn('w-full h-6 rounded-md',
                    done ? '' : 'bg-background border border-border')}
                    style={done ? { background: habit.color } : {}} />
                  <span className="text-2xs text-foreground-subtle">
                    {format(day, 'EEE', { locale: ptBR }).slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 30-day chart */}
        <div>
          <p className="text-xs font-medium text-foreground-muted mb-3">Últimos 30 dias</p>
          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`grad-${habit.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={habit.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={habit.color} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" hide />
              <Tooltip contentStyle={{ display: 'none' }} />
              <Area type="monotone" dataKey="completed"
                stroke={habit.color} strokeWidth={2}
                fill={`url(#grad-${habit.id})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Description */}
        {habit.description && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Descrição</p>
            <p className="text-sm text-foreground-muted leading-relaxed">{habit.description}</p>
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 text-xs">
          {habit.targetValue > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Meta diária</span>
              <span className="font-medium">{habit.targetValue} {habit.targetUnit ?? 'vezes'}</span>
            </div>
          )}
          {habit.reminderTime && (
            <div className="flex items-center justify-between">
              <span className="text-foreground-muted">Lembrete</span>
              <span className="font-medium">{habit.reminderTime}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-foreground-muted">Iniciado em</span>
            <span className="font-medium">
              {formatStartDate(habit.startDate)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatStartDate(value: string) {
  const date = new Date(value)
  return isValid(date) ? format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Sem data'
}
