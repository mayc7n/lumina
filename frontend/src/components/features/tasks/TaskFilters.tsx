'use client'

import { useProjects } from '@/hooks/useTasks'
import { Button } from '@/components/ui/Button'
import { getPriorityConfig, cn } from '@/lib/utils'
import { X, Flag, Folder, Calendar } from 'lucide-react'
import type { TaskQueryParams } from '@/lib/api/client'

interface TaskFiltersProps {
  filters: TaskQueryParams
  onChange: (filters: TaskQueryParams) => void
  onClose: () => void
}

const STATUSES = [
  { id: 'TODO',        label: 'A fazer'       },
  { id: 'IN_PROGRESS', label: 'Em progresso'  },
  { id: 'DONE',        label: 'Concluída'     },
]

const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE']

export function TaskFilters({ filters, onChange, onClose }: TaskFiltersProps) {
  const { projects } = useProjects()

  const set = (patch: Partial<TaskQueryParams>) => onChange({ ...filters, ...patch })
  const clear = () => onChange({})

  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-background-elevated flex-wrap">
      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-foreground-muted">Status:</span>
        {STATUSES.map(s => (
          <button key={s.id} onClick={() => set({ status: filters.status === s.id ? undefined : s.id })}
            className={cn('px-2.5 py-1 rounded-lg text-xs font-medium border transition-all',
              filters.status === s.id ? 'border-brand bg-brand/5 text-brand' : 'border-border text-foreground-muted hover:border-border-strong')}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Priority */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-foreground-muted">Prioridade:</span>
        {PRIORITIES.map(p => {
          const config = getPriorityConfig(p)
          return (
            <button key={p} onClick={() => set({ priority: filters.priority === p ? undefined : p })}
              className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border transition-all',
                filters.priority === p ? 'border-current' : 'border-border text-foreground-muted hover:border-border-strong')}
              style={filters.priority === p ? { color: config.color, borderColor: config.color + '50', background: config.color + '10' } : {}}>
              <Flag className="size-3" />
              {config.label}
            </button>
          )
        })}
      </div>

      {/* Project */}
      {projects.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Folder className="size-3.5 text-foreground-muted" />
          <select value={filters.projectId?.toString() ?? ''}
            onChange={e => set({ projectId: e.target.value ? e.target.value as any : undefined })}
            className="text-xs bg-transparent border border-border rounded-lg px-2 py-1 text-foreground-muted
                       focus:outline-none focus:border-brand">
            <option value="">Todos os projetos</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Date range */}
      <div className="flex items-center gap-1.5">
        <Calendar className="size-3.5 text-foreground-muted" />
        <input type="date" value={filters.dueDateFrom?.toString() ?? ''}
          onChange={e => set({ dueDateFrom: e.target.value as any || undefined })}
          className="text-xs bg-transparent border border-border rounded-lg px-2 py-1 text-foreground-muted focus:outline-none focus:border-brand" />
        <span className="text-xs text-foreground-subtle">até</span>
        <input type="date" value={filters.dueDateTo?.toString() ?? ''}
          onChange={e => set({ dueDateTo: e.target.value as any || undefined })}
          className="text-xs bg-transparent border border-border rounded-lg px-2 py-1 text-foreground-muted focus:outline-none focus:border-brand" />
      </div>

      {/* Clear */}
      {activeCount > 0 && (
        <button onClick={clear}
          className="flex items-center gap-1 text-xs text-foreground-muted hover:text-danger transition-colors ml-auto">
          <X className="size-3" /> Limpar ({activeCount})
        </button>
      )}
    </div>
  )
}
