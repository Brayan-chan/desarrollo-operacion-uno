import type { LucideIcon } from 'lucide-react'
import { Activity, BarChart3, ClipboardList, FolderKanban, ClockAlert } from 'lucide-react'

type Metric = { label: string; value: string; detail: string; icon: LucideIcon }

export function StatsGrid({ projects, pending, active, overdue, progress, total }: { projects: number; pending: number; active: number; overdue: number; progress: number; total: number }) {
  const metrics: Metric[] = [
    { label: 'Proyectos activos', value: String(projects), detail: 'Estado Activo; excluye archivados', icon: FolderKanban },
    { label: 'Tareas pendientes', value: String(pending), detail: 'Estado Pendiente en este proyecto', icon: ClipboardList },
    { label: 'Tareas en curso', value: String(active), detail: 'En progreso o en revisión', icon: Activity },
    { label: 'Tareas vencidas', value: String(overdue), detail: 'Sin completar; fecha anterior a hoy', icon: ClockAlert },
    { label: 'Progreso del proyecto', value: `${Number.isFinite(progress) ? progress : 0}%`, detail: total ? 'Completadas ÷ todas las tareas' : 'Sin tareas: 0% de avance', icon: BarChart3 },
  ]

  return (
    <div data-tour="metrics" className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map(({ label, value, detail, icon: Icon }) => (
        <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
          <div className="mb-5 flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={17} className="text-slate-300" /></div>
          <strong className="text-3xl font-semibold tracking-tight">{value}</strong><p className="mt-2 text-[11px] leading-4 text-slate-500">{detail}</p>
        </article>
      ))}
    </div>
  )
}
