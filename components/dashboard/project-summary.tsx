import type { Activity, Person, Project } from '@/types/demo'
import { Avatar } from './avatar'
import { formatActivityDateMX } from '@/lib/metrics'

export function ProjectSummary({ project, tasksCount, completed, overdue, progress, today, people, activities }: { project: Project; tasksCount: number; completed: number; overdue: number; progress: number; today: string; people: Person[]; activities: Activity[] }) {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
        <div className="mb-5"><h3 className="font-semibold">Proyecto seleccionado</h3><p className="mt-1 text-xs text-slate-500">{project.name}</p>{project.client && <p className="mt-1 text-[10px] text-slate-500">Cliente: {project.client}</p>}</div>
        <div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-500">Progreso: tareas completadas / total</span><strong>{progress}%</strong></div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Progreso del proyecto" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-[#8d72c9] transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><div><strong className="block text-lg">{tasksCount}</strong><span className="text-[10px] text-slate-500">Tareas</span></div><div><strong className="block text-lg">{completed}</strong><span className="text-[10px] text-slate-500">Completadas</span></div><div><strong className="block text-lg">{overdue}</strong><span className="text-[10px] text-slate-500">Vencidas</span></div></div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
        <h3 className="mb-5 font-semibold">Actividad reciente</h3>
        <div className="flex flex-col gap-4">{activities.slice(0, 3).map((activity) => { const actor = people.find((person) => person.id === activity.actorId); return <div key={activity.id} className="flex gap-3"><Avatar small person={actor} /><div className="min-w-0"><p className="text-xs leading-5 text-slate-600"><strong className="font-semibold text-slate-800">{actor?.name ?? 'Sistema'}</strong> {activity.description}</p><time dateTime={activity.createdAt} className="mt-0.5 block text-[10px] text-slate-500">{formatActivityDateMX(activity.createdAt, today)}</time></div></div> })}{activities.length === 0 && <p className="text-xs text-slate-500">Todavía no hay actividad en este proyecto.</p>}</div>
      </section>
    </aside>
  )
}
