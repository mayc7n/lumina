'use client'

import { motion } from 'framer-motion'
import { ChevronRight, CheckCircle2, Clock, Flag } from 'lucide-react'
import { IconRenderer, CATEGORY_COLORS } from '@/components/ui/Icons'
import { clamp, cn, formatDate } from '@/lib/utils'
import type { Goal } from '@/lib/api/client'

interface GoalCardProps {
  goal: Goal
  onSelect: () => void
}

const STATUS_CONFIG = {
  ACTIVE:    { label: 'Ativa',      className: 'text-brand bg-brand/10'        },
  PAUSED:    { label: 'Pausada',    className: 'text-warning bg-warning-muted' },
  COMPLETED: { label: 'Concluída',  className: 'text-success bg-success-muted' },
  ABANDONED: { label: 'Abandonada', className: 'text-danger bg-danger-muted'   },
}

const PERIOD_LABELS: Record<string, string> = {
  WEEKLY: 'Semanal', MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral', YEARLY: 'Anual', CUSTOM: 'Personalizado',
}

export function GoalCard({ goal, onSelect }: GoalCardProps) {
  const status = STATUS_CONFIG[goal.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.ACTIVE
  const pct = Math.round(clamp(goal.progressPct))
  const isCompleted = goal.status === 'COMPLETED'
  const accentColor = goal.color ?? '#8b5cf6'

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={onSelect}
      className="card-hover p-5 cursor-pointer group relative overflow-hidden"
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl"
        style={{ background: isCompleted ? 'hsl(142, 71%, 45%)' : accentColor }}
      />

      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Icon container */}
        <div
          className="size-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accentColor + '15' }}
        >
          <IconRenderer
            name={goal.icon ?? 'target'}
            size={18}
            strokeWidth={1.75}
            style={{ color: accentColor }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={cn(
              'text-sm font-semibold text-foreground leading-snug',
              isCompleted && 'line-through text-foreground-muted'
            )}>
              {goal.title}
            </h3>
            <ChevronRight
              size={13}
              className="text-foreground-subtle opacity-0 group-hover:opacity-100
                         transition-opacity mt-0.5 shrink-0"
            />
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className={cn('badge text-2xs font-medium', status.className)}>
              {status.label}
            </span>
            <span className="text-2xs text-foreground-subtle">
              {PERIOD_LABELS[goal.period] ?? goal.period}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-foreground-muted">Progresso</span>
          <span className="font-semibold tabular-nums" style={{ color: accentColor }}>
            {goal.targetValue
              ? `${goal.currentValue} / ${goal.targetValue}${goal.unit ? ' ' + goal.unit : ''}`
              : `${pct}%`}
          </span>
        </div>

        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            style={{ background: isCompleted ? 'hsl(142, 71%, 45%)' : accentColor }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        {goal.milestones && goal.milestones.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-foreground-muted">
            <Flag size={12} strokeWidth={2} />
            <span>
              {goal.milestones.filter(m => m.completedAt).length}/{goal.milestones.length} marcos
            </span>
          </div>
        )}

        {goal.endDate && !isCompleted && (
          <div className="flex items-center gap-1 text-xs text-foreground-subtle ml-auto">
            <Clock size={11} strokeWidth={2} />
            <span>{formatDate(goal.endDate)}</span>
          </div>
        )}

        {isCompleted && (
          <div className="flex items-center gap-1.5 text-xs text-success ml-auto">
            <CheckCircle2 size={13} strokeWidth={2} />
            <span className="font-medium">Meta alcançada</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
