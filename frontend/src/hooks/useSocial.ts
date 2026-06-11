import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api/client'
import { toast } from 'sonner'

export interface FeedItem {
  id: string
  user: { id: string; displayName: string; username: string; avatarUrl?: string }
  type: string
  title: string
  description?: string
  emoji?: string
  likeCount?: number
  liked?: boolean
  createdAt: string
}

export interface Friend {
  id: string
  displayName: string
  username: string
  avatarUrl?: string
  isOnline?: boolean
  streak?: number
  friendshipStatus?: string
}

export interface FriendRequest { id: string; user: Friend; createdAt: string }

export const socialKeys = {
  feed:    ['social', 'feed'] as const,
  friends: ['social', 'friends'] as const,
  requests: ['social', 'requests'] as const,
  search: (query: string) => ['social', 'search', query] as const,
}

export function useSocial(searchQuery = '') {
  const queryClient = useQueryClient()

  const feedQuery = useQuery({
    queryKey: socialKeys.feed,
    queryFn: () => apiGet<FeedItem[]>('/social/feed'),
    staleTime: 60_000,
  })

  const friendsQuery = useQuery({
    queryKey: socialKeys.friends,
    queryFn: () => apiGet<Friend[]>('/social/friends'),
    staleTime: 2 * 60_000,
  })

  const requestsQuery = useQuery({
    queryKey: socialKeys.requests,
    queryFn: () => apiGet<FriendRequest[]>('/social/friends/requests'),
    staleTime: 60_000,
  })

  const searchQueryResult = useQuery({
    queryKey: socialKeys.search(searchQuery),
    queryFn: () => apiGet<Friend[]>('/social/users', { query: searchQuery }),
    enabled: searchQuery.trim().length >= 2,
    staleTime: 30_000,
  })

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => apiPost('/social/friends/request', { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.friends })
      toast.success('Solicitação de amizade enviada!')
    },
    onError: () => toast.error('Erro ao enviar solicitação'),
  })

  const acceptRequestMutation = useMutation({
    mutationFn: (requestId: string) => apiPost(`/social/friends/request/${requestId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialKeys.friends })
      queryClient.invalidateQueries({ queryKey: socialKeys.requests })
      toast.success('Amizade aceita!')
    },
  })

  return {
    feed:          feedQuery.data ?? [],
    friends:       friendsQuery.data ?? [],
    requests:      requestsQuery.data ?? [],
    searchResults: searchQueryResult.data ?? [],
    isSearching:   searchQueryResult.isFetching,
    isLoading:     feedQuery.isLoading || friendsQuery.isLoading,
    sendRequest:   sendRequestMutation.mutateAsync,
    acceptRequest: acceptRequestMutation.mutateAsync,
  }
}
