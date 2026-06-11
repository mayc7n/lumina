import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { habitsApi, type Habit, type CreateHabitRequest } from '@/lib/api/client'
import { toast } from 'sonner'
import { format } from 'date-fns'

export const habitKeys = {
  all: ['habits'] as const,
  list: () => [...habitKeys.all, 'list'] as const,
  today: () => [...habitKeys.all, 'today'] as const,
  completions: (id: string, f: string, t: string) => [...habitKeys.all, 'completions', id, f, t] as const,
  streak: (id: string) => [...habitKeys.all, 'streak', id] as const,
}

export function useHabits() {
  const qc = useQueryClient()
  const today = format(new Date(), 'yyyy-MM-dd')

  const habitsQ = useQuery({ queryKey: habitKeys.list(), queryFn: habitsApi.getAll, staleTime: 60_000 })
  const todayQ  = useQuery({ queryKey: habitKeys.today(), queryFn: habitsApi.getTodayCompletions, staleTime: 30_000 })

  const completeMut = useMutation({
    mutationFn: ({ id, value, note }: { id: string; value?: number; note?: string }) => habitsApi.complete(id, { value, note }),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: habitKeys.today() })
      const prev = qc.getQueryData<string[]>(habitKeys.today())
      qc.setQueryData<string[]>(habitKeys.today(), old => old?.includes(id) ? old : [...(old ?? []), id])
      return { prev }
    },
    onError: (_, __, ctx) => { if (ctx?.prev) qc.setQueryData(habitKeys.today(), ctx.prev) },
    onSettled: (_, __, { id }) => { qc.invalidateQueries({ queryKey: habitKeys.today() }); qc.invalidateQueries({ queryKey: habitKeys.streak(id) }) },
  })

  const uncompleteMut = useMutation({
    mutationFn: (id: string) => habitsApi.uncomplete(id, today),
    onMutate: async id => {
      const prev = qc.getQueryData<string[]>(habitKeys.today())
      qc.setQueryData<string[]>(habitKeys.today(), old => old?.filter(x => x !== id))
      return { prev }
    },
    onError: (_, __, ctx) => { if (ctx?.prev) qc.setQueryData(habitKeys.today(), ctx.prev) },
    onSettled: () => qc.invalidateQueries({ queryKey: habitKeys.today() }),
  })

  const createMut = useMutation({
    mutationFn: (d: CreateHabitRequest) => habitsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: habitKeys.list() }); toast.success('Hábito criado!') },
    onError: () => toast.error('Falha ao criar hábito'),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => habitsApi.delete(id),
    onSuccess: (_, id) => { qc.setQueryData<Habit[]>(habitKeys.list(), old => old?.filter(h => h.id !== id)); toast.success('Hábito arquivado') },
  })

  return {
    habits: habitsQ.data ?? [], todayCompletions: todayQ.data ?? [],
    isLoading: habitsQ.isLoading,
    completeHabit: (id: string, value?: number, note?: string) => completeMut.mutateAsync({ id, value, note }),
    uncompleteHabit: (id: string) => uncompleteMut.mutateAsync(id),
    createHabit: createMut.mutateAsync,
    deleteHabit: deleteMut.mutateAsync,
    isCreating: createMut.isPending,
  }
}

export function useHabitCompletions(id: string, from: string, to: string) {
  return useQuery({ queryKey: habitKeys.completions(id, from, to), queryFn: () => habitsApi.getCompletions(id, from, to), enabled: !!id, staleTime: 5 * 60_000 })
}

export function useHabitStreak(id: string) {
  return useQuery({ queryKey: habitKeys.streak(id), queryFn: () => habitsApi.getStreak(id), enabled: !!id, staleTime: 60_000 })
}
