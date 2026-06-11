import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api'

export const api: AxiosInstance = axios.create({
  baseURL: API_URL, timeout: 15000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
})

let isRefreshing = false
let queue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = []
const processQueue = (err: unknown, token: string | null = null) => {
  queue.forEach(({ resolve, reject }) => err ? reject(err) : resolve(token!))
  queue = []
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('lumina-auth')
    if (raw) {
      try {
        const { state } = JSON.parse(raw)
        if (state?.accessToken) config.headers.Authorization = `Bearer ${state.accessToken}`
      } catch {}
    }
  }
  return config
})

api.interceptors.response.use(r => r, async error => {
  const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
  if (error.response?.status !== 401 || orig._retry) return Promise.reject(error)
  if (isRefreshing) return new Promise<string>((resolve, reject) => queue.push({ resolve, reject }))
    .then(t => { orig.headers.Authorization = `Bearer ${t}`; return api(orig) })
  orig._retry = true; isRefreshing = true
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('lumina-auth') : null
    const { state } = raw ? JSON.parse(raw) : { state: {} }
    if (!state?.refreshToken) throw new Error('No refresh token')
    const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: state.refreshToken })
    const { accessToken, refreshToken } = res.data.data
    const parsed = JSON.parse(raw!)
    parsed.state.accessToken = accessToken; parsed.state.refreshToken = refreshToken
    localStorage.setItem('lumina-auth', JSON.stringify(parsed))
    processQueue(null, accessToken)
    orig.headers.Authorization = `Bearer ${accessToken}`
    return api(orig)
  } catch (e) {
    processQueue(e); localStorage.removeItem('lumina-auth'); window.location.href = '/auth/login'
    return Promise.reject(e)
  } finally { isRefreshing = false }
})

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const r = await api.get<{ data: T }>(url, { params }); return r.data.data
}
export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const r = await api.post<{ data: T }>(url, data); return r.data.data
}
export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const r = await api.put<{ data: T }>(url, data); return r.data.data
}
export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const r = await api.patch<{ data: T }>(url, data); return r.data.data
}
export async function apiDelete<T = void>(url: string): Promise<T> {
  const r = await api.delete<{ data: T }>(url); return r.data.data
}

// Resource APIs
export const authApi = {
  register: (d: { email: string; username: string; displayName: string; password: string }) => apiPost<AuthTokens>('/auth/register', d),
  login: (d: { email: string; password: string }) => apiPost<AuthTokens>('/auth/login', d),
  logout: (refreshToken: string) => apiPost<void>('/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) => apiPost<AuthTokens>('/auth/refresh', { refreshToken }),
  forgotPassword: (email: string) => apiPost<void>('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) => apiPost<void>('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token: string) => apiPost<void>('/auth/verify-email', { token }),
  enable2fa: () => apiPost<{ secret: string; qrCodeUrl: string }>('/auth/2fa/enable'),
  confirm2fa: (code: string) => apiPost<void>('/auth/2fa/confirm', { code }),
  getSessions: () => apiGet<UserSession[]>('/auth/sessions'),
  revokeSession: (id: string) => apiDelete(`/auth/sessions/${id}`),
}

export const usersApi = {
  getMe: () => apiGet<User>('/users/me'),
  updateProfile: (d: Partial<User>) => apiPatch<User>('/users/me', d),
  uploadAvatar: (file: File) => { const fd = new FormData(); fd.append('file', file); return api.patch<{ data: { avatarUrl: string } }>('/users/me/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data.data) },
  updatePreferences: (d: Record<string, unknown>) => apiPatch<UserPreferences>('/users/me/preferences', d),
  exportData: () => api.get('/users/me/export', { responseType: 'blob' }),
  deleteAccount: (confirmation: string) => api.delete('/users/me', { data: { confirmation } }),
}

export const tasksApi = {
  getAll: (params?: Record<string, unknown>) => apiGet<PagedResponse<Task>>('/tasks', params),
  getToday: () => apiGet<Task[]>('/tasks/today'),
  getUpcoming: (days = 7) => apiGet<Task[]>('/tasks/upcoming', { days }),
  getOverdue: () => apiGet<Task[]>('/tasks/overdue'),
  getInbox: () => apiGet<Task[]>('/tasks/inbox'),
  getById: (id: string) => apiGet<Task>(`/tasks/${id}`),
  create: (d: CreateTaskRequest) => apiPost<Task>('/tasks', d),
  update: (id: string, d: Partial<CreateTaskRequest> & { status?: string }) => apiPut<Task>(`/tasks/${id}`, d),
  toggleComplete: (id: string) => apiPatch<Task>(`/tasks/${id}/complete`),
  delete: (id: string) => apiDelete(`/tasks/${id}`),
  getProjects: () => apiGet<Project[]>('/tasks/projects'),
  createProject: (d: { name: string; color?: string; icon?: string }) => apiPost<Project>('/tasks/projects', d),
  getLabels: () => apiGet<Label[]>('/tasks/labels'),
  createLabel: (d: { name: string; color?: string; icon?: string }) => apiPost<Label>('/tasks/labels', d),
}

export const habitsApi = {
  getAll: () => apiGet<Habit[]>('/habits'),
  getById: (id: string) => apiGet<Habit>(`/habits/${id}`),
  create: (d: CreateHabitRequest) => apiPost<Habit>('/habits', d),
  update: (id: string, d: Partial<CreateHabitRequest>) => apiPut<Habit>(`/habits/${id}`, d),
  delete: (id: string) => apiDelete(`/habits/${id}`),
  complete: (id: string, d?: { value?: number; note?: string }) => apiPost<void>(`/habits/${id}/complete`, d),
  uncomplete: (id: string, date?: string) => api.delete(`/habits/${id}/complete`, { data: { date } }),
  getTodayCompletions: () => apiGet<string[]>('/habits/today/completions'),
  getCompletions: (id: string, from: string, to: string) => apiGet<HabitCompletion[]>(`/habits/${id}/completions`, { from, to }),
  getStreak: (id: string) => apiGet<HabitStreak>(`/habits/${id}/streak`),
}

export const goalsApi = {
  getAll: (status?: string) => apiGet<Goal[]>('/goals', status ? { status } : undefined),
  getById: (id: string) => apiGet<Goal>(`/goals/${id}`),
  create: (d: CreateGoalRequest) => apiPost<Goal>('/goals', d),
  update: (id: string, d: Partial<CreateGoalRequest> & { status?: string }) => apiPut<Goal>(`/goals/${id}`, d),
  delete: (id: string) => apiDelete(`/goals/${id}`),
  checkIn: (id: string, d: { value: number; note?: string; mood?: string }) => apiPost<void>(`/goals/${id}/check-in`, d),
  getMilestones: (id: string) => apiGet<GoalMilestone[]>(`/goals/${id}/milestones`),
  createMilestone: (goalId: string, d: { title: string; dueDate?: string }) => apiPost<GoalMilestone>(`/goals/${goalId}/milestones`, d),
}

export const journalApi = {
  getAll: (params?: { search?: string }) => apiGet<JournalEntry[]>('/journal', params),
  getById: (id: string) => apiGet<JournalEntry>(`/journal/${id}`),
  create: (d: CreateJournalRequest) => apiPost<JournalEntry>('/journal', d),
  update: (id: string, d: Partial<CreateJournalRequest>) => apiPut<JournalEntry>(`/journal/${id}`, d),
  delete: (id: string) => apiDelete(`/journal/${id}`),
  togglePin: (id: string) => apiPatch<void>(`/journal/${id}/pin`),
}

export const booksApi = {
  getAll: (status?: string) => apiGet<Book[]>('/books', status ? { status } : undefined),
  getById: (id: string) => apiGet<Book>(`/books/${id}`),
  search: (q: string) => apiGet<BookSearchResult[]>('/books/search', { query: q }),
  create: (d: CreateBookRequest) => apiPost<Book>('/books', d),
  update: (id: string, d: Partial<Book>) => apiPut<Book>(`/books/${id}`, d),
  delete: (id: string) => apiDelete(`/books/${id}`),
  logReading: (bookId: string, d: { pagesRead: number; durationMins?: number; note?: string }) => apiPost<void>(`/books/${bookId}/log`, d),
}

export const focusApi = {
  startSession: (d: { mode: string; taskId?: string; plannedMins: number }) => apiPost<FocusSession>('/focus/sessions', d),
  completeSession: (id: string, d?: { notes?: string; focusScore?: number }) => apiPatch<FocusSession>(`/focus/sessions/${id}/complete`, d),
  abandonSession: (id: string) => apiPatch<void>(`/focus/sessions/${id}/abandon`),
  getHistory: (params?: { from?: string; to?: string }) => apiGet<FocusSession[]>('/focus/sessions', params),
  getStats: () => apiGet<FocusStats>('/focus/stats'),
}

export const analyticsApi = {
  getDashboard: () => apiGet<DashboardData>('/analytics/dashboard'),
  getWeekly: (from: string) => apiGet<WeeklyAnalytics>('/analytics/weekly', { from }),
}

export const notificationsApi = {
  getAll: () => apiGet<Notification[]>('/notifications'),
  markRead: (id: string) => apiPatch<void>(`/notifications/${id}/read`),
  markAllRead: () => apiPatch<void>('/notifications/read-all'),
  delete: (id: string) => apiDelete(`/notifications/${id}`),
  getUnreadCount: () => apiGet<{ count: number }>('/notifications/unread-count'),
}

// ── Types ──────────────────────────────────────────────────
export interface AuthTokens { accessToken: string; refreshToken: string; expiresIn: number; requiresTwoFactor?: boolean; tempToken?: string }
export interface User { id: string; email: string; username: string; displayName: string; avatarUrl?: string; bio?: string; timezone: string; locale: string; status: string; role: string; plan: string; emailVerified: boolean; twoFactorEnabled: boolean; onboardingComplete: boolean; lastSeenAt?: string; createdAt: string; accentColor?: string }
export interface UserSession { id: string; deviceType: string; deviceName?: string; ipAddress?: string; lastUsedAt: string; createdAt: string; current?: boolean }
export interface UserPreferences { theme: string; accentColor: string; weekStartsOn: number; dailyGoalHours: number; notificationSettings: Record<string, boolean> }
export interface PagedResponse<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number }
export interface Task { id: string; title: string; description?: string; status: string; priority: string; dueDate?: string; scheduledFor?: string; estimatedMins?: number; projectId?: string; project?: Project; labels?: Label[]; parentTaskId?: string; subtaskCount?: number; completedSubtaskCount?: number; recurrenceType: string; completedAt?: string; createdAt: string; updatedAt: string }
export interface TaskQueryParams { status?: string; priority?: string; projectId?: string; dueDateFrom?: string; dueDateTo?: string; search?: string; labelIds?: string[] }
export interface Project { id: string; name: string; description?: string; color: string; icon?: string; orderIndex: number; taskCount?: number }
export interface Label { id: string; name: string; color: string; icon?: string }
export interface Habit { id: string; name: string; description?: string; icon?: string; color: string; habitType: string; frequency: string; frequencyDays?: number[]; targetValue: number; targetUnit?: string; startDate: string; reminderTime?: string; orderIndex: number; streak?: HabitStreak; createdAt: string }
export interface HabitCompletion { id: string; completedDate: string; value: number; note?: string }
export interface HabitStreak { currentStreak: number; longestStreak: number; lastCompleted?: string; totalCompletions: number }
export interface Goal { id: string; title: string; description?: string; icon?: string; color: string; status: string; period: string; startDate: string; endDate?: string; targetValue?: number; currentValue: number; unit?: string; progressPct: number; isPublic: boolean; milestones?: GoalMilestone[]; completedAt?: string; createdAt: string }
export interface GoalMilestone { id: string; title: string; description?: string; targetValue?: number; dueDate?: string; completedAt?: string; orderIndex: number }
export interface JournalEntry { id: string; title?: string; content: string; mood?: string; energy?: string; wordCount: number; isPinned: boolean; entryDate: string; tags: string[]; createdAt: string; updatedAt: string }
export interface Book { id: string; title: string; author?: string; coverUrl?: string; totalPages?: number; currentPage: number; status: string; rating?: number; review?: string; genre?: string; startedAt?: string; finishedAt?: string; tags: string[]; progressPct?: number }
export interface BookSearchResult { googleBooksId: string; title: string; author: string; coverUrl?: string; totalPages?: number; genre?: string }
export interface FocusSession { id: string; mode: string; status: string; plannedMins: number; actualMins: number; breaksTaken: number; focusScore?: number; taskId?: string; notes?: string; startedAt: string; completedAt?: string }
export interface FocusStats { totalSessions: number; totalFocusMins: number; avgSessionMins: number; avgFocusScore: number; longestStreakDays: number; currentStreakDays: number; weeklyMins: number }
export interface DashboardData { todayTasks: Task[]; habits: Habit[]; todayCompletions: string[]; activeGoals: Goal[]; focusStats: FocusStats; streak: number; longestStreak: number; weeklyData: WeeklyDataPoint[]; recentActivity: ActivityItem[]; moodCheckedIn: boolean }
export interface WeeklyDataPoint { date: string; tasksCompleted: number; habitRate: number; focusMins: number; productivityScore: number }
export interface ActivityItem { id: string; type: string; description: string; createdAt: string }
export interface WeeklyAnalytics { daily: WeeklyDataPoint[]; tasksByDayOfWeek: { day: string; count: number }[]; focusDistribution: { name: string; value: number }[]; moodTrend: { date: string; moodValue: number }[]; areaBalance: { area: string; score: number }[]; productivityScore: number; tasksCompleted: number; habitRate: number; focusMins: number; streak: number; insights: Insight[] }
export interface Insight { icon: string; title: string; description: string; type: 'success' | 'warning' | 'info' }
export interface Notification { id: string; type: string; title: string; body?: string; isRead: boolean; createdAt: string }
export interface CreateTaskRequest { title: string; description?: string; priority?: string; dueDate?: string; scheduledFor?: string; estimatedMins?: number; projectId?: string; labelIds?: string[] }
export interface CreateHabitRequest { name: string; description?: string; icon?: string; color?: string; habitType?: string; frequency?: string; frequencyDays?: number[]; targetValue?: number; targetUnit?: string; startDate?: string; reminderTime?: string }
export interface CreateGoalRequest { title: string; description?: string; icon?: string; color?: string; period: string; startDate: string; endDate?: string; targetValue?: number; unit?: string; isPublic?: boolean }
export interface CreateJournalRequest { title?: string; content: string; mood?: string; energy?: string; tags?: string[]; entryDate?: string }
export interface CreateBookRequest { title: string; author?: string; coverUrl?: string; totalPages?: number; status?: string; genre?: string; googleBooksId?: string }
