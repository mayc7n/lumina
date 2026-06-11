import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  return format(new Date(date), pattern, { locale: ptBR })
}

export function formatDateRelative(date: string | Date): string {
  const d = new Date(date)
  if (isToday(d)) return 'Hoje'
  if (isYesterday(d)) return 'Ontem'
  if (isTomorrow(d)) return 'Amanhã'
  return formatDistanceToNow(d, { addSuffix: true, locale: ptBR })
}

export function formatDuration(minutes: number): string {
  if (!minutes) return '0m'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60), m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('')
}

export function truncate(str: string, max: number) {
  return str.length <= max ? str : str.slice(0, max - 3) + '...'
}

export const PRIORITY_CONFIG = {
  URGENT: { label: 'Urgente', color: '#ef4444', bg: 'bg-red-500/10',    text: 'text-red-500'    },
  HIGH:   { label: 'Alta',    color: '#f97316', bg: 'bg-orange-500/10', text: 'text-orange-500' },
  MEDIUM: { label: 'Média',   color: '#eab308', bg: 'bg-yellow-500/10', text: 'text-yellow-500' },
  LOW:    { label: 'Baixa',   color: '#6366f1', bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
  NONE:   { label: '—',       color: '#6b7280', bg: 'bg-gray-500/10',   text: 'text-gray-500'   },
} as const

export function getPriorityConfig(priority: string) {
  return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.NONE
}

export const ACCENT_COLORS = [
  { id: 'indigo',  hex: '#6366f1', label: 'Índigo'    },
  { id: 'violet',  hex: '#8b5cf6', label: 'Violeta'   },
  { id: 'blue',    hex: '#3b82f6', label: 'Azul'      },
  { id: 'cyan',    hex: '#06b6d4', label: 'Ciano'     },
  { id: 'emerald', hex: '#10b981', label: 'Esmeralda' },
  { id: 'amber',   hex: '#f59e0b', label: 'Âmbar'     },
  { id: 'rose',    hex: '#f43f5e', label: 'Rosa'      },
  { id: 'orange',  hex: '#f97316', label: 'Laranja'   },
]

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let t: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay) }
}
