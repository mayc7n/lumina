'use client'
import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { authApi } from '@/lib/api/client'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard, CheckSquare, Flame, Target, Timer,
  PenLine, BookOpen, GraduationCap, CalendarDays, BarChart2,
  Users, Bell, ChevronLeft, Sparkles, Moon, Sun,
  LogOut, Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',           label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/dashboard/tasks',     label: 'Tarefas',       icon: CheckSquare },
  { href: '/dashboard/habits',    label: 'Hábitos',       icon: Flame },
  { href: '/dashboard/goals',     label: 'Metas',         icon: Target },
  { href: '/dashboard/focus',     label: 'Foco',          icon: Timer },
  { href: '/dashboard/journal',   label: 'Diário',        icon: PenLine },
  { href: '/dashboard/books',     label: 'Livros',        icon: BookOpen },
  { href: '/dashboard/studies',   label: 'Estudos',       icon: GraduationCap },
  { href: '/dashboard/calendar',  label: 'Calendário',    icon: CalendarDays },
  { href: '/dashboard/analytics', label: 'Analytics',     icon: BarChart2 },
  { href: '/dashboard/social',    label: 'Social',        icon: Users },
  { href: '/dashboard/settings',  label: 'Configurações', icon: Settings },
]

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, refreshToken, logout } = useAuthStore()
  const { unreadCount, fetchNotifications } = useNotificationStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => { fetchNotifications() }, [])

  const initials = user?.displayName?.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('') ?? 'U'
  const currentSection = NAV.find(item =>
    pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
  )?.label ?? 'Lumina'

  async function handleLogout() {
    try {
      if (refreshToken) await authApi.logout(refreshToken)
    } finally {
      logout()
      router.replace('/auth/login')
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <motion.aside animate={{ width: collapsed ? 60 : 240 }} transition={{ duration: 0.25, ease: [0.4,0,0.2,1] }}
        className="relative flex flex-col border-r border-border bg-background-elevated z-20 shrink-0 overflow-hidden">
        {/* Logo */}
        <div className={cn('flex items-center h-14 px-4 border-b border-border shrink-0', collapsed ? 'justify-center' : 'gap-3')}>
          <div className="size-7 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <Sparkles size={14} strokeWidth={2.5} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
                className="font-semibold text-base tracking-tight">Lumina</motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV.map(item => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            const content = (
              <motion.div
                className={cn(
                  'sidebar-item relative',
                  active && 'active',
                  collapsed && 'justify-center px-0',
                )}
                whileTap={{ scale: 0.97 }}
              >
                {active && <motion.div layoutId="nav-active" className="absolute inset-0 bg-brand/8 rounded-lg" transition={{ duration: 0.2 }} />}
                <Icon size={16} strokeWidth={active ? 2 : 1.75} className={cn('shrink-0 relative', active ? 'text-brand' : 'text-foreground-muted')} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className={cn('relative flex min-w-0 flex-1 items-center justify-between gap-2 text-sm', active ? 'text-foreground font-medium' : 'text-foreground-muted')}>
                      <span>{item.label}</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )

            return <Link key={item.href} href={item.href}>{content}</Link>
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-2 shrink-0">
          {!collapsed && (
            <div className="mb-1 flex items-center gap-2 rounded-lg px-2 py-2">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" className="size-8 rounded-full object-cover border border-border" />
                : <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand">{initials}</div>
              }
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{user?.displayName ?? 'Usuário'}</p>
                <p className="truncate text-2xs text-foreground-subtle">@{user?.username ?? 'lumina'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md p-1.5 text-foreground-subtle transition-colors hover:bg-danger-muted hover:text-danger"
                aria-label="Sair da conta"
                title="Sair"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item w-full">
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronLeft size={16} className="text-foreground-muted" />
            </motion.div>
            <AnimatePresence>
              {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-foreground-muted">Recolher</motion.span>}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur-sm z-10">
          <p className="text-sm font-medium text-foreground">{currentSection}</p>

          <div className="flex items-center gap-1">
            {/* Theme */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn-ghost p-2">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <Link href="/dashboard/settings" className="btn-ghost p-2 relative" title="Configurar notificações">
              <Bell size={16} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 size-2 bg-brand rounded-full" />}
            </Link>

            {/* User menu */}
            <Link href="/dashboard/settings" className="flex items-center gap-2 pl-1" title="Abrir configurações do perfil">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user.displayName} className="size-7 rounded-full object-cover border border-border" />
                : <div className="size-7 rounded-full bg-brand/20 flex items-center justify-center text-xs font-semibold text-brand">{initials}</div>
              }
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div key={pathname} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="h-full">
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutInner>{children}</DashboardLayoutInner>
}
