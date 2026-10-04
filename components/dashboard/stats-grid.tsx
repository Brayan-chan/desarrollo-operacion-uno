import type { LucideIcon } from 'lucide-react'
import { Activity, BarChart3, ClipboardList, FolderKanban } from 'lucide-react'

type Metric = { label: string; value: string; detail: string; icon: LucideIcon }

export function StatsGrid({ projects, pending, active, progress }: { projects: number; pending: number; active: number; progress: number }) {
  const metrics: Metric[] = [
    { label: 'Proyectos activos', value: String(projects), detail: 'En seguimiento', icon: FolderKanban },
    { label: 'Tareas pendientes', value: String(pending), detail: 'Por atender', icon: ClipboardList },
    { label: 'En progreso', value: String(active), detail: 'Con movimiento esta semana', icon: Activity },
    { label: 'Progreso promedio', value: `${progress}%`, detail: 'Del proyecto principal', icon: BarChart3 },
  ]

  return (
    <div data-tour="metrics" className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(({ label, value, detail, icon: Icon }) => (
        <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
          <div className="mb-5 flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={17} className="text-slate-300" /></div>
          <div className="flex items-end justify-between gap-3"><strong className="text-3xl font-semibold tracking-tight">{value}</strong><span className="mb-1 text-right text-[11px] text-slate-400">{detail}</span></div>
        </article>
      ))}
    </div>
  )
}
