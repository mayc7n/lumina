import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { journalApi, type CreateJournalRequest, type JournalEntry } from '@/lib/api/client'
import { toast } from 'sonner'
import { asArray } from '@/lib/utils'

const journalKeys = { all: ['journal'] as const }

export function useJournal(search?: string) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: [...journalKeys.all, search],
    queryFn: () => journalApi.getAll(search ? { search } : undefined),
    staleTime: 30_000,
    select: data => asArray<JournalEntry>(data),
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: journalKeys.all })

  const createMutation = useMutation({
    mutationFn: (data: CreateJournalRequest) => journalApi.create(data),
    onSuccess: () => { refresh(); toast.success('Entrada salva') },
    onError: () => toast.error('Não foi possível salvar a entrada'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJournalRequest> }) => journalApi.update(id, data),
    onSuccess: refresh,
    onError: () => toast.error('Não foi possível atualizar a entrada'),
  })
  const deleteMutation = useMutation({
    mutationFn: journalApi.delete,
    onSuccess: () => { refresh(); toast.success('Entrada excluída') },
    onError: () => toast.error('Não foi possível excluir a entrada'),
  })
  const pinMutation = useMutation({
    mutationFn: journalApi.togglePin,
    onSuccess: refresh,
    onError: () => toast.error('Não foi possível atualizar o destaque'),
  })

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
    createEntry: createMutation.mutateAsync,
    updateEntry: updateMutation.mutateAsync,
    deleteEntry: deleteMutation.mutateAsync,
    togglePin: pinMutation.mutateAsync,
    isSaving: createMutation.isPending || updateMutation.isPending,
  }
}
