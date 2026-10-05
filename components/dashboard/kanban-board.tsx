import { ChevronDown, MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react'
import type { Person, Status, Task } from '@/types/demo'
import { Avatar } from './avatar'

const statuses: Status[] = ['Pendiente', 'En progreso', 'En revisión', 'Completada']

const statusMeta: Record<Status, { color: string; dot: string }> = {
  Pendiente: { color: 'border-slate-200 bg-white', dot: 'bg-slate-400' },
  'En progreso': { color: 'border-[#d9cdf2] bg-[#f8f5ff]', dot: 'bg-[#8d72c9]' },
  'En revisión': { color: 'border-[#f2d7a5] bg-[#fffaf0]', dot: 'bg-[#d99c25]' },
  Completada: { color: 'border-[#c7e1d4] bg-[#f2faf5]', dot: 'bg-[#59a77d]' },
}

export function KanbanBoard({ tasks, people, search, onSearch, onSelectTask }: { tasks: Task[]; people: Person[]; search: string; onSearch: (value: string) => void; onSelectTask: (task: Task) => void }) {
  return (
    <section data-tour="board" aria-labelledby="work-title" className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 id="work-title" className="font-semibold">Trabajo en curso</h3><p className="mt-1 text-xs text-slate-400">El flujo actual del proyecto principal</p></div>
        <div className="flex items-center gap-2">
          <label className="relative flex-1"><span className="sr-only">Buscar tarea</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar tarea" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-slate-400 sm:w-44" /></label>
          <button className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500" aria-label="Filtrar tareas"><SlidersHorizontal size={15} /></button>
        </div>
      </div>
      <div className="overflow-x-auto" tabIndex={0} aria-label="Tablero de tareas con desplazamiento horizontal">
        <div className="grid min-w-[900px] grid-cols-4 gap-3 p-4">
          {statuses.map((status) => {
            const columnTasks = tasks.filter((task) => task.status === status).sort((first, second) => first.order - second.order)
            return (
              <section key={status} aria-labelledby={`status-${status}`} className="rounded-lg bg-[#f7f8fa] p-2.5">
                <div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${statusMeta[status].dot}`} /><h4 id={`status-${status}`} className="text-xs font-semibold text-slate-700">{status}</h4><span className="text-[11px] text-slate-400">{columnTasks.length}</span></div><button className="text-slate-400" aria-label={`Opciones de ${status}`}><MoreHorizontal size={16} /></button></div>
                <div className="flex flex-col gap-2">
                  {columnTasks.map((task) => (
                    <button key={task.id} data-tour={task.id === 't2' ? 'sample-task' : undefined} onClick={() => onSelectTask(task)} className={`group rounded-lg border p-3 text-left shadow-[0_1px_3px_rgba(24,34,48,0.04)] transition hover:-translate-y-0.5 hover:shadow-md ${statusMeta[status].color}`}>
                      <div className="mb-3 flex items-start justify-between gap-2"><span className={`rounded px-1.5 py-1 text-[10px] font-semibold ${task.priority === 'Alta' ? 'bg-[#fbe5e5] text-[#9f3434]' : task.priority === 'Media' ? 'bg-[#fff1cf] text-[#80580f]' : 'bg-[#dff3e8] text-[#32734f]'}`}>{task.priority}</span>{task.dueDate ? <time dateTime={task.dueDate} className="text-[10px] text-slate-500">{task.dueDate.slice(5).replace('-', '/')}</time> : <span className="text-[10px] text-slate-500">Sin fecha</span>}</div>
                      {(task.dueState === 'Vencida' || task.dueState === 'Vence hoy') && <span className={`mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${task.dueState === 'Vencida' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{task.dueState}</span>}
                      <span className="mb-2 block text-xs font-semibold leading-5 text-[#263442]">{task.title}</span>
                      <span className="inline-flex rounded bg-white/80 px-1.5 py-1 text-[10px] text-slate-600">{task.tag}</span>
                      <div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-2"><Avatar small person={people.find((person) => person.id === task.assigneeId)} /><span className="max-w-[80px] truncate text-[10px] text-slate-600">{people.find((person) => person.id === task.assigneeId)?.name.split(' ')[0] ?? 'Sin asignar'}</span></div><ChevronDown size={13} className="text-slate-400" /></div>
                    </button>
                  ))}
                  {columnTasks.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">No hay tareas</p>}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </section>
  )
}
