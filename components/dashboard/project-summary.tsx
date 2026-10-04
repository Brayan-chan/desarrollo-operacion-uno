import { MoreHorizontal } from 'lucide-react'
import type { Activity, Person, Project } from '@/types/demo'
import { Avatar } from './avatar'

const relativeTime = (date: string) => {
  const hours = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 3_600_000))
  if (hours < 1) return 'hace unos minutos'
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  return days === 1 ? 'ayer' : `hace ${days} días`
}

export function ProjectSummary({ project, tasksCount, completed, overdue, people, activities }: { project: Project; tasksCount: number; completed: number; overdue: number; people: Person[]; activities: Activity[] }) {
  return (
    <aside className="flex flex-col gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
        <div className="mb-5 flex items-start justify-between"><div><h3 className="font-semibold">Proyecto principal</h3><p className="mt-1 text-xs text-slate-400">{project.name}</p>{project.client && <p className="mt-1 text-[10px] text-slate-500">Cliente: {project.client}</p>}</div><button className="text-slate-400" aria-label="Opciones del proyecto"><MoreHorizontal size={17} /></button></div>
        <div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-500">Progreso</span><strong>{project.progress}%</strong></div>
        <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Progreso del proyecto" aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-[#8d72c9] transition-all" style={{ width: `${project.progress}%` }} /></div>
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><div><strong className="block text-lg">{tasksCount}</strong><span className="text-[10px] text-slate-500">Tareas</span></div><div><strong className="block text-lg">{completed}</strong><span className="text-[10px] text-slate-500">Completadas</span></div><div><strong className="block text-lg">{overdue}</strong><span className="text-[10px] text-slate-500">Vencidas</span></div></div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
        <div className="mb-5 flex items-center justify-between"><h3 className="font-semibold">Actividad reciente</h3><button className="text-xs text-[#694ba8]">Ver todo</button></div>
        <div className="flex flex-col gap-4">{activities.slice(0, 3).map((activity) => { const actor = people.find((person) => person.id === activity.actorId); return <div key={activity.id} className="flex gap-3"><Avatar small person={actor} /><div className="min-w-0"><p className="text-xs leading-5 text-slate-600"><strong className="font-semibold text-slate-800">{actor?.name ?? 'Sistema'}</strong> {activity.description}</p><p className="mt-0.5 text-[10px] text-slate-500">{relativeTime(activity.createdAt)}</p></div></div> })}</div>
      </section>
    </aside>
  )
}
