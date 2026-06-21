import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { goalsApi, type CreateGoalRequest, type Goal } from '@/lib/api/client'
import { toast } from 'sonner'
import { asArray } from '@/lib/utils'

const goalKeys = { all: ['goals'] as const, list: (s?: string) => [...goalKeys.all, s] as const }

export function useGoals(status?: string) {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: goalKeys.list(status),
    queryFn: () => goalsApi.getAll(status),
    staleTime: 60_000,
    select: data => asArray<Goal>(data),
  })

  const createMut = useMutation({
    mutationFn: (d: CreateGoalRequest) => goalsApi.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: goalKeys.all }); toast.success('Meta criada!') },
    onError: () => toast.error('Falha ao criar meta'),
  })

  const checkInMut = useMutation({
    mutationFn: ({ id, value, note, mood }: { id: string; value: number; note?: string; mood?: string }) => goalsApi.checkIn(id, { value, note, mood }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: goalKeys.all }); toast.success('Progresso registrado!') },
    onError: () => toast.error('Falha ao registrar progresso'),
  })

  return {
    goals: q.data ?? [], isLoading: q.isLoading,
    createGoal: createMut.mutateAsync,
    checkIn: checkInMut.mutateAsync,
    isCreating: createMut.isPending,
  }
}
