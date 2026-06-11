import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { focusApi } from '@/lib/api/client'
import { toast } from 'sonner'

const focusKeys = {
  history: ['focus', 'history'] as const,
  stats: ['focus', 'stats'] as const,
}

export function useFocus() {
  const queryClient = useQueryClient()
  const historyQuery = useQuery({
    queryKey: focusKeys.history,
    queryFn: () => focusApi.getHistory(),
    staleTime: 15_000,
  })
  const statsQuery = useQuery({
    queryKey: focusKeys.stats,
    queryFn: focusApi.getStats,
    staleTime: 30_000,
  })

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: focusKeys.history })
    queryClient.invalidateQueries({ queryKey: focusKeys.stats })
  }

  const startMutation = useMutation({
    mutationFn: focusApi.startSession,
    onSuccess: () => {
      refresh()
      toast.success('Sessão de foco iniciada')
    },
    onError: () => toast.error('Não foi possível iniciar a sessão'),
  })

  const completeMutation = useMutation({
    mutationFn: ({ id, focusScore }: { id: string; focusScore?: number }) =>
      focusApi.completeSession(id, { focusScore }),
    onSuccess: () => {
      refresh()
      toast.success('Sessão concluída')
    },
    onError: () => toast.error('Não foi possível concluir a sessão'),
  })

  const abandonMutation = useMutation({
    mutationFn: focusApi.abandonSession,
    onSuccess: () => {
      refresh()
      toast.success('Sessão encerrada')
    },
  })

  const sessions = historyQuery.data ?? []

  return {
    sessions,
    activeSession: sessions.find(session => session.status === 'ACTIVE'),
    stats: statsQuery.data,
    isLoading: historyQuery.isLoading || statsQuery.isLoading,
    startSession: startMutation.mutateAsync,
    completeSession: completeMutation.mutateAsync,
    abandonSession: abandonMutation.mutateAsync,
    isStarting: startMutation.isPending,
  }
}
