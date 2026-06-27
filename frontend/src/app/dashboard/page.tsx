'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useDashboard } from '@/hooks/useDashboard'
import {
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  CheckSquare,
  CircleDotDashed,
  Flame,
  RefreshCw,
  Sparkles,
  Target,
  Timer,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { clamp, cn, formatDateRelative, formatDuration } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, isValid } from 'date-fns'; import { ptBR } from 'date-fns/locale'

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

function greeting() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isError, isFetching, isLoading, refetch } = useDashboard()
  const name = user?.displayName?.split(' ')[0] ?? 'você'

  if (isLoading) return <div className="p-6 grid grid-cols-2 xl:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)}</div>

  if (isError) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-background-elevated p-6 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-danger-muted text-danger">
            <AlertCircle size={20} />
          </div>
          <h1 className="mt-4 text-lg font-semibold">Não foi possível carregar o dashboard</h1>
          <p className="mt-2 text-sm leading-6 text-foreground-muted">
            Verifique sua conexão ou tente novamente em alguns instantes.
          </p>
          <button type="button" onClick={() => void refetch()} disabled={isFetching} className="btn-primary mt-5">
            <RefreshCw size={15} className={cn(isFetching && 'animate-spin')} />
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const todayTasks = data?.todayTasks ?? []
  const habits = data?.habits ?? []
  const activeGoals = data?.activeGoals ?? []
  const weeklyData = data?.weeklyData ?? []
  const recentActivity = data?.recentActivity ?? []
  const completed = todayTasks.filter(t => t.status === 'DONE').length
  const total = todayTasks.length
  const pendingTasks = todayTasks.filter(t => t.status !== 'DONE')
  const completedHabits = habits.filter(habit => data?.todayCompletions?.includes(habit.id)).length
  const habitRate = habits.length ? Math.round(clamp((completedHabits / habits.length) * 100)) : 0
  const averageGoalProgress = activeGoals.length
    ? Math.round(clamp(activeGoals.reduce((sum, goal) => sum + (goal.progressPct ?? 0), 0) / activeGoals.length))
    : 0
  const bestAction = getBestAction({
    pendingTasks,
    habits,
    completedHabits,
    activeGoals,
    weeklyFocusMins: data?.focusStats?.weeklyMins ?? 0,
  })

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Greeting */}
      <motion.div {...fade}>
        <p className="text-xs text-foreground-muted capitalize">{format(new Date(),"EEEE, d 'de' MMMM",{locale:ptBR})}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-0.5">{greeting()}, <span className="gradient-text">{name}</span></h1>
      </motion.div>

      <motion.div {...fade} className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <div className="card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-foreground-subtle">Próxima melhor ação</p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">{bestAction.title}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground-muted">{bestAction.description}</p>
            </div>
            <Link href={bestAction.href} className="btn-secondary w-full shrink-0 px-3 py-2 sm:w-auto">
              Abrir
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="card p-4">
            <p className="text-xs text-foreground-muted">Hábitos hoje</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{completedHabits}/{habits.length}</p>
            <div className="progress-bar mt-3">
              <div className="progress-fill" style={{ width: `${habitRate}%` }} />
            </div>
          </div>
          <div className="card p-4">
            <p className="text-xs text-foreground-muted">Metas</p>
            <p className="mt-1 text-2xl font-bold tabular-nums">{averageGoalProgress}%</p>
            <div className="progress-bar mt-3">
              <div className="progress-fill" style={{ width: `${averageGoalProgress}%` }} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Row */}
      <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label:'Tarefas hoje',   value:`${completed}/${total}`,                     icon: CheckSquare, color:'text-brand',       bg:'bg-brand/10'       },
          { label:'Streak',         value:`${data?.streak ?? 0}d`,                     icon: Flame,       color:'text-orange-500',  bg:'bg-orange-500/10'  },
          { label:'Foco esta semana',value:formatDuration(data?.focusStats?.weeklyMins??0), icon: Timer,  color:'text-purple-500',  bg:'bg-purple-500/10'  },
          { label:'Metas ativas',   value:`${data?.activeGoals?.length ?? 0}`,          icon: Target,      color:'text-violet-500',  bg:'bg-violet-500/10'  },
        ].map(card => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} variants={fade} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className={cn('size-8 rounded-lg flex items-center justify-center', card.bg)}>
                  <Icon size={16} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold tabular-nums">{card.value}</p>
              <p className="text-xs text-foreground-muted mt-0.5">{card.label}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Chart + Today Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <motion.div {...fade} className="xl:col-span-2 card p-5">
          <h3 className="text-sm font-semibold mb-4">Produtividade — 7 dias</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(239,84%,67%)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,16%)" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:11,fill:'hsl(220,7%,45%)'}} tickLine={false} axisLine={false} tickFormatter={formatChartDate}/>
              <YAxis hide domain={[0,100]}/>
              <Tooltip contentStyle={{backgroundColor:'hsl(220,14%,10%)',border:'1px solid hsl(220,13%,16%)',borderRadius:'8px',fontSize:'12px'}} formatter={(v:number)=>[`${Math.round(clamp(v))}/100`,'Score']}/>
              <Area type="monotone" dataKey="productivityScore" stroke="hsl(239,84%,67%)" strokeWidth={2} fill="url(#g)" dot={false} activeDot={{r:4}}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fade} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Tarefas de Hoje</h3>
            <span className="text-xs text-foreground-muted">{completed}/{total}</span>
          </div>
          <div className="progress-bar mb-4">
            <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${total>0?Math.round(clamp(completed/total*100)):0}%`}} transition={{duration:0.8}}/>
          </div>
          <div className="space-y-1">
            {todayTasks.slice(0,6).map(task => (
              <div key={task.id} className="flex items-center gap-2.5 py-1.5">
                {task.status === 'DONE'
                  ? <CheckCircle2 size={15} className="shrink-0 text-success" />
                  : <CircleDotDashed size={15} className="shrink-0 text-foreground-subtle" />
                }
                <span className={cn('text-xs truncate', task.status==='DONE'?'line-through text-foreground-muted':'text-foreground')}>{task.title}</span>
              </div>
            ))}
            {total === 0 && <p className="text-xs text-foreground-muted text-center py-4">Nenhuma tarefa para hoje</p>}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div {...fade} className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Metas em andamento</h3>
            <Link href="/dashboard/goals" className="text-xs font-medium text-brand hover:underline">Ver metas</Link>
          </div>
          <div className="space-y-3">
            {activeGoals.slice(0, 4).map(goal => (
              <div key={goal.id} className="rounded-lg border border-border bg-background px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-medium">{goal.title}</p>
                  <span className="text-xs tabular-nums text-foreground-muted">{Math.round(clamp(goal.progressPct ?? 0))}%</span>
                </div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${Math.round(clamp(goal.progressPct ?? 0))}%` }} />
                </div>
              </div>
            ))}
            {activeGoals.length === 0 && (
              <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-foreground-muted">
                Nenhuma meta ativa no momento.
              </p>
            )}
          </div>
        </motion.div>

        <motion.div {...fade} className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Atividade recente</h3>
            <span className="text-xs text-foreground-muted">{recentActivity.length} registro{recentActivity.length === 1 ? '' : 's'}</span>
          </div>
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map(item => (
              <div key={item.id} className="flex gap-3">
                <span className="mt-1 size-2 rounded-full bg-brand" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{item.description}</p>
                  <p className="mt-0.5 text-xs text-foreground-subtle">{formatDateRelative(item.createdAt)}</p>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-foreground-muted">
                Suas próximas conclusões vão aparecer aqui.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function formatChartDate(value: unknown) {
  const date = new Date(String(value))
  return isValid(date) ? format(date, 'EEE', { locale: ptBR }) : ''
}

type BestActionInput = {
  pendingTasks: Array<{ title: string }>
  habits: Array<{ id: string }>
  completedHabits: number
  activeGoals: Array<{ progressPct?: number }>
  weeklyFocusMins: number
}

function getBestAction({ pendingTasks, habits, completedHabits, activeGoals, weeklyFocusMins }: BestActionInput) {
  if (pendingTasks.length > 0) {
    return {
      title: pendingTasks[0].title,
      description: `${pendingTasks.length} tarefa${pendingTasks.length === 1 ? '' : 's'} ainda pendente${pendingTasks.length === 1 ? '' : 's'} para fechar o dia.`,
      href: '/dashboard/tasks',
    }
  }

  if (habits.length > completedHabits) {
    return {
      title: 'Completar hábitos do dia',
      description: `Faltam ${habits.length - completedHabits} hábito${habits.length - completedHabits === 1 ? '' : 's'} para manter a consistência.`,
      href: '/dashboard/habits',
    }
  }

  const goalBehind = activeGoals.find(goal => (goal.progressPct ?? 0) < 70)
  if (goalBehind) {
    return {
      title: 'Atualizar uma meta ativa',
      description: 'Há uma meta com espaço para ganhar tração hoje.',
      href: '/dashboard/goals',
    }
  }

  if (weeklyFocusMins < 120) {
    return {
      title: 'Iniciar uma sessão de foco',
      description: 'Uma sessão curta agora ajuda a manter ritmo semanal.',
      href: '/dashboard/focus',
    }
  }

  return {
    title: 'Registrar um check-in',
    description: 'Você está em dia. Use o diário para consolidar aprendizados e próximos passos.',
    href: '/dashboard/journal',
  }
}
