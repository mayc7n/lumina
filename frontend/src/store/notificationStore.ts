import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { notificationsApi, type Notification } from '@/lib/api/client'

interface NotificationStore {
  notifications: Notification[]; unreadCount: number; isLoading: boolean
  fetchNotifications: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  removeNotification: (id: string) => Promise<void>
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
      const previous = useNotificationStore.getState().notifications.find(n => n.id === id)
      set(s => { const n = s.notifications.find(x => x.id === id); if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1) } })
      try {
        await notificationsApi.markRead(id)
      } catch (error) {
        if (previous && !previous.isRead) {
          set(s => { const n = s.notifications.find(x => x.id === id); if (n) n.isRead = false; s.unreadCount++ })
        }
        throw error
      }
    },
    markAllRead: async () => {
      const previous = useNotificationStore.getState().notifications.map(notification => ({ ...notification }))
      set(s => { s.notifications.forEach(n => { n.isRead = true }); s.unreadCount = 0 })
      try {
        await notificationsApi.markAllRead()
      } catch (error) {
        set(s => { s.notifications = previous; s.unreadCount = previous.filter(n => !n.isRead).length })
        throw error
      }
    },
    removeNotification: async id => {
      const previous = useNotificationStore.getState().notifications.map(notification => ({ ...notification }))
      set(s => { const i = s.notifications.findIndex(n => n.id === id); if (i !== -1) { if (!s.notifications[i].isRead) s.unreadCount--; s.notifications.splice(i, 1) } })
      try {
        await notificationsApi.delete(id)
      } catch (error) {
        set(s => { s.notifications = previous; s.unreadCount = previous.filter(n => !n.isRead).length })
        throw error
      }
    },
    addNotification: n => set(s => { s.notifications.unshift(n); if (!n.isRead) s.unreadCount++ }),
  }))
)
