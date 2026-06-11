/**
 * Lumina Icon System
 * Single source of truth for all icons in the product.
 * No emojis. No symbol fonts. Only Lucide React.
 */

import {
  // Productivity
  CheckSquare, CheckCircle2, Circle, ListTodo, ClipboardList,
  // Habits
  Flame, Zap, Droplets, Moon, Sun, Wind, Leaf, Heart, Bike, Dumbbell,
  // Goals
  Target, Trophy, Flag, Medal, Star, TrendingUp, TrendingDown, Milestone,
  // Focus
  Timer, Clock, Hourglass, Brain, Cpu, Lightbulb, Focus,
  // Learning
  BookOpen, GraduationCap, PenLine, FileText, Pencil, BookMarked,
  // Health
  Apple, Activity, Stethoscope, Pill, Salad, Coffee,
  // Finance
  DollarSign, Banknote, PiggyBank, Wallet, CreditCard,
  // Social
  Users, User, UserPlus, MessageCircle, Heart as HeartIcon, Share2,
  // Creative
  Palette, Music, Camera, Mic, Video, Code, Layers,
  // Nature
  TreePine, Flower2, Sprout, Waves, CloudSun, Mountain,
  // Life
  Home, Car, Plane, Globe, Map, Compass, Anchor,
  // Spiritual
  Infinity, Sparkles, Wand2, Diamond, Shield,
  // Communication
  Mail, Phone, Bell, Send, Inbox, MessageSquare,
  // UI Icons (system)
  LayoutDashboard, CalendarDays, BarChart2, Settings, Search, Plus,
  ChevronLeft, ChevronRight, ChevronDown, X, ArrowRight, ArrowLeft,
  MoreHorizontal, MoreVertical, Filter, SortAsc, SortDesc, Grid, List,
  Eye, EyeOff, Loader2, RefreshCw, Trash2, Edit2, Copy, Download, Upload,
  Save, Check, AlertCircle, AlertTriangle, Info, HelpCircle,
  LogOut, Lock, Unlock, Key, ShieldCheck, Fingerprint,
  type LucideIcon,
} from 'lucide-react'

// ===================================================================
// Icon Registry — maps string keys to Lucide components
// ===================================================================

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  // Habits & Routines
  'flame':        Flame,
  'zap':          Zap,
  'droplets':     Droplets,
  'moon':         Moon,
  'sun':          Sun,
  'wind':         Wind,
  'leaf':         Leaf,
  'heart':        Heart,
  'bike':         Bike,
  'dumbbell':     Dumbbell,
  'activity':     Activity,
  'apple':        Apple,
  'coffee':       Coffee,
  'salad':        Salad,
  // Goals
  'target':       Target,
  'trophy':       Trophy,
  'flag':         Flag,
  'medal':        Medal,
  'star':         Star,
  'trending-up':  TrendingUp,
  'milestone':    Milestone,
  'diamond':      Diamond,
  // Focus & Learning
  'timer':        Timer,
  'clock':        Clock,
  'hourglass':    Hourglass,
  'brain':        Brain,
  'cpu':          Cpu,
  'lightbulb':    Lightbulb,
  'book-open':    BookOpen,
  'graduation':   GraduationCap,
  'pen-line':     PenLine,
  'file-text':    FileText,
  'pencil':       Pencil,
  'book-marked':  BookMarked,
  // Finance
  'dollar':       DollarSign,
  'banknote':     Banknote,
  'piggy-bank':   PiggyBank,
  'wallet':       Wallet,
  // Social
  'users':        Users,
  'user':         User,
  'message':      MessageCircle,
  'share':        Share2,
  // Creative
  'palette':      Palette,
  'music':        Music,
  'camera':       Camera,
  'mic':          Mic,
  'code':         Code,
  'layers':       Layers,
  // Nature
  'tree':         TreePine,
  'flower':       Flower2,
  'sprout':       Sprout,
  'waves':        Waves,
  'mountain':     Mountain,
  // Life
  'home':         Home,
  'car':          Car,
  'plane':        Plane,
  'globe':        Globe,
  'compass':      Compass,
  // Spiritual / Abstract
  'infinity':     Infinity,
  'sparkles':     Sparkles,
  'wand':         Wand2,
  'shield':       Shield,
  // Default fallback
  'check':        CheckCircle2,
  'list':         ListTodo,
}

// ===================================================================
// IconRenderer — renders any registered icon by string key
// ===================================================================

interface IconRendererProps {
  name: string
  className?: string
  size?: number
  strokeWidth?: number
  style?: React.CSSProperties
}

export function IconRenderer({ name, className, size = 16, strokeWidth = 1.75, style }: IconRendererProps) {
  const Icon = ICON_REGISTRY[name] ?? Target
  return <Icon className={className} size={size} strokeWidth={strokeWidth} style={style} />
}

// ===================================================================
// Icon Picker — grid selector for habit/goal creation
// ===================================================================

import { useState } from 'react'
import { cn } from '@/lib/utils'

const ICON_GROUPS = [
  {
    label: 'Saúde & Bem-estar',
    icons: ['flame','zap','droplets','moon','sun','heart','activity','dumbbell','bike','apple','salad','coffee'],
  },
  {
    label: 'Aprendizado',
    icons: ['brain','book-open','graduation','pen-line','pencil','lightbulb','cpu','file-text','book-marked'],
  },
  {
    label: 'Metas & Conquistas',
    icons: ['target','trophy','flag','medal','star','trending-up','milestone','diamond','sparkles'],
  },
  {
    label: 'Foco & Tempo',
    icons: ['timer','clock','hourglass','infinity','wand','layers'],
  },
  {
    label: 'Vida & Rotina',
    icons: ['home','car','plane','globe','compass','users','message','share'],
  },
  {
    label: 'Criatividade',
    icons: ['palette','music','camera','mic','code','flower','tree','sprout','waves','mountain'],
  },
]

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  color?: string
}

export function IconPicker({ value, onChange, color = '#6366f1' }: IconPickerProps) {
  const [search, setSearch] = useState('')

  const filteredGroups = search.trim()
    ? [{ label: 'Resultados', icons: Object.keys(ICON_REGISTRY).filter(k => k.includes(search.toLowerCase())) }]
    : ICON_GROUPS

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Buscar ícone..."
        className="input-base text-xs h-8"
      />
      <div className="max-h-52 overflow-y-auto space-y-3 pr-1">
        {filteredGroups.map(group => (
          group.icons.length > 0 && (
            <div key={group.label}>
              <p className="text-2xs font-medium text-foreground-subtle uppercase tracking-wider mb-1.5">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-1">
                {group.icons.map(iconKey => {
                  const Icon = ICON_REGISTRY[iconKey] ?? Target
                  const isSelected = value === iconKey
                  return (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => onChange(iconKey)}
                      title={iconKey}
                      className={cn(
                        'size-8 rounded-lg flex items-center justify-center transition-all duration-150',
                        isSelected
                          ? 'ring-2 ring-offset-1 ring-offset-background'
                          : 'hover:bg-background-overlay'
                      )}
                      style={isSelected
                        ? { background: color + '20', color, '--tw-ring-color': color } as React.CSSProperties
                        : {}}
                    >
                      <Icon
                        size={15}
                        strokeWidth={isSelected ? 2 : 1.75}
                        style={{ color: isSelected ? color : undefined }}
                        className={!isSelected ? 'text-foreground-muted' : ''}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  )
}

// ===================================================================
// Mood Scale — professional indicator instead of emoji faces
// ===================================================================

export const MOOD_LEVELS = [
  { id: 'TERRIBLE', label: 'Péssimo',   value: 1, color: '#ef4444' },
  { id: 'BAD',      label: 'Ruim',      value: 2, color: '#f97316' },
  { id: 'NEUTRAL',  label: 'Neutro',    value: 3, color: '#eab308' },
  { id: 'GOOD',     label: 'Bem',       value: 4, color: '#22c55e' },
  { id: 'EXCELLENT',label: 'Ótimo',     value: 5, color: '#6366f1' },
] as const

export type MoodId = typeof MOOD_LEVELS[number]['id']

interface MoodScaleProps {
  value: MoodId | null
  onChange: (mood: MoodId | null) => void
  size?: 'sm' | 'md'
}

export function MoodScale({ value, onChange, size = 'md' }: MoodScaleProps) {
  return (
    <div className="flex items-center gap-1.5">
      {MOOD_LEVELS.map(mood => {
        const isSelected = value === mood.id
        const btnSize = size === 'sm' ? 'size-7' : 'size-9'
        return (
          <button
            key={mood.id}
            type="button"
            title={mood.label}
            onClick={() => onChange(isSelected ? null : mood.id)}
            className={cn(
              btnSize,
              'rounded-lg border-2 flex items-center justify-center transition-all duration-150',
              'font-mono text-xs font-bold',
              isSelected ? 'scale-110' : 'opacity-50 hover:opacity-80 border-border'
            )}
            style={isSelected ? {
              borderColor: mood.color,
              background: mood.color + '15',
              color: mood.color,
            } : {}}
          >
            {mood.value}
          </button>
        )
      })}
    </div>
  )
}

// ===================================================================
// Energy Scale — bar indicator instead of emoji
// ===================================================================

export const ENERGY_LEVELS = [
  { id: 'VERY_LOW',  label: 'Muito baixa', bars: 1 },
  { id: 'LOW',       label: 'Baixa',       bars: 2 },
  { id: 'MEDIUM',    label: 'Média',       bars: 3 },
  { id: 'HIGH',      label: 'Alta',        bars: 4 },
  { id: 'VERY_HIGH', label: 'Muito alta',  bars: 5 },
] as const

export type EnergyId = typeof ENERGY_LEVELS[number]['id']

interface EnergyScaleProps {
  value: EnergyId | null
  onChange: (energy: EnergyId | null) => void
}

export function EnergyScale({ value, onChange }: EnergyScaleProps) {
  return (
    <div className="flex items-center gap-1.5">
      {ENERGY_LEVELS.map(level => {
        const isSelected = value === level.id
        return (
          <button
            key={level.id}
            type="button"
            title={level.label}
            onClick={() => onChange(isSelected ? null : level.id)}
            className={cn(
              'flex items-end gap-px px-2 py-1.5 rounded-lg border-2 transition-all duration-150',
              isSelected ? 'border-brand bg-brand/10' : 'border-border opacity-50 hover:opacity-80'
            )}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1 rounded-sm transition-colors',
                  i < level.bars
                    ? isSelected ? 'bg-brand' : 'bg-foreground-muted'
                    : 'bg-border'
                )}
                style={{ height: `${6 + i * 3}px` }}
              />
            ))}
          </button>
        )
      })}
    </div>
  )
}

// ===================================================================
// Achievement Icon Map — all achievement codes → Lucide icons
// ===================================================================

export const ACHIEVEMENT_ICONS: Record<string, LucideIcon> = {
  'FIRST_TASK':       CheckCircle2,
  'TASK_STREAK_7':    Flame,
  'HABIT_STREAK_7':   Zap,
  'HABIT_STREAK_30':  Diamond,
  'HABIT_STREAK_100': Trophy,
  'FIRST_JOURNAL':    PenLine,
  'JOURNAL_STREAK_7': BookOpen,
  'FIRST_BOOK':       BookMarked,
  'BOOKS_10':         GraduationCap,
  'FOCUS_1H':         Timer,
  'FOCUS_10H':        Zap,
  'FOCUS_100H':       Brain,
  'GOAL_COMPLETED':   Target,
  'STREAK_365':       Star,
}

// ===================================================================
// Category Color Map — consistent color system
// ===================================================================

export const CATEGORY_COLORS = {
  tasks:    { bg: 'bg-indigo-500/10',  text: 'text-indigo-500',  hex: '#6366f1' },
  habits:   { bg: 'bg-orange-500/10',  text: 'text-orange-500',  hex: '#f97316' },
  goals:    { bg: 'bg-violet-500/10',  text: 'text-violet-500',  hex: '#8b5cf6' },
  focus:    { bg: 'bg-purple-500/10',  text: 'text-purple-500',  hex: '#a855f7' },
  journal:  { bg: 'bg-cyan-500/10',    text: 'text-cyan-500',    hex: '#06b6d4' },
  books:    { bg: 'bg-emerald-500/10', text: 'text-emerald-500', hex: '#10b981' },
  studies:  { bg: 'bg-sky-500/10',     text: 'text-sky-500',     hex: '#0ea5e9' },
  social:   { bg: 'bg-rose-500/10',    text: 'text-rose-500',    hex: '#f43f5e' },
  analytics:{ bg: 'bg-amber-500/10',   text: 'text-amber-500',   hex: '#f59e0b' },
  streak:   { bg: 'bg-red-500/10',     text: 'text-red-500',     hex: '#ef4444' },
} as const
