import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { booksApi, type CreateBookRequest } from '@/lib/api/client'
import { toast } from 'sonner'

const bookKeys = { all: ['books'] as const }

export function useBooks(status?: string) {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: [...bookKeys.all, status],
    queryFn: () => booksApi.getAll(status),
    staleTime: 30_000,
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: bookKeys.all })

  const createMutation = useMutation({
    mutationFn: (data: CreateBookRequest) => booksApi.create(data),
    onSuccess: () => { refresh(); toast.success('Livro adicionado') },
    onError: () => toast.error('Não foi possível adicionar o livro'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => booksApi.update(id, data),
    onSuccess: refresh,
  })
  const logMutation = useMutation({
    mutationFn: ({ id, pagesRead }: { id: string; pagesRead: number }) => booksApi.logReading(id, { pagesRead }),
    onSuccess: () => { refresh(); toast.success('Leitura registrada') },
  })
  const deleteMutation = useMutation({
    mutationFn: booksApi.delete,
    onSuccess: () => { refresh(); toast.success('Livro removido') },
  })

  return {
    books: query.data ?? [],
    isLoading: query.isLoading,
    createBook: createMutation.mutateAsync,
    updateBook: updateMutation.mutateAsync,
    logReading: logMutation.mutateAsync,
    deleteBook: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}
