'use client'
import { motion } from 'framer-motion'
import { useDashboard } from '@/hooks/useDashboard'
import { CheckSquare, Flame, Target, Timer, TrendingUp, BookOpen, Trophy, Clock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { cn, formatDuration } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'; import { ptBR } from 'date-fns/locale'

const fade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } }
const stagger = { animate: { transition: { staggerChildren: 0.06 } } }

function greeting() { const h = new Date().getHours(); return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite' }

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { data, isLoading } = useDashboard()
  const name = user?.displayName?.split(' ')[0] ?? 'você'

  if (isLoading) return <div className="p-6 grid grid-cols-2 xl:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><SkeletonCard key={i}/>)}</div>

  const completed = data?.todayTasks?.filter(t => t.status === 'DONE').length ?? 0
  const total     = data?.todayTasks?.length ?? 0

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Greeting */}
      <motion.div {...fade}>
        <p className="text-xs text-foreground-muted capitalize">{format(new Date(),"EEEE, d 'de' MMMM",{locale:ptBR})}</p>
        <h1 className="text-2xl font-semibold tracking-tight mt-0.5">{greeting()}, <span className="gradient-text">{name}</span></h1>
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
            <AreaChart data={data?.weeklyData ?? []}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="hsl(239,84%,67%)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="hsl(239,84%,67%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,16%)" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:11,fill:'hsl(220,7%,45%)'}} tickLine={false} axisLine={false} tickFormatter={v=>format(new Date(v),'EEE',{locale:ptBR})}/>
              <YAxis hide domain={[0,100]}/>
              <Tooltip contentStyle={{backgroundColor:'hsl(220,14%,10%)',border:'1px solid hsl(220,13%,16%)',borderRadius:'8px',fontSize:'12px'}} formatter={(v:number)=>[`${Math.round(v)}/100`,'Score']}/>
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
            <motion.div className="progress-fill" initial={{width:0}} animate={{width:`${total>0?Math.round(completed/total*100):0}%`}} transition={{duration:0.8}}/>
          </div>
          <div className="space-y-1">
            {(data?.todayTasks ?? []).slice(0,6).map(task => (
              <div key={task.id} className="flex items-center gap-2.5 py-1.5">
                <div className={cn('size-3.5 rounded-full border-2 shrink-0', task.status==='DONE'?'bg-success border-success':'border-border')}/>
                <span className={cn('text-xs truncate', task.status==='DONE'?'line-through text-foreground-muted':'text-foreground')}>{task.title}</span>
              </div>
            ))}
            {total === 0 && <p className="text-xs text-foreground-muted text-center py-4">Nenhuma tarefa para hoje</p>}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
