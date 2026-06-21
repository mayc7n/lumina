import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch } from '@/lib/api/client'
import { toast } from 'sonner'
import { asArray } from '@/lib/utils'

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
    select: data => asArray<StudySubject>(data),
  })

  const sessionsQuery = useQuery({
    queryKey: studyKeys.sessions,
    queryFn: () => apiGet<StudySession[]>('/studies/sessions'),
    staleTime: 60_000,
    select: data => asArray<StudySession>(data),
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
    onError: () => toast.error('Não foi possível iniciar a sessão'),
  })

  const startSession = async (subjectId: string) => {
    await createSessionMutation.mutateAsync({ subjectId })
    toast.success('Sessão de estudo iniciada!')
  }

  const endSession = async () => {
    if (!activeSession) return
    try {
      const ended = await apiPatch<StudySession>(`/studies/sessions/${activeSession.id}/end`)
      queryClient.invalidateQueries({ queryKey: studyKeys.sessions })
      toast.success(`Sessão encerrada — ${ended.durationMins ?? 0} minutos estudados!`)
    } catch {
      toast.error('Não foi possível encerrar a sessão')
    }
  }

  const sessions = sessionsQuery.data ?? []
  const activeSession = sessions.find((session): session is StudySession & ActiveSession =>
    Boolean(session.subjectId && session.startedAt && !session.endedAt)
  )
  const totalMinutes = sessions.reduce((sum, s) => sum + (Number.isFinite(s.durationMins) ? s.durationMins : 0), 0)

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
