'use client'

import { useQuery } from '@tanstack/react-query'
import { BarChart2, CheckSquare, Flame, Lightbulb, Timer, TrendingUp } from 'lucide-react'
import { analyticsApi } from '@/lib/api/client'
import { cn, formatDuration } from '@/lib/utils'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts'

export default function AnalyticsPage() {
  const from = format(subDays(new Date(), 6), 'yyyy-MM-dd')
  const { data, isLoading } = useQuery({
    queryKey: ['analytics', from],
    queryFn: () => analyticsApi.getWeekly(from),
    staleTime: 60_000,
  })

  if (isLoading) {
    return <div className="grid gap-4 p-6 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-background-elevated" />)}</div>
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/10"><BarChart2 className="size-4 text-blue-500" /></div>
          <div><h1 className="text-lg font-semibold">Analytics</h1><p className="text-xs text-foreground-muted">Entenda seus padrões nos últimos 7 dias.</p></div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Score', value: `${data?.productivityScore ?? 0}/100`, icon: TrendingUp, color: 'text-brand' },
            { label: 'Tarefas concluídas', value: data?.tasksCompleted ?? 0, icon: CheckSquare, color: 'text-success' },
            { label: 'Consistência', value: `${data?.habitRate ?? 0}%`, icon: Flame, color: 'text-orange-500' },
            { label: 'Tempo de foco', value: formatDuration(data?.focusMins ?? 0), icon: Timer, color: 'text-purple-500' },
          ].map(item => (
            <div key={item.label} className="card p-4">
              <item.icon className={cn('mb-3 size-4', item.color)} />
              <p className="text-2xl font-bold tabular-nums">{item.value}</p>
              <p className="text-xs text-foreground-muted">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card p-5 lg:col-span-2">
            <h2 className="mb-5 text-sm font-semibold">Índice de produtividade</h2>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data?.daily ?? []}>
                <defs><linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,16%)" vertical={false} />
                <XAxis dataKey="date" tickFormatter={value => format(new Date(`${value}T12:00:00`), 'EEE', { locale: ptBR })} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(220,14%,10%)', border: '1px solid hsl(220,13%,16%)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="productivityScore" stroke="#6366f1" strokeWidth={2} fill="url(#analytics-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h2 className="mb-5 text-sm font-semibold">Equilíbrio das áreas</h2>
            <div className="space-y-4">
              {(data?.areaBalance ?? []).map(area => (
                <div key={area.area}>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="text-foreground-muted">{area.area}</span><strong>{area.score}%</strong></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${area.score}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="card p-5">
            <h2 className="mb-5 text-sm font-semibold">Tarefas por dia</h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data?.tasksByDayOfWeek ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,16%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <div className="mb-4 flex items-center gap-2"><Lightbulb className="size-4 text-amber-500" /><h2 className="text-sm font-semibold">Insights</h2></div>
            <div className="space-y-3">
              {(data?.insights ?? []).map(insight => (
                <div key={insight.title} className="rounded-xl border border-border bg-background-overlay p-3">
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{insight.description}</p>
                </div>
              ))}
              {!data?.insights?.length && <p className="py-8 text-center text-xs text-foreground-muted">Registre mais atividades para gerar insights.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
