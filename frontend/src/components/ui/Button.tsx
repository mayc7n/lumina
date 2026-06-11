import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; loading?: boolean
}

const V: Record<Variant, string> = {
  primary:   'bg-brand text-brand-foreground hover:opacity-90 shadow-sm',
  secondary: 'bg-background-overlay text-foreground border border-border hover:border-border-strong',
  ghost:     'text-foreground-muted hover:bg-background-overlay hover:text-foreground',
  danger:    'bg-danger text-danger-foreground hover:opacity-90',
}
const S: Record<Size, string> = {
  xs: 'h-6 px-2 text-xs gap-1 rounded-md',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-base gap-2.5 rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, ...props }, ref) => (
    <button ref={ref} disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none', V[variant], S[size], className)}
      {...props}>
      {loading && <Loader2 className="size-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  )
)
Button.displayName = 'Button'
