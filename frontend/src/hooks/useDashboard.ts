import { useQuery } from '@tanstack/react-query'
import { analyticsApi } from '@/lib/api/client'

export function useDashboard() {
  return useQuery({ queryKey: ['dashboard'], queryFn: analyticsApi.getDashboard, staleTime: 60_000, refetchInterval: 5 * 60_000 })
}
