import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: { DEFAULT: 'hsl(var(--background))', elevated: 'hsl(var(--background-elevated))', overlay: 'hsl(var(--background-overlay))' },
        foreground: { DEFAULT: 'hsl(var(--foreground))', muted: 'hsl(var(--foreground-muted))', subtle: 'hsl(var(--foreground-subtle))' },
        border: { DEFAULT: 'hsl(var(--border))', strong: 'hsl(var(--border-strong))' },
        brand: { DEFAULT: 'hsl(var(--brand))', foreground: 'hsl(var(--brand-foreground))', muted: 'hsl(var(--brand-muted))' },
        success: { DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))', muted: 'hsl(var(--success-muted))' },
        warning: { DEFAULT: 'hsl(var(--warning))', foreground: 'hsl(var(--warning-foreground))', muted: 'hsl(var(--warning-muted))' },
        danger: { DEFAULT: 'hsl(var(--danger))', foreground: 'hsl(var(--danger-foreground))', muted: 'hsl(var(--danger-muted))' },
      },
      fontFamily: { sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'], mono: ['var(--font-geist-mono)', 'monospace'] },
      borderRadius: { xs: '4px', sm: '6px', DEFAULT: '8px', md: '10px', lg: '12px', xl: '16px', '2xl': '20px', '3xl': '24px' },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0/0.05)',
        sm: '0 1px 3px 0 rgb(0 0 0/0.08),0 1px 2px -1px rgb(0 0 0/0.08)',
        'brand-sm': '0 0 0 3px hsl(var(--brand)/0.15)',
        'brand': '0 0 0 3px hsl(var(--brand)/0.25)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
