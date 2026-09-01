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
  LogOut, Settings, Menu, X, CheckCheck, Trash2
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const {
    notifications, unreadCount, isLoading: notificationsLoading,
    fetchNotifications, markRead, markAllRead, removeNotification,
  } = useNotificationStore()
  const { theme, setTheme } = useTheme()

  useEffect(() => { void fetchNotifications() }, [fetchNotifications])
  useEffect(() => {
    setMobileOpen(false)
    setNotificationsOpen(false)
  }, [pathname])

  const initials = user?.displayName?.split(' ').filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join('') ?? 'U'
  const currentSection = NAV.find(item =>
    pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))
  )?.label ?? 'Lumina'

  async function handleLogout() {
    try {
      await authApi.logout()
    } finally {
      logout()
      router.replace('/auth/login')
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside animate={{ width: collapsed ? 60 : 240 }} transition={{ duration: 0.25, ease: [0.4,0,0.2,1] }}
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex shrink-0 -translate-x-full flex-col overflow-hidden border-r border-border bg-background-elevated transition-transform duration-200 md:relative md:z-20 md:translate-x-0',
          mobileOpen && 'translate-x-0',
        )}>
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
          <button type="button" onClick={() => setMobileOpen(false)}
            className="btn-ghost ml-auto p-1.5 md:hidden" aria-label="Fechar menu">
            <X size={17} />
          </button>
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

            return <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>{content}</Link>
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
          <button onClick={() => setCollapsed(!collapsed)} className="sidebar-item hidden w-full md:flex">
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
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" onClick={() => setMobileOpen(true)}
              className="btn-ghost p-2 md:hidden" aria-label="Abrir menu">
              <Menu size={18} />
            </button>
            <p className="truncate text-sm font-medium text-foreground">{currentSection}</p>
          </div>

          <div className="flex items-center gap-1">
            {/* Theme */}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="btn-ghost p-2">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button type="button" onClick={() => setNotificationsOpen(open => !open)}
                className="btn-ghost relative p-2" title="Abrir notificações"
                aria-label={`Notificações${unreadCount ? `, ${unreadCount} não lidas` : ''}`}
                aria-expanded={notificationsOpen}>
                <Bell size={16} />
                {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-brand" />}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background-elevated shadow-lg">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">Notificações</p>
                      <p className="text-2xs text-foreground-muted">{unreadCount} não lida{unreadCount === 1 ? '' : 's'}</p>
                    </div>
                    {unreadCount > 0 && (
                      <button type="button" onClick={() => void markAllRead().catch(() => undefined)}
                        className="btn-ghost px-2 py-1 text-xs">
                        <CheckCheck size={14} /> Marcar todas
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notificationsLoading ? (
                      <p className="px-4 py-8 text-center text-xs text-foreground-muted">Carregando...</p>
                    ) : notifications.length === 0 ? (
                      <p className="px-4 py-10 text-center text-xs text-foreground-muted">Nenhuma notificação por enquanto.</p>
                    ) : notifications.map(notification => (
                      <div key={notification.id}
                        className={cn('group flex gap-3 border-b border-border/70 px-4 py-3 last:border-0', !notification.isRead && 'bg-brand/5')}>
                          <button type="button"
                          onClick={() => { if (!notification.isRead) void markRead(notification.id).catch(() => undefined) }}
                          className="min-w-0 flex-1 text-left">
                          <div className="flex items-center gap-2">
                            {!notification.isRead && <span className="size-1.5 shrink-0 rounded-full bg-brand" />}
                            <p className="truncate text-xs font-semibold">{notification.title}</p>
                          </div>
                          {notification.body && <p className="mt-1 line-clamp-2 text-xs leading-5 text-foreground-muted">{notification.body}</p>}
                          <p className="mt-1 text-2xs text-foreground-subtle">
                            {formatNotificationDate(notification.createdAt)}
                          </p>
                        </button>
                        <button type="button" onClick={() => void removeNotification(notification.id).catch(() => undefined)}
                          className="self-start rounded-md p-1 text-foreground-subtle opacity-70 transition hover:bg-danger-muted hover:text-danger md:opacity-0 md:group-hover:opacity-100"
                          aria-label={`Excluir notificação: ${notification.title}`}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <Link href="/dashboard/settings"
                    className="block border-t border-border px-4 py-2.5 text-center text-xs font-medium text-brand hover:bg-background-overlay">
                    Configurar notificações
                  </Link>
                </div>
              )}
            </div>

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

function formatNotificationDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Agora'
    : date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutInner>{children}</DashboardLayoutInner>
}
