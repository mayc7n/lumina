'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookHeart, Calendar, Pin, Plus, Search, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { useJournal } from '@/hooks/useJournal'
import type { JournalEntry } from '@/lib/api/client'
import { cn } from '@/lib/utils'

const MOODS = [
  { value: 'TERRIBLE', icon: '😞', label: 'Péssimo' },
  { value: 'BAD', icon: '😕', label: 'Ruim' },
  { value: 'NEUTRAL', icon: '😐', label: 'Neutro' },
  { value: 'GOOD', icon: '🙂', label: 'Bem' },
  { value: 'EXCELLENT', icon: '😁', label: 'Ótimo' },
]

export default function JournalPage() {
  const [search, setSearch] = useState('')
  const { entries, isLoading, createEntry, updateEntry, deleteEntry, togglePin, isSaving } = useJournal(search)
  const [selected, setSelected] = useState<JournalEntry | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | undefined>()

  useEffect(() => {
    if (!selected) return
    setTitle(selected.title ?? '')
    setContent(selected.content)
    setMood(selected.mood)
  }, [selected])

  function newEntry() {
    setSelected(null)
    setTitle('')
    setContent('')
    setMood(undefined)
  }

  async function save() {
    if (!content.trim()) return
    if (selected) {
      const updated = await updateEntry({ id: selected.id, data: { title, content, mood } })
      setSelected(updated)
    } else {
      const created = await createEntry({
        title: title.trim() || undefined, content: content.trim(), mood,
        entryDate: new Date().toISOString().slice(0, 10),
      })
      setSelected(created)
    }
  }

  async function remove() {
    if (!selected) return
    await deleteEntry(selected.id)
    newEntry()
  }

  return (
    <div className="flex h-[calc(100vh-56px)] overflow-hidden">
      <aside className="flex w-80 shrink-0 flex-col border-r border-border bg-background-elevated">
        <div className="border-b border-border p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><BookHeart className="size-4 text-pink-500" /><h1 className="text-sm font-semibold">Diário</h1></div>
            <Button size="xs" onClick={newEntry}><Plus className="size-3.5" /> Nova</Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-foreground-subtle" />
            <input value={search} onChange={event => setSearch(event.target.value)}
              className="input-base w-full pl-8 text-xs" placeholder="Buscar entradas..." />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? <div className="m-2 h-24 animate-pulse rounded-xl bg-background-overlay" /> :
            entries.map(entry => (
              <button key={entry.id} onClick={() => setSelected(entry)}
                className={cn('mb-1 w-full rounded-xl p-3 text-left transition-colors',
                  selected?.id === entry.id ? 'bg-brand/10' : 'hover:bg-background-overlay')}>
                <div className="flex items-center gap-2">
                  <p className="flex-1 truncate text-sm font-medium">{entry.title || 'Sem título'}</p>
                  {entry.isPinned && <Pin className="size-3 fill-brand text-brand" />}
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-foreground-muted">{entry.content}</p>
                <div className="mt-2 flex items-center gap-1 text-2xs text-foreground-subtle">
                  <Calendar className="size-3" /> {new Date(`${entry.entryDate}T12:00:00`).toLocaleDateString('pt-BR')}
                  <span className="ml-auto">{entry.wordCount} palavras</span>
                </div>
              </button>
            ))}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {entries.length === 0 && !content && !title ? (
          <div className="flex h-full items-center justify-center p-6">
            <EmptyState icon={BookHeart} title="Um espaço para organizar seus pensamentos"
              description="Registre reflexões, aprendizados e como você está se sentindo."
              action={{ label: 'Escrever primeira entrada', onClick: newEntry }} />
          </div>
        ) : (
          <div className="mx-auto flex min-h-full max-w-4xl flex-col p-8">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex-1">
                <p className="text-xs capitalize text-foreground-subtle">
                  {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              {selected && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => togglePin(selected.id)}>
                    <Pin className={cn('size-4', selected.isPinned && 'fill-brand text-brand')} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={remove}><Trash2 className="size-4 text-danger" /></Button>
                </>
              )}
              <Button size="sm" onClick={save} loading={isSaving} disabled={!content.trim()}>
                <Save className="size-4" /> Salvar
              </Button>
            </div>

            <input value={title} onChange={event => setTitle(event.target.value)}
              className="mb-4 bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-foreground-subtle"
              placeholder="Título da entrada" />
            <textarea value={content} onChange={event => setContent(event.target.value)}
              className="min-h-[380px] flex-1 resize-none bg-transparent text-base leading-8 text-foreground outline-none placeholder:text-foreground-subtle"
              placeholder="O que está passando pela sua cabeça?" />

            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-3 text-xs font-medium text-foreground-muted">Como você está se sentindo?</p>
              <div className="flex gap-2">
                {MOODS.map(item => (
                  <button key={item.value} onClick={() => setMood(item.value)}
                    className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-all',
                      mood === item.value ? 'border-brand bg-brand/10' : 'border-border hover:border-border-strong')}>
                    <span className="text-lg">{item.icon}</span>{item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
