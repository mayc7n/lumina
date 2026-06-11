'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTasks, useProjects } from '@/hooks/useTasks'
import { EmptyState, SkeletonList } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { CheckSquare, Plus, Circle, CheckCircle2, Flag, Calendar } from 'lucide-react'
import { getPriorityConfig, formatDateRelative, cn } from '@/lib/utils'
import type { Task } from '@/lib/api/client'
import { toast } from 'sonner'

export default function TasksPage() {
  const [createTitle, setCreateTitle] = useState('')
  const { tasks, isLoading, createTask, toggleTask, isCreating } = useTasks()
  const { projects } = useProjects()

  const done     = tasks.filter(t => t.status === 'DONE')
  const pending  = tasks.filter(t => t.status !== 'DONE')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createTitle.trim()) return
    await createTask({ title: createTitle.trim() })
    setCreateTitle('')
    toast.success('Tarefa criada!')
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-brand/10 flex items-center justify-center"><CheckSquare size={16} className="text-brand"/></div>
        <div><h1 className="text-base font-semibold">Tarefas</h1><p className="text-xs text-foreground-muted">{pending.length} pendentes · {done.length} concluídas</p></div>
      </div>

      {/* Quick create */}
      <form onSubmit={handleCreate} className="flex items-center gap-2 p-3 bg-background-elevated border border-border rounded-xl">
        <Plus size={16} className="text-foreground-subtle shrink-0"/>
        <input value={createTitle} onChange={e=>setCreateTitle(e.target.value)} placeholder="Nova tarefa..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-subtle"/>
        {createTitle.trim() && <Button size="xs" type="submit" loading={isCreating}>Criar</Button>}
      </form>

      {/* Task list */}
      {isLoading ? <SkeletonList count={6}/> :
       tasks.length === 0 ? <EmptyState icon={CheckSquare} title="Nenhuma tarefa" description="Crie sua primeira tarefa acima"/> :
      <div className="space-y-1">
        {pending.map((task,i) => <TaskRow key={task.id} task={task} onToggle={()=>toggleTask(task.id)} delay={i*0.03}/>)}
        {done.length > 0 && (
          <>
            <p className="text-2xs font-medium text-foreground-subtle uppercase tracking-wider pt-3 pb-1">Concluídas</p>
            {done.slice(0,5).map(task => <TaskRow key={task.id} task={task} onToggle={()=>toggleTask(task.id)}/>)}
          </>
        )}
      </div>}
    </div>
  )
}

function TaskRow({ task, onToggle, delay=0 }: { task: Task; onToggle: ()=>void; delay?: number }) {
  const isDone = task.status === 'DONE'
  const p = getPriorityConfig(task.priority)
  return (
    <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay}} layout
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-background-overlay transition-colors group">
      <button onClick={onToggle} className="shrink-0">
        {isDone ? <CheckCircle2 size={16} strokeWidth={2} className="text-success"/> : <Circle size={16} strokeWidth={1.5} className="text-foreground-subtle group-hover:text-foreground-muted"/>}
      </button>
      {task.priority !== 'NONE' && !isDone && <div className="size-1.5 rounded-full shrink-0" style={{background:p.color}}/>}
      <span className={cn('flex-1 text-sm truncate',isDone?'line-through text-foreground-muted':'text-foreground')}>{task.title}</span>
      {task.dueDate && !isDone && (
        <span className="text-2xs text-foreground-subtle flex items-center gap-1 shrink-0">
          <Calendar size={11}/>{formatDateRelative(task.dueDate)}
        </span>
      )}
    </motion.div>
  )
}
