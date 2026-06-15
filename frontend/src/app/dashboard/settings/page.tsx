'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Bell, Database, Settings, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DataSection, NotificationsSection } from '@/components/features/settings/OtherSections'
import { usersApi } from '@/lib/api/client'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Section = 'profile' | 'notifications' | 'data'

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore()
  const [section, setSection] = useState<Section>('profile')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setDisplayName(user?.displayName ?? '')
    setUsername(user?.username ?? '')
    setBio(user?.bio ?? '')
  }, [user])

  async function saveProfile(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const updated = await usersApi.updateProfile({ displayName, username, bio })
      updateUser(updated)
      toast.success('Perfil atualizado')
    } catch {
      toast.error('Não foi possível atualizar o perfil')
    } finally {
      setSaving(false)
    }
  }

  const sections = [
    { id: 'profile' as const, label: 'Perfil', icon: User },
    { id: 'notifications' as const, label: 'Notificações', icon: Bell },
    { id: 'data' as const, label: 'Dados e privacidade', icon: Database },
  ]

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <aside className="shrink-0 border-b border-border bg-background-elevated p-3 lg:w-64 lg:border-b-0 lg:border-r lg:p-4">
        <div className="mb-5 flex items-center gap-2 px-2"><Settings className="size-4 text-brand" /><h1 className="text-sm font-semibold">Configurações</h1></div>
        <nav className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
          {sections.map(item => (
            <button key={item.id} onClick={() => setSection(item.id)}
              className={cn('sidebar-item shrink-0 lg:w-full', section === item.id && 'active')}>
              <item.icon className="size-4" /><span className="whitespace-nowrap text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          {section === 'profile' && (
            <form onSubmit={saveProfile} className="space-y-6">
              <div><h2 className="text-lg font-semibold">Perfil</h2><p className="mt-1 text-sm text-foreground-muted">Atualize como você aparece no Lumina.</p></div>
              <div className="card grid gap-5 p-5 sm:grid-cols-2">
                <label className="block text-xs font-medium text-foreground-muted">Nome de exibição<input value={displayName} onChange={event => setDisplayName(event.target.value)} className="input-base mt-1.5 w-full" /></label>
                <label className="block text-xs font-medium text-foreground-muted">Username<input value={username} onChange={event => setUsername(event.target.value)} className="input-base mt-1.5 w-full" /></label>
                <label className="block text-xs font-medium text-foreground-muted sm:col-span-2">Bio<textarea value={bio} onChange={event => setBio(event.target.value)} maxLength={500} className="input-base mt-1.5 min-h-24 w-full resize-none" /></label>
                <div className="sm:col-span-2"><Button type="submit" loading={saving} disabled={!displayName.trim() || !username.trim()}>Salvar alterações</Button></div>
              </div>
            </form>
          )}
          {section === 'notifications' && <NotificationsSection />}
          {section === 'data' && <DataSection />}
        </div>
      </main>
    </div>
  )
}
