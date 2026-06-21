'use client'

import { FormEvent, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flame, Plus, Sparkles, X } from 'lucide-react'
import { HabitCard } from '@/components/features/habits/HabitCard'
import { HabitDetail } from '@/components/features/habits/HabitDetail'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { useHabits } from '@/hooks/useHabits'
import { clamp } from '@/lib/utils'
import type { Habit } from '@/lib/api/client'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4']

export default function HabitsPage() {
  const {
    habits, todayCompletions, isLoading, completeHabit, uncompleteHabit,
    createHabit, isCreating,
  } = useHabits()
  const [selected, setSelected] = useState<Habit | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [frequency, setFrequency] = useState('DAILY')
  const completed = habits.filter(habit => todayCompletions.includes(habit.id)).length

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!name.trim()) return
    try {
      await createHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        frequency,
        habitType: 'BUILD',
        startDate: new Date().toISOString().slice(0, 10),
      })
      setName('')
      setDescription('')
      setCreating(false)
    } catch {
      // Toast is handled by the hook.
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10">
                <Flame className="size-4 text-orange-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Hábitos</h1>
                <p className="text-xs text-foreground-muted">
                  {completed} de {habits.length} concluídos hoje
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Novo hábito
            </Button>
          </div>

          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-medium text-foreground-muted">Progresso de hoje</span>
              <span className="font-semibold tabular-nums">
                {habits.length ? Math.round(clamp(completed / habits.length * 100)) : 0}%
              </span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-fill bg-orange-500"
                animate={{ width: `${habits.length ? clamp(completed / habits.length * 100) : 0}%` }}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-xl bg-background-elevated" />
              ))}
            </div>
          ) : habits.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Construa sua primeira rotina"
              description="Comece com um hábito pequeno, mensurável e fácil de repetir."
              action={{ label: 'Criar hábito', onClick: () => setCreating(true) }}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {habits.map(habit => {
                const isCompleted = todayCompletions.includes(habit.id)
                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    isCompleted={isCompleted}
                    onToggle={() => {
                      const action = isCompleted ? uncompleteHabit(habit.id) : completeHabit(habit.id)
                      void action.catch(() => undefined)
                    }}
                    onSelect={() => setSelected(habit)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            className="w-[380px] shrink-0 border-l border-border"
          >
            <HabitDetail habit={selected} onClose={() => setSelected(null)} />
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.form
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              onSubmit={submit}
              className="card w-full max-w-md p-5 shadow-2xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">Novo hábito</h2>
                  <p className="text-xs text-foreground-muted">Defina uma ação que você consegue repetir.</p>
                </div>
                <button type="button" onClick={() => setCreating(false)} className="btn-ghost p-2">
                  <X className="size-4" />
                </button>
              </div>
              <div className="space-y-4">
                <label className="block text-xs font-medium text-foreground-muted">
                  Nome
                  <input autoFocus value={name} onChange={event => setName(event.target.value)}
                    className="input-base mt-1.5 w-full" placeholder="Ex.: Ler por 20 minutos" />
                </label>
                <label className="block text-xs font-medium text-foreground-muted">
                  Descrição
                  <textarea value={description} onChange={event => setDescription(event.target.value)}
                    className="input-base mt-1.5 min-h-20 w-full resize-none" placeholder="Por que este hábito importa?" />
                </label>
                <label className="block text-xs font-medium text-foreground-muted">
                  Frequência
                  <select value={frequency} onChange={event => setFrequency(event.target.value)}
                    className="input-base mt-1.5 w-full">
                    <option value="DAILY">Diário</option>
                    <option value="WEEKLY">Semanal</option>
                    <option value="MONTHLY">Mensal</option>
                  </select>
                </label>
                <div>
                  <p className="mb-2 text-xs font-medium text-foreground-muted">Cor</p>
                  <div className="flex gap-2">
                    {COLORS.map(item => (
                      <button key={item} type="button" onClick={() => setColor(item)}
                        className="size-7 rounded-full transition-transform hover:scale-110"
                        style={{ background: item, outline: color === item ? `2px solid ${item}` : 'none', outlineOffset: 3 }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
                <Button type="submit" loading={isCreating} disabled={!name.trim()}>Criar hábito</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
