'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useTasks } from '@/hooks/useTasks'
import { CreateTaskModal } from '@/components/features/tasks/CreateTaskModal'
import { Button } from '@/components/ui/Button'
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn, getPriorityConfig } from '@/lib/utils'
import type { Task } from '@/lib/api/client'

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd   = endOfMonth(currentDate)
  const calStart   = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd     = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calDays    = eachDayOfInterval({ start: calStart, end: calEnd })

  const { tasks } = useTasks({
    dueDateFrom: format(calStart, 'yyyy-MM-dd'),
    dueDateTo:   format(calEnd,   'yyyy-MM-dd'),
  })

  // Map tasks by due date
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {}
    tasks.forEach(task => {
      if (task.dueDate) {
        const key = task.dueDate.slice(0, 10)
        if (!map[key]) map[key] = []
        map[key].push(task)
      }
    })
    return map
  }, [tasks])

  const selectedDateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  const selectedTasks = selectedDateStr ? (tasksByDate[selectedDateStr] ?? []) : []

  return (
    <div className="h-[calc(100vh-56px)] overflow-x-auto">
    <div className="flex h-full min-w-[720px]">
      {/* Calendar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <CalendarDays className="size-4 text-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(d => subMonths(d, 1))} className="btn-ghost p-1.5">
                <ChevronLeft className="size-4" />
              </button>
              <h1 className="text-base font-semibold capitalize min-w-40 text-center">
                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </h1>
              <button onClick={() => setCurrentDate(d => addMonths(d, 1))} className="btn-ghost p-1.5">
                <ChevronRight className="size-4" />
              </button>
            </div>
            <button onClick={() => setCurrentDate(new Date())}
              className="btn-ghost px-2 py-1 text-xs text-foreground-muted">
              Hoje
            </button>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Nova tarefa
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-border shrink-0">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-2 text-center text-xs font-medium text-foreground-muted">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7 h-full">
            {calDays.map(day => {
              const dateStr  = format(day, 'yyyy-MM-dd')
              const dayTasks = tasksByDate[dateStr] ?? []
              const isCurrentMonth = isSameMonth(day, currentDate)
              const today    = isToday(day)
              const selected = selectedDate && isSameDay(day, selectedDate)

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(isSameDay(day, selectedDate ?? new Date(-1)) ? null : day)}
                  className={cn(
                    'border-r border-b border-border p-2 min-h-[100px] cursor-pointer transition-colors',
                    'hover:bg-background-overlay',
                    !isCurrentMonth && 'opacity-40',
                    selected && 'bg-brand/5 border-brand/20'
                  )}
                >
                  {/* Day number */}
                  <div className={cn(
                    'size-6 rounded-full flex items-center justify-center text-xs font-medium mb-1',
                    today && 'bg-brand text-white',
                    !today && 'text-foreground-muted'
                  )}>
                    {format(day, 'd')}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-0.5">
                    {dayTasks.slice(0, 3).map(task => {
                      const priority = getPriorityConfig(task.priority)
                      return (
                        <div key={task.id}
                          className={cn(
                            'text-2xs px-1.5 py-0.5 rounded truncate font-medium transition-colors',
                            task.status === 'DONE'
                              ? 'bg-success/10 text-success line-through opacity-60'
                              : 'bg-brand/10 text-brand'
                          )}
                          style={task.priority !== 'NONE' && task.status !== 'DONE'
                            ? { background: priority.color + '15', color: priority.color } : {}}
                        >
                          {task.title}
                        </div>
                      )
                    })}
                    {dayTasks.length > 3 && (
                      <p className="text-2xs text-foreground-subtle pl-1">
                        +{dayTasks.length - 3} mais
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Side panel - selected day tasks */}
      {selectedDate && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="border-l border-border shrink-0 flex flex-col bg-background-elevated overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs font-medium text-foreground-muted">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
            <p className="text-sm font-semibold mt-0.5">
              {selectedTasks.length} tarefa{selectedTasks.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {selectedTasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xs text-foreground-muted">Nenhuma tarefa neste dia</p>
                <button onClick={() => setCreateOpen(true)}
                  className="text-xs text-brand hover:underline mt-1.5 block mx-auto">
                  + Adicionar tarefa
                </button>
              </div>
            ) : (
              selectedTasks.map(task => {
                const priority = getPriorityConfig(task.priority)
                return (
                  <div key={task.id}
                    className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-background-overlay transition-colors">
                    <div className={cn('size-1.5 rounded-full mt-1.5 shrink-0',
                      task.status === 'DONE' ? 'bg-success' : 'bg-border')}
                      style={task.status !== 'DONE' && task.priority !== 'NONE'
                        ? { background: priority.color } : {}} />
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-xs font-medium leading-snug',
                        task.status === 'DONE' && 'line-through text-foreground-muted')}>
                        {task.title}
                      </p>
                      {task.project && (
                        <p className="text-2xs text-foreground-subtle mt-0.5">{task.project.name}</p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="p-3 border-t border-border">
            <Button variant="secondary" size="sm" className="w-full"
              onClick={() => setCreateOpen(true)}>
              <Plus className="size-3.5" /> Adicionar tarefa
            </Button>
          </div>
        </motion.div>
      )}

      <CreateTaskModal open={createOpen} onClose={() => setCreateOpen(false)}
        defaultDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : undefined} />
    </div>
    </div>
  )
}
