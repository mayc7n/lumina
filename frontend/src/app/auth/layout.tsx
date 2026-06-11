import Link from 'next/link'
import { BarChart3, CheckCircle2, Sparkles, Target } from 'lucide-react'

const benefits = [
  {
    icon: CheckCircle2,
    title: 'Clareza para executar',
    description: 'Organize tarefas e prioridades sem perder o que importa.',
  },
  {
    icon: Target,
    title: 'Progresso consistente',
    description: 'Conecte hábitos, metas e sessões de foco em um só lugar.',
  },
  {
    icon: BarChart3,
    title: 'Decisões com contexto',
    description: 'Acompanhe sua evolução com métricas úteis e objetivas.',
  },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
      <section className="relative hidden overflow-hidden border-r border-border bg-background-elevated lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="pointer-events-none absolute inset-0 auth-grid opacity-60" />
        <div className="pointer-events-none absolute -left-24 top-24 size-80 rounded-full bg-brand/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 size-96 rounded-full bg-violet-500/10 blur-3xl" />

        <Link href="/" className="relative flex w-fit items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-brand text-white shadow-brand-sm">
            <Sparkles size={18} strokeWidth={2.5} />
          </span>
          <span className="text-lg font-semibold tracking-tight">Lumina</span>
        </Link>

        <div className="relative max-w-xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-brand">
            Excelência pessoal, todos os dias
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-0.035em] xl:text-5xl">
            Transforme intenção em progresso real.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-foreground-muted">
            Um sistema integrado para planejar, executar e entender sua evolução sem adicionar
            complexidade à rotina.
          </p>

          <div className="mt-10 grid gap-5">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-brand/10 text-brand">
                  <Icon size={17} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-foreground-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-foreground-subtle">
          © {new Date().getFullYear()} Lumina. Produtividade com propósito.
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 flex w-fit items-center gap-2.5 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-white">
              <Sparkles size={16} strokeWidth={2.5} />
            </span>
            <span className="font-semibold tracking-tight">Lumina</span>
          </Link>
          {children}
        </div>
      </section>
    </main>
  )
}
