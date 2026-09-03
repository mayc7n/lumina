import { type CSSProperties } from 'react'
import { type LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const SKELETON_WIDTHS = [72, 88, 64, 80, 68, 92]

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div className={cn('shimmer rounded-md bg-background-overlay', className)} style={style} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('card p-4 space-y-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-8 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3.5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-3.5 flex-1" style={{ width: `${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}%` }} />
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action, className }: {
  icon: LucideIcon; title: string; description?: string
  action?: { label: string; onClick: () => void }; className?: string
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn('flex flex-col items-center justify-center py-20 px-6 text-center', className)}>
      <div className="size-12 rounded-2xl bg-background-overlay border border-border flex items-center justify-center mb-4">
        <Icon className="size-5 text-foreground-muted" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-xs text-foreground-muted max-w-xs leading-relaxed mb-5">{description}</p>}
      {action && <button onClick={action.onClick} className="btn-primary text-xs px-4 py-2">{action.label}</button>}
    </motion.div>
  )
}
