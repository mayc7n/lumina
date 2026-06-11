'use client'

import { FormEvent, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Flag, Plus, Target, TrendingUp, X } from 'lucide-react'
import { GoalCard } from '@/components/features/goals/GoalCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/Button'
import { useGoals } from '@/hooks/useGoals'
import type { Goal } from '@/lib/api/client'

const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#f97316', '#10b981', '#06b6d4']

export default function GoalsPage() {
  const { goals, isLoading, createGoal, checkIn, isCreating } = useGoals()
  const [selected, setSelected] = useState<Goal | null>(null)
  const [creating, setCreating] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [period, setPeriod] = useState('YEARLY')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [progress, setProgress] = useState('')
  const active = goals.filter(goal => goal.status === 'ACTIVE').length

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    await createGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      color,
      period,
      startDate: new Date().toISOString().slice(0, 10),
      targetValue: targetValue ? Number(targetValue) : undefined,
      unit: unit.trim() || undefined,
    })
    setTitle('')
    setDescription('')
    setTargetValue('')
    setUnit('')
    setCreating(false)
  }

  async function submitCheckIn(event: FormEvent) {
    event.preventDefault()
    if (!selected || progress === '') return
    await checkIn({ id: selected.id, value: Number(progress) })
    setProgress('')
    setSelected(null)
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
                <Target className="size-4 text-violet-500" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Metas</h1>
                <p className="text-xs text-foreground-muted">{active} metas ativas</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Nova meta
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-48 animate-pulse rounded-xl bg-background-elevated" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <EmptyState
              icon={Target}
              title="Transforme intenção em progresso"
              description="Crie uma meta mensurável e registre sua evolução ao longo do tempo."
              action={{ label: 'Criar meta', onClick: () => setCreating(true) }}
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {goals.map(goal => <GoalCard key={goal.id} goal={goal} onSelect={() => setSelected(goal)} />)}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.aside initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }}
            className="w-[360px] shrink-0 border-l border-border bg-background-elevated p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl" style={{ background: `${selected.color}18` }}>
                  <Target className="size-5" style={{ color: selected.color }} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">{selected.title}</h2>
                  <p className="text-xs text-foreground-muted">{Math.round(selected.progressPct)}% concluído</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-2"><X className="size-4" /></button>
            </div>

            <div className="mt-6 space-y-5">
              {selected.description && <p className="text-sm leading-relaxed text-foreground-muted">{selected.description}</p>}
              <div className="card p-4">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-foreground-muted">Progresso atual</span>
                  <strong>{selected.currentValue}{selected.unit ? ` ${selected.unit}` : ''}</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${selected.progressPct}%`, background: selected.color }} />
                </div>
              </div>

              <form onSubmit={submitCheckIn} className="card space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-brand" />
                  <h3 className="text-sm font-semibold">Registrar progresso</h3>
                </div>
                <p className="text-xs text-foreground-muted">Informe o valor total alcançado até agora.</p>
                <div className="flex gap-2">
                  <input type="number" min="0" step="0.01" value={progress}
                    onChange={event => setProgress(event.target.value)}
                    className="input-base min-w-0 flex-1" placeholder="Valor atual" />
                  <Button type="submit" size="sm" disabled={progress === ''}>Registrar</Button>
                </div>
              </form>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Flag className="size-4 text-foreground-muted" />
                  <h3 className="text-sm font-semibold">Marcos</h3>
                </div>
                {selected.milestones?.length ? (
                  <div className="space-y-2">
                    {selected.milestones.map(item => (
                      <div key={item.id} className="rounded-lg border border-border p-3">
                        <p className="text-xs font-medium">{item.title}</p>
                        {item.dueDate && <p className="mt-1 text-2xs text-foreground-subtle">{item.dueDate}</p>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-foreground-subtle">Nenhum marco cadastrado.</p>}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.form initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }} onSubmit={submit}
              className="card w-full max-w-lg p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div><h2 className="font-semibold">Nova meta</h2><p className="text-xs text-foreground-muted">Clareza no resultado, consistência no processo.</p></div>
                <button type="button" onClick={() => setCreating(false)} className="btn-ghost p-2"><X className="size-4" /></button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-medium text-foreground-muted sm:col-span-2">
                  Título
                  <input autoFocus value={title} onChange={event => setTitle(event.target.value)}
                    className="input-base mt-1.5 w-full" placeholder="Ex.: Correr 500 km no ano" />
                </label>
                <label className="block text-xs font-medium text-foreground-muted sm:col-span-2">
                  Descrição
                  <textarea value={description} onChange={event => setDescription(event.target.value)}
                    className="input-base mt-1.5 min-h-20 w-full resize-none" />
                </label>
                <label className="block text-xs font-medium text-foreground-muted">
                  Período
                  <select value={period} onChange={event => setPeriod(event.target.value)} className="input-base mt-1.5 w-full">
                    <option value="WEEKLY">Semanal</option><option value="MONTHLY">Mensal</option>
                    <option value="QUARTERLY">Trimestral</option><option value="YEARLY">Anual</option>
                  </select>
                </label>
                <label className="block text-xs font-medium text-foreground-muted">
                  Valor alvo
                  <input type="number" min="0.01" step="0.01" value={targetValue}
                    onChange={event => setTargetValue(event.target.value)}
                    className="input-base mt-1.5 w-full" placeholder="100" />
                </label>
                <label className="block text-xs font-medium text-foreground-muted">
                  Unidade
                  <input value={unit} onChange={event => setUnit(event.target.value)}
                    className="input-base mt-1.5 w-full" placeholder="km, livros, horas..." />
                </label>
                <div>
                  <p className="mb-2 text-xs font-medium text-foreground-muted">Cor</p>
                  <div className="flex gap-2">
                    {COLORS.map(item => <button key={item} type="button" onClick={() => setColor(item)}
                      className="size-7 rounded-full" style={{ background: item, outline: color === item ? `2px solid ${item}` : 'none', outlineOffset: 3 }} />)}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
                <Button type="submit" loading={isCreating} disabled={!title.trim()}>Criar meta</Button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
