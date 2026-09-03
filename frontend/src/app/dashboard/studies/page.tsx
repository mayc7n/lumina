'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Plus, Clock, BookOpen, TrendingUp, Play, Square } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { useStudies } from '@/hooks/useStudies'
import { clamp, cn, formatDate, formatDuration, ACCENT_COLORS } from '@/lib/utils'
import { format } from 'date-fns'

export default function StudiesPage() {
  const { subjects, sessions, totalMinutes, isLoading, startSession, endSession, activeSession,
    createSubject } = useStudies()
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [showCreateSubject, setShowCreateSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectColor, setNewSubjectColor] = useState('#6366f1')

  const handleStartSession = async (subjectId: string) => {
    try {
      await startSession(subjectId)
    } catch {
      // Toast is handled by the hook.
    }
  }

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) return
    try {
      await createSubject({ name: newSubjectName.trim(), color: newSubjectColor })
      setNewSubjectName('')
      setShowCreateSubject(false)
    } catch {
      // Toast is handled by the hook.
    }
  }

  const todaySessions = sessions.filter(s =>
    s.sessionDate === format(new Date(), 'yyyy-MM-dd')
  )
  const todayMinutes = todaySessions.reduce((sum, s) => sum + (Number.isFinite(s.durationMins) ? s.durationMins : 0), 0)

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Subjects sidebar */}
      <div className="w-64 border-r border-border flex flex-col shrink-0 bg-background-elevated">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="size-4 text-brand" />
              <span className="text-sm font-semibold">Estudos</span>
            </div>
            <button onClick={() => setShowCreateSubject(!showCreateSubject)}
              className="btn-ghost p-1.5">
              <Plus className="size-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-background-overlay rounded-lg text-center">
              <p className="text-lg font-bold tabular-nums text-foreground">{formatDuration(todayMinutes)}</p>
              <p className="text-2xs text-foreground-subtle">hoje</p>
            </div>
            <div className="p-2 bg-background-overlay rounded-lg text-center">
              <p className="text-lg font-bold tabular-nums text-foreground">{formatDuration(totalMinutes)}</p>
              <p className="text-2xs text-foreground-subtle">total</p>
            </div>
          </div>
        </div>

        {/* Create subject */}
        {showCreateSubject && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            className="overflow-hidden border-b border-border">
            <div className="p-3 space-y-2">
              <input autoFocus value={newSubjectName}
                onChange={e => setNewSubjectName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') void handleCreateSubject()
                }}
                placeholder="Nome da matéria..." className="input-base text-xs" />
              <div className="flex gap-1.5">
                {ACCENT_COLORS.slice(0, 6).map(c => (
                  <button key={c.id} onClick={() => setNewSubjectColor(c.hex)}
                    className="size-5 rounded-full"
                    style={{ background: c.hex, outline: newSubjectColor === c.hex ? `2px solid ${c.hex}` : 'none', outlineOffset: '2px' }} />
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" onClick={() => setShowCreateSubject(false)} className="flex-1">Cancelar</Button>
              <Button size="xs" onClick={() => void handleCreateSubject()} disabled={!newSubjectName.trim()} className="flex-1">Criar</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Subject list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <button onClick={() => setSelectedSubject(null)}
            className={cn('sidebar-item w-full', !selectedSubject && 'active')}>
            <BookOpen className="size-4" />
            <span className="text-sm">Todas</span>
          </button>
          {subjects.map(subject => (
            <button key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={cn('sidebar-item w-full', selectedSubject === subject.id && 'active')}>
              <div className="size-3 rounded-sm shrink-0" style={{ background: subject.color }} />
              <span className="text-sm flex-1 text-left truncate">{subject.name}</span>
              {subject.id === activeSession?.subjectId && (
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Active session banner */}
        {activeSession && (
          <motion.div initial={{ y: -40 }} animate={{ y: 0 }}
            className="flex items-center justify-between px-6 py-3 bg-brand/10 border-b border-brand/20 shrink-0">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-brand animate-pulse" />
              <span className="text-sm font-medium text-brand">Sessão ativa</span>
              <span className="text-xs text-foreground-muted">
                {subjects.find(s => s.id === activeSession.subjectId)?.name}
              </span>
            </div>
            <Button size="sm" variant="danger" onClick={() => void endSession()}>
              <Square className="size-3.5 fill-current" /> Encerrar
            </Button>
          </motion.div>
        )}

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-6">
          {subjects.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Nenhuma matéria ainda"
              description="Crie matérias para organizar seus estudos e acompanhar o tempo dedicado a cada área"
              action={{ label: 'Criar matéria', onClick: () => setShowCreateSubject(true) }} />
          ) : (
            <div className="space-y-6">
              {/* Subject cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {(selectedSubject ? subjects.filter(s => s.id === selectedSubject) : subjects).map((subject, i) => {
                  const subjectSessions = sessions.filter(s => s.subjectId === subject.id)
                  const subjectMins = subjectSessions.reduce((sum, s) => sum + (Number.isFinite(s.durationMins) ? s.durationMins : 0), 0)
                  const isActive = activeSession?.subjectId === subject.id

                  return (
                    <motion.div key={subject.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="card-hover p-5 relative overflow-hidden">
                      <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
                        style={{ background: subject.color }} />

                      <div className="flex items-start justify-between ml-3">
                        <div>
                          <h3 className="text-sm font-semibold">{subject.name}</h3>
                          <p className="text-xs text-foreground-muted mt-0.5">
                            {subjectSessions.length} sessões · {formatDuration(subjectMins)}
                          </p>
                        </div>
                        <Button size="xs"
                          variant={isActive ? 'danger' : 'secondary'}
                          onClick={() => isActive ? void endSession() : void handleStartSession(subject.id)}
                          loading={false}>
                          {isActive
                            ? <><Square className="size-3 fill-current" /> Parar</>
                            : <><Play className="size-3 fill-current" /> Iniciar</>
                          }
                        </Button>
                      </div>

                      {subject.goalHours && (
                        <div className="ml-3 mt-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-foreground-subtle">Meta: {subject.goalHours}h</span>
                            <span className="font-medium">{Math.round(clamp(subjectMins / 60 / subject.goalHours * 100))}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill"
                              style={{ width: `${clamp(subjectMins / 60 / subject.goalHours * 100)}%`, background: subject.color }} />
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Recent sessions */}
              <div>
                <h2 className="text-sm font-semibold text-foreground-muted mb-3 uppercase tracking-wider text-xs">
                  Sessões recentes
                </h2>
                <div className="space-y-2">
                  {sessions.slice(0, 10).map(session => {
                    const subject = subjects.find(s => s.id === session.subjectId)
                    return (
                      <div key={session.id}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-border-strong transition-colors">
                        {subject && <div className="size-2.5 rounded-sm shrink-0" style={{ background: subject.color }} />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{subject?.name ?? 'Matéria'}</p>
                          <p className="text-xs text-foreground-subtle">
                            {formatDate(`${session.sessionDate}T12:00:00`, "d 'de' MMMM")}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium text-foreground-muted">
                          <Clock className="size-3.5" />
                          {formatDuration(session.durationMins)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
