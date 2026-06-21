import { useQuery } from '@tanstack/react-query'
import { analyticsApi, type DashboardData } from '@/lib/api/client'
import { asArray } from '@/lib/utils'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsApi.getDashboard,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
    select: sanitizeDashboardData,
  })
}

function sanitizeDashboardData(data: DashboardData): DashboardData {
  return {
    ...data,
    todayTasks: asArray(data?.todayTasks),
    habits: asArray(data?.habits),
    todayCompletions: asArray(data?.todayCompletions),
    activeGoals: asArray(data?.activeGoals),
    weeklyData: asArray(data?.weeklyData),
    recentActivity: asArray(data?.recentActivity),
  }
}
