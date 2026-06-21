'use client'

import { FormEvent, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, Library, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { useBooks } from '@/hooks/useBooks'
import type { Book } from '@/lib/api/client'
import { clamp, cn } from '@/lib/utils'

const TABS = [
  { value: undefined, label: 'Todos' },
  { value: 'READING', label: 'Lendo' },
  { value: 'WANT_TO_READ', label: 'Quero ler' },
  { value: 'COMPLETED', label: 'Concluídos' },
]

export default function BooksPage() {
  const [status, setStatus] = useState<string | undefined>()
  const { books, isLoading, createBook, logReading, deleteBook, isCreating } = useBooks(status)
  const [creating, setCreating] = useState(false)
  const [selected, setSelected] = useState<Book | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [totalPages, setTotalPages] = useState('')
  const [pagesRead, setPagesRead] = useState('')

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!title.trim()) return
    const parsedTotalPages = totalPages ? Number(totalPages) : undefined
    if (parsedTotalPages != null && (!Number.isFinite(parsedTotalPages) || parsedTotalPages < 1)) return
    try {
      await createBook({
        title: title.trim(), author: author.trim() || undefined,
        totalPages: parsedTotalPages,
        status: 'WANT_TO_READ',
      })
      setTitle(''); setAuthor(''); setTotalPages(''); setCreating(false)
    } catch {
      // Toast is handled by the hook.
    }
  }

  async function registerReading(event: FormEvent) {
    event.preventDefault()
    if (!selected || !pagesRead) return
    const parsedPages = Number(pagesRead)
    if (!Number.isFinite(parsedPages) || parsedPages < 1) return
    try {
      await logReading({ id: selected.id, pagesRead: parsedPages })
      setPagesRead('')
      setSelected(null)
    } catch {
      // Toast is handled by the hook.
    }
  }

  return (
    <div className="min-h-full p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10"><Library className="size-4 text-cyan-500" /></div>
            <div><h1 className="text-lg font-semibold">Biblioteca</h1><p className="text-xs text-foreground-muted">{books.length} livros nesta estante</p></div>
          </div>
          <Button size="sm" onClick={() => setCreating(true)}><Plus className="size-4" /> Adicionar livro</Button>
        </div>

        <div className="flex w-fit gap-1 rounded-lg border border-border bg-background-overlay p-1">
          {TABS.map(tab => <button key={tab.label} onClick={() => setStatus(tab.value)}
            className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              status === tab.value ? 'bg-background text-foreground shadow-sm' : 'text-foreground-muted hover:text-foreground')}>
            {tab.label}
          </button>)}
        </div>

        {isLoading ? <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-background-elevated" />)}</div> :
          books.length === 0 ? <EmptyState icon={BookOpen} title="Sua estante está vazia"
            description="Adicione livros para acompanhar sua leitura e registrar seu progresso."
            action={{ label: 'Adicionar livro', onClick: () => setCreating(true) }} /> :
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-5">
            {books.map((book, index) => (
              <motion.button key={book.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }} onClick={() => setSelected(book)} className="group text-left">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-cyan-950 to-indigo-950 shadow-lg transition-transform group-hover:-translate-y-1">
                  {book.coverUrl ? <img src={book.coverUrl} alt="" className="size-full object-cover" /> :
                    <div className="flex size-full flex-col items-center justify-center p-4 text-center"><BookOpen className="mb-3 size-8 text-cyan-400" /><span className="text-sm font-semibold text-white">{book.title}</span></div>}
                  {book.progressPct != null && book.progressPct > 0 && <div className="absolute inset-x-0 bottom-0 h-1 bg-black/50"><div className="h-full bg-cyan-400" style={{ width: `${clamp(book.progressPct)}%` }} /></div>}
                </div>
                <p className="mt-2 truncate text-sm font-medium">{book.title}</p>
                <p className="truncate text-xs text-foreground-muted">{book.author || 'Autor não informado'}</p>
              </motion.button>
            ))}
          </div>}
      </div>

      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }} className="card w-full max-w-md p-5">
              <div className="flex items-start justify-between">
                <div><h2 className="font-semibold">{selected.title}</h2><p className="text-xs text-foreground-muted">{selected.author}</p></div>
                <button onClick={() => setSelected(null)} className="btn-ghost p-2"><X className="size-4" /></button>
              </div>
              <div className="my-5">
                <div className="mb-2 flex justify-between text-xs"><span className="text-foreground-muted">Progresso</span><strong>{selected.currentPage} / {selected.totalPages ?? '?'} páginas</strong></div>
                <div className="progress-bar"><div className="progress-fill bg-cyan-500" style={{ width: `${clamp(selected.progressPct ?? 0)}%` }} /></div>
              </div>
              <form onSubmit={registerReading} className="space-y-3">
                <label className="block text-xs font-medium text-foreground-muted">Páginas lidas nesta sessão
                  <input type="number" min="1" value={pagesRead} onChange={event => setPagesRead(event.target.value)}
                    className="input-base mt-1.5 w-full" placeholder="Ex.: 25" />
                </label>
                <Button className="w-full" type="submit" disabled={!pagesRead}>Registrar leitura</Button>
              </form>
              <Button variant="ghost" className="mt-3 w-full text-danger" onClick={async () => { try { await deleteBook(selected.id); setSelected(null) } catch { /* Toast is handled by the hook. */ } }}>
                <Trash2 className="size-4" /> Remover da biblioteca
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.form initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }}
              onSubmit={submit} className="card w-full max-w-md p-5">
              <div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Adicionar livro</h2><p className="text-xs text-foreground-muted">Inclua um livro na sua biblioteca pessoal.</p></div><button type="button" onClick={() => setCreating(false)} className="btn-ghost p-2"><X className="size-4" /></button></div>
              <div className="space-y-4">
                <label className="block text-xs font-medium text-foreground-muted">Título<input autoFocus value={title} onChange={event => setTitle(event.target.value)} className="input-base mt-1.5 w-full" /></label>
                <label className="block text-xs font-medium text-foreground-muted">Autor<input value={author} onChange={event => setAuthor(event.target.value)} className="input-base mt-1.5 w-full" /></label>
                <label className="block text-xs font-medium text-foreground-muted">Total de páginas<input type="number" min="1" value={totalPages} onChange={event => setTotalPages(event.target.value)} className="input-base mt-1.5 w-full" /></label>
              </div>
              <div className="mt-6 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button><Button type="submit" loading={isCreating} disabled={!title.trim()}>Adicionar</Button></div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
