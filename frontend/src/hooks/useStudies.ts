import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch } from '@/lib/api/client'
import { toast } from 'sonner'

export interface StudySubject {
  id: string
  name: string
  description?: string
  color: string
  icon?: string
  goalHours?: number
  isArchived: boolean
  createdAt: string
}

export interface StudySession {
  id: string
  subjectId?: string
  title?: string
  durationMins: number
  quality?: number
  sessionDate: string
  startedAt?: string
  endedAt?: string
}

export interface ActiveSession {
  id: string
  subjectId: string
  startedAt: string
}

const studyKeys = {
  subjects: ['studies', 'subjects'] as const,
  sessions: ['studies', 'sessions'] as const,
}

export function useStudies() {
  const queryClient = useQueryClient()

  const subjectsQuery = useQuery({
    queryKey: studyKeys.subjects,
    queryFn: () => apiGet<StudySubject[]>('/studies/subjects'),
    staleTime: 5 * 60_000,
  })

  const sessionsQuery = useQuery({
    queryKey: studyKeys.sessions,
    queryFn: () => apiGet<StudySession[]>('/studies/sessions'),
    staleTime: 60_000,
  })

  const createSubjectMutation = useMutation({
    mutationFn: (data: { name: string; color: string; goalHours?: number }) =>
      apiPost<StudySubject>('/studies/subjects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyKeys.subjects })
      toast.success('Matéria criada!')
    },
    onError: () => toast.error('Erro ao criar matéria'),
  })

  const createSessionMutation = useMutation({
    mutationFn: (data: { subjectId?: string; durationMins?: number; title?: string }) =>
      apiPost<StudySession>('/studies/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyKeys.sessions })
    },
  })

  const startSession = async (subjectId: string) => {
    await createSessionMutation.mutateAsync({ subjectId })
    toast.success('Sessão de estudo iniciada!')
  }

  const endSession = async () => {
    if (!activeSession) return
    const ended = await apiPatch<StudySession>(`/studies/sessions/${activeSession.id}/end`)
    queryClient.invalidateQueries({ queryKey: studyKeys.sessions })
    toast.success(`Sessão encerrada — ${ended.durationMins} minutos estudados!`)
  }

  const sessions = sessionsQuery.data ?? []
  const activeSession = sessions.find(session => !session.endedAt && session.startedAt) as ActiveSession | undefined
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMins, 0)

  return {
    subjects:       subjectsQuery.data ?? [],
    sessions,
    totalMinutes,
    isLoading:      subjectsQuery.isLoading,
    activeSession: activeSession ?? null,
    startSession,
    endSession,
    createSubject:  createSubjectMutation.mutateAsync,
  }
}
