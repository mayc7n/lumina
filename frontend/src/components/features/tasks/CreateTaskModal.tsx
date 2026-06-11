'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { Button } from '@/components/ui/Button'

interface CreateTaskModalProps {
  open: boolean
  onClose: () => void
  defaultDate?: string
}

export function CreateTaskModal({ open, onClose, defaultDate }: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState(defaultDate ?? '')
  const { createTask, isCreating } = useTasks()

  useEffect(() => {
    if (open) setDueDate(defaultDate ?? '')
  }, [defaultDate, open])

  if (!open) return null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    await createTask({ title: title.trim(), dueDate: dueDate || undefined })
    setTitle('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onMouseDown={onClose}>
      <form
        onSubmit={submit}
        onMouseDown={event => event.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-background-elevated p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Nova tarefa</h2>
          <button type="button" onClick={onClose} className="btn-ghost rounded-md p-1">
            <X className="size-4" />
          </button>
        </div>
        <input
          autoFocus
          value={title}
          onChange={event => setTitle(event.target.value)}
          placeholder="Título da tarefa"
          className="input-base w-full"
        />
        <input
          type="date"
          value={dueDate}
          onChange={event => setDueDate(event.target.value)}
          className="input-base w-full"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={isCreating} disabled={!title.trim()}>Criar</Button>
        </div>
      </form>
    </div>
  )
}
