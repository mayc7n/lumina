'use client'
import { useState, useRef, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TagInput({ tags, onChange, placeholder = 'Adicionar tag...', maxTags = 10, className }: {
  tags: string[]; onChange: (t: string[]) => void; placeholder?: string; maxTags?: number; className?: string
}) {
  const [input, setInput] = useState('')
  const ref = useRef<HTMLInputElement>(null)
  const add = (v: string) => { const t = v.trim().toLowerCase().replace(/\s+/g, '-'); if (!t || tags.includes(t) || tags.length >= maxTags) return; onChange([...tags, t]); setInput('') }
  const remove = (t: string) => onChange(tags.filter(x => x !== t))
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) }
    else if (e.key === 'Backspace' && !input && tags.length > 0) remove(tags[tags.length - 1])
  }
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)} onClick={() => ref.current?.focus()}>
      {tags.map(tag => (
        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand/10 text-brand rounded-md text-xs font-medium">
          #{tag}
          <button onClick={e => { e.stopPropagation(); remove(tag) }} className="hover:text-brand/60"><X size={10} /></button>
        </span>
      ))}
      {tags.length < maxTags && (
        <input ref={ref} type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          onBlur={() => input.trim() && add(input)} placeholder={tags.length === 0 ? placeholder : ''}
          className="min-w-0 flex-1 text-xs bg-transparent outline-none placeholder:text-foreground-subtle" />
      )}
    </div>
  )
}
