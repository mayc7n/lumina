'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Flame, Trophy, ChevronRight } from 'lucide-react'
import { IconRenderer } from '@/components/ui/Icons'
import { cn } from '@/lib/utils'
import type { Habit } from '@/lib/api/client'

interface HabitCardProps {
  habit: Habit
  isCompleted: boolean
  onToggle: () => void
  onSelect: () => void
}

export function HabitCard({ habit, isCompleted, onToggle, onSelect }: HabitCardProps) {
  const streak = habit.streak?.currentStreak ?? 0
  const longest = habit.streak?.longestStreak ?? 0
  const isOnFire = streak >= 7

  return (
    <motion.div
      layout
      className={cn(
        'card-hover p-4 cursor-pointer group relative overflow-hidden',
        isCompleted && 'opacity-70'
      )}
      onClick={onSelect}
      whileHover={{ y: -1 }}
    >
      {/* Completion ambient glow */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ background: `radial-gradient(circle at top left, ${habit.color}12 0%, transparent 70%)` }}
        />
      )}

      {/* Color bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full"
        style={{ background: habit.color, opacity: isCompleted ? 1 : 0.4 }}
      />

      <div className="flex items-start gap-3 pl-2">
        {/* Checkbox */}
        <motion.button
          onClick={e => { e.stopPropagation(); onToggle() }}
          whileTap={{ scale: 0.85 }}
          className="mt-0.5 shrink-0 focus:outline-none"
        >
          {isCompleted ? (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <CheckCircle2 size={18} strokeWidth={2} style={{ color: habit.color }} />
            </motion.div>
          ) : (
            <Circle
              size={18}
              strokeWidth={1.5}
              className="text-foreground-subtle group-hover:text-foreground-muted transition-colors"
            />
          )}
        </motion.button>

        {/* Icon + Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Lucide icon */}
            <div
              className="size-6 rounded-md flex items-center justify-center shrink-0"
              style={{ background: habit.color + '15' }}
            >
              <IconRenderer name={habit.icon ?? 'flame'} size={13} style={{ color: habit.color }} />
            </div>

            <span className={cn(
              'text-sm font-medium truncate',
              isCompleted ? 'line-through text-foreground-muted' : 'text-foreground'
            )}>
              {habit.name}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2.5">
            {/* Streak */}
            <div className="flex items-center gap-1">
              <Flame
                size={12}
                strokeWidth={2}
                className={isOnFire ? 'text-orange-500' : 'text-foreground-subtle'}
              />
              <span className={cn(
                'text-xs tabular-nums',
                isOnFire ? 'text-orange-500 font-semibold' : 'text-foreground-muted'
              )}>
                {streak}d
              </span>
            </div>

            {/* Record */}
            {longest > 0 && (
              <>
                <div className="size-0.5 rounded-full bg-border" />
                <div className="flex items-center gap-1">
                  <Trophy size={11} strokeWidth={2} className="text-foreground-subtle" />
                  <span className="text-xs text-foreground-muted tabular-nums">{longest}d</span>
                </div>
              </>
            )}

            {/* Frequency */}
            <span className="ml-auto text-2xs text-foreground-subtle uppercase tracking-wider">
              {habit.frequency === 'DAILY' ? 'Diário'
                : habit.frequency === 'WEEKLY' ? 'Semanal' : 'Mensal'}
            </span>
          </div>
        </div>

        <ChevronRight
          size={13}
          className="text-foreground-subtle opacity-0 group-hover:opacity-100
                     transition-opacity mt-1 shrink-0"
        />
      </div>
    </motion.div>
  )
}
