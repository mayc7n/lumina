'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, UserPlus, Search, Trophy, Flame, Target, BookOpen, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn, formatDateRelative, getInitials } from '@/lib/utils'
import { useSocial } from '@/hooks/useSocial'

type SocialTab = 'feed' | 'friends' | 'discover'

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  task_completed:   { icon: CheckSquare, color: 'text-brand',       label: 'concluiu uma tarefa'   },
  habit_streak:     { icon: Flame,       color: 'text-orange-500',  label: 'manteve um streak'     },
  goal_completed:   { icon: Target,      color: 'text-violet-500',  label: 'alcançou uma meta'     },
  book_finished:    { icon: BookOpen,    color: 'text-cyan-500',    label: 'terminou um livro'     },
  achievement:      { icon: Trophy,      color: 'text-amber-500',   label: 'desbloqueou conquista' },
}

export default function SocialPage() {
  const [tab, setTab] = useState<SocialTab>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const { feed, friends, requests, searchResults, sendRequest, acceptRequest, isLoading, isSearching } = useSocial(searchQuery)

  const tabs: { id: SocialTab; label: string; count?: number }[] = [
    { id: 'feed',     label: 'Feed'       },
    { id: 'friends',  label: 'Amigos',   count: friends.length },
    { id: 'discover', label: 'Descobrir'  },
  ]

  async function copyInviteLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/auth/register`)
      toast.success('Link de convite copiado')
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      <div className="flex-1 flex flex-col overflow-hidden max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <Users className="size-4 text-indigo-500" />
              </div>
              <div>
                <h1 className="text-base font-semibold">Social</h1>
                <p className="text-xs text-foreground-muted">Evolua junto com seus amigos</p>
              </div>
            </div>
            <Button size="sm" variant="secondary" onClick={copyInviteLink}>
              <UserPlus className="size-3.5" /> Convidar
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-background-overlay rounded-lg p-0.5 w-fit border border-border">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                  tab === t.id ? 'bg-background text-foreground shadow-xs border border-border' : 'text-foreground-muted hover:text-foreground'
                )}>
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span className="size-4 rounded-full bg-brand/15 text-brand text-2xs flex items-center justify-center">
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Feed */}
            {tab === 'feed' && (
              <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-4 px-6 space-y-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="card p-4 space-y-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-background-overlay" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 bg-background-overlay rounded w-1/3" />
                          <div className="h-2.5 bg-background-overlay rounded w-1/2" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : feed.length === 0 ? (
                  <div className="py-16">
                    <EmptyState
                      icon={Users}
                      title="Feed vazio por aqui"
                      description="Adicione amigos para ver o progresso deles e se motivar mutuamente"
                      action={{ label: 'Descobrir pessoas', onClick: () => setTab('discover') }}
                    />
                  </div>
                ) : (
                  feed.map((item, i) => {
                    const actConfig = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.task_completed
                    const ActivityIcon = actConfig.icon

                    return (
                      <motion.div key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="card-hover p-4"
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar */}
                          <div className="size-9 rounded-full bg-brand/20 flex items-center
                                          justify-center text-sm font-semibold text-brand shrink-0">
                            {item.user.avatarUrl
                              ? <img src={item.user.avatarUrl} className="size-9 rounded-full object-cover" />
                              : getInitials(item.user.displayName)
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm font-semibold">{item.user.displayName}</span>
                              <div className={cn('flex items-center gap-1', actConfig.color)}>
                                <ActivityIcon className="size-3.5" />
                                <span className="text-xs">{actConfig.label}</span>
                              </div>
                              <span className="text-xs text-foreground-subtle ml-auto shrink-0">
                                {formatDateRelative(item.createdAt)}
                              </span>
                            </div>

                            {/* Content */}
                            <div className="mt-2 p-3 bg-background-overlay rounded-lg border border-border">
                              <div className="flex items-center gap-2">
                                {item.emoji && <span className="text-lg">{item.emoji}</span>}
                                <p className="text-sm font-medium text-foreground">{item.title}</p>
                              </div>
                              {item.description && (
                                <p className="text-xs text-foreground-muted mt-1">{item.description}</p>
                              )}
                            </div>

                          </div>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </motion.div>
            )}

            {/* Friends */}
            {tab === 'friends' && (
              <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-4 px-6 space-y-3">
                {requests.length > 0 && (
                  <div className="mb-5 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">Solicitações</p>
                    {requests.map(request => (
                      <div key={request.id} className="card flex items-center gap-3 p-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-brand/20 text-xs font-semibold text-brand">
                          {getInitials(request.user.displayName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{request.user.displayName}</p>
                          <p className="text-xs text-foreground-muted">@{request.user.username}</p>
                        </div>
                        <Button size="xs" onClick={() => acceptRequest(request.id)}>Aceitar</Button>
                      </div>
                    ))}
                  </div>
                )}
                {friends.length === 0 ? (
                  <div className="py-16">
                    <EmptyState icon={Users} title="Nenhum amigo ainda"
                      description="Adicione amigos para compartilhar seu progresso"
                      action={{ label: 'Descobrir pessoas', onClick: () => setTab('discover') }} />
                  </div>
                ) : (
                  friends.map((friend, i) => (
                    <motion.div key={friend.id}
                      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="card-hover p-4 flex items-center gap-4">
                      {/* Avatar */}
                      <div className="size-11 rounded-full bg-brand/20 flex items-center justify-center
                                      text-sm font-semibold text-brand shrink-0 relative">
                        {friend.avatarUrl
                          ? <img src={friend.avatarUrl} className="size-11 rounded-full object-cover" />
                          : getInitials(friend.displayName)
                        }
                        {/* Online indicator */}
                        {friend.isOnline && (
                          <div className="absolute bottom-0 right-0 size-3 rounded-full bg-success
                                          border-2 border-background-elevated" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{friend.displayName}</p>
                        <p className="text-xs text-foreground-muted">@{friend.username}</p>
                      </div>

                      {/* Streak */}
                      {friend.streak != null && friend.streak > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-500">
                          <Flame className="size-3.5" />
                          <span className="font-bold">{friend.streak}d</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

            {/* Discover */}
            {tab === 'discover' && (
              <motion.div key="discover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-4 px-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-subtle" />
                  <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nome ou @username..."
                    className="input-base pl-9 w-full" />
                </div>

                <p className="text-xs text-foreground-muted">
                  Encontre amigos que usam o Lumina e acompanhe a evolução deles
                </p>

                {isSearching && (
                  <p className="py-8 text-center text-xs text-foreground-muted">Buscando pessoas...</p>
                )}

                {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <p className="text-center text-xs text-foreground-muted py-8">
                    Nenhum usuário encontrado para "{searchQuery}"
                  </p>
                )}

                <div className="space-y-2">
                  {searchResults.map(person => (
                    <div key={person.id} className="card-hover flex items-center gap-3 p-4">
                      <div className="flex size-10 items-center justify-center rounded-full bg-brand/20 text-sm font-semibold text-brand">
                        {person.avatarUrl ? <img src={person.avatarUrl} className="size-10 rounded-full object-cover" /> : getInitials(person.displayName)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{person.displayName}</p>
                        <p className="text-xs text-foreground-muted">@{person.username}</p>
                      </div>
                      {person.friendshipStatus ? (
                        <span className="text-xs text-foreground-subtle">
                          {person.friendshipStatus === 'ACCEPTED' ? 'Amigo' : 'Solicitação enviada'}
                        </span>
                      ) : (
                        <Button size="xs" variant="secondary" onClick={() => sendRequest(person.id)}>
                          <UserPlus className="size-3.5" /> Adicionar
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {searchQuery.length < 2 && (
                  <div className="py-8 text-center">
                    <Search className="size-8 text-foreground-subtle mx-auto mb-3" strokeWidth={1.5} />
                    <p className="text-sm text-foreground-muted">Busque por nome ou username para encontrar amigos</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
