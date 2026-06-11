import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, type Task, type CreateTaskRequest } from '@/lib/api/client'
import { toast } from 'sonner'

export const taskKeys = {
  all: ['tasks'] as const,
  list: (f?: Record<string, unknown>) => [...taskKeys.all, 'list', f] as const,
  today: () => [...taskKeys.all, 'today'] as const,
  detail: (id: string) => [...taskKeys.all, id] as const,
  projects: () => [...taskKeys.all, 'projects'] as const,
}

export function useTasks(params?: Record<string, unknown>) {
  const qc = useQueryClient()
  const query = useQuery({ queryKey: taskKeys.list(params), queryFn: () => tasksApi.getAll(params), staleTime: 30_000, select: d => d.content })
  const todayQ = useQuery({ queryKey: taskKeys.today(), queryFn: tasksApi.getToday, staleTime: 60_000 })

  const createMut = useMutation({
    mutationFn: (d: CreateTaskRequest) => tasksApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: taskKeys.all }) },
    onError: () => toast.error('Falha ao criar tarefa'),
  })

  const toggleMut = useMutation({
    mutationFn: (id: string) => tasksApi.toggleComplete(id),
    onMutate: async id => {
      await qc.cancelQueries({ queryKey: taskKeys.all })
      const prev = qc.getQueriesData({ queryKey: taskKeys.all })
      qc.setQueriesData({ queryKey: taskKeys.all }, (old: Task[] | undefined) =>
        old?.map(t => t.id === id ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE', completedAt: t.status === 'DONE' ? undefined : new Date().toISOString() } : t))
      return { prev }
    },
    onError: (_, __, ctx) => { ctx?.prev?.forEach(([k, v]) => qc.setQueryData(k, v)) },
    onSettled: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateTaskRequest> & { status?: string } }) => tasksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
    onError: () => toast.error('Falha ao atualizar tarefa'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => tasksApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: taskKeys.all }); toast.success('Tarefa removida') },
    onError: () => toast.error('Falha ao remover tarefa'),
  })

  const tasks = query.data ?? []
  return {
    tasks, todayTasks: todayQ.data ?? [], isLoading: query.isLoading, isFetching: query.isFetching,
    stats: { total: tasks.length, completed: tasks.filter(t => t.status === 'DONE').length, todo: tasks.filter(t => t.status === 'TODO').length },
    createTask: createMut.mutateAsync,
    toggleTask: toggleMut.mutateAsync,
    updateTask: updateMut.mutateAsync,
    deleteTask: deleteMut.mutateAsync,
    isCreating: createMut.isPending,
  }
}

export function useTaskDetail(id: string) {
  return useQuery({ queryKey: taskKeys.detail(id), queryFn: () => tasksApi.getById(id), enabled: !!id, staleTime: 30_000 })
}

export function useProjects() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: taskKeys.projects(), queryFn: tasksApi.getProjects, staleTime: 5 * 60_000 })
  const create = useMutation({
    mutationFn: tasksApi.createProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.projects() }),
  })
  return { projects: q.data ?? [], isLoading: q.isLoading, createProject: create.mutateAsync, isCreating: create.isPending }
}
