import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { notificationsApi, type Notification } from '@/lib/api/client'

interface NotificationStore {
  notifications: Notification[]; unreadCount: number; isLoading: boolean
  fetchNotifications: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  removeNotification: (id: string) => void
  addNotification: (n: Notification) => void
}

export const useNotificationStore = create<NotificationStore>()(
  immer(set => ({
    notifications: [], unreadCount: 0, isLoading: false,
    fetchNotifications: async () => {
      set(s => { s.isLoading = true })
      try {
        const notifications = await notificationsApi.getAll()
        set(s => { s.notifications = notifications; s.unreadCount = notifications.filter(n => !n.isRead).length; s.isLoading = false })
      } catch { set(s => { s.isLoading = false }) }
    },
    markRead: async id => {
      set(s => { const n = s.notifications.find(x => x.id === id); if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1) } })
      await notificationsApi.markRead(id)
    },
    markAllRead: async () => {
      set(s => { s.notifications.forEach(n => { n.isRead = true }); s.unreadCount = 0 })
      await notificationsApi.markAllRead()
    },
    removeNotification: id => {
      set(s => { const i = s.notifications.findIndex(n => n.id === id); if (i !== -1) { if (!s.notifications[i].isRead) s.unreadCount--; s.notifications.splice(i, 1) } })
      notificationsApi.delete(id)
    },
    addNotification: n => set(s => { s.notifications.unshift(n); if (!n.isRead) s.unreadCount++ }),
  }))
)
