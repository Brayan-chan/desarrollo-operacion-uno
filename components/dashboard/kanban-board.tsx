'use client'

import { useState, type DragEvent, type KeyboardEvent } from 'react'
import { GripVertical, Search, SlidersHorizontal } from 'lucide-react'
import type { Person, Status, Task } from '@/types/demo'
import { Avatar } from './avatar'
import { formatDateMX } from '@/lib/metrics'

const statuses: Status[] = ['Pendiente', 'En progreso', 'En revisión', 'Completada']
type Destination = { status: Status; index: number }

export function KanbanBoard({ tasks, people, search, onSearch, onSelectTask, onMoveTask, tourActive = false }: { tasks: Task[]; people: Person[]; search: string; onSearch: (value: string) => void; onSelectTask: (task: Task) => void; onMoveTask: (id: string, status: Status, index: number) => void; tourActive?: boolean }) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [keyboardId, setKeyboardId] = useState<string | null>(null)
  const [destination, setDestination] = useState<Destination | null>(null)
  const [announcement, setAnnouncement] = useState('Para mover una tarea con teclado, pulsa Espacio.')
  const [filterOpen, setFilterOpen] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('Todas')
  const [dueFilter, setDueFilter] = useState('Todas')
  const movingId = keyboardId ?? draggedId
  const isFiltered = Boolean(search.trim()) || priorityFilter !== 'Todas' || dueFilter !== 'Todas'
  const isTourBlocking = () => tourActive || isFiltered || document.body.classList.contains('driver-active')
  const ordered = (status: Status) => tasks.filter((task) => task.status === status && (priorityFilter === 'Todas' || task.priority === priorityFilter) && (dueFilter === 'Todas' || task.dueState === dueFilter)).sort((a, b) => a.order - b.order)
  const targetLength = (status: Status) => ordered(status).filter((task) => task.id !== movingId).length
  const clearMove = () => { setDraggedId(null); setKeyboardId(null); setDestination(null) }
  const commit = (id: string, target: Destination | null) => {
    if (target) { onMoveTask(id, target.status, target.index); setAnnouncement(`Tarea movida a ${target.status}, posición ${target.index + 1}.`) }
    clearMove()
  }
  const dragStart = (event: DragEvent<HTMLButtonElement>, task: Task) => {
    if (isTourBlocking()) { event.preventDefault(); return }
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', task.id)
    setDraggedId(task.id)
    setDestination({ status: task.status, index: ordered(task.status).findIndex((item) => item.id === task.id) })
    setAnnouncement(`Moviendo ${task.title}.`)
  }
  const over = (event: DragEvent<HTMLElement>, status: Status, index: number) => {
    if (!draggedId || isTourBlocking()) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDestination({ status, index })
  }
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, task: Task) => {
    if (isTourBlocking()) return
    if (keyboardId !== task.id) {
      if (event.key !== ' ') return
      event.preventDefault()
      setKeyboardId(task.id)
      setDestination({ status: task.status, index: ordered(task.status).findIndex((item) => item.id === task.id) })
      setAnnouncement(`${task.title} seleccionada. Usa las flechas, Enter para soltar o Escape para cancelar.`)
      return
    }
    if (event.key === 'Escape') { event.preventDefault(); clearMove(); setAnnouncement('Movimiento cancelado.'); return }
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); commit(task.id, destination); return }
    if (!destination || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return
    event.preventDefault()
    const column = statuses.indexOf(destination.status)
    const nextStatus = statuses[Math.max(0, Math.min(3, column + (event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0)))]
    const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0
    const nextIndex = Math.max(0, Math.min(targetLength(nextStatus), nextStatus === destination.status ? destination.index + delta : targetLength(nextStatus)))
    setDestination({ status: nextStatus, index: nextIndex })
    setAnnouncement(`Destino: ${nextStatus}, posición ${nextIndex + 1} de ${targetLength(nextStatus) + 1}.`)
  }
  return <section data-tour="board" aria-labelledby="work-title" className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 id="work-title" className="font-semibold">Trabajo en curso</h3><p className="mt-1 text-xs text-slate-500">{isFiltered ? 'Limpia los filtros para mover tareas.' : 'Arrastra tareas o usa Espacio y las flechas para moverlas.'}</p></div><div className="flex items-center gap-2"><label className="relative"><span className="sr-only">Buscar tarea</span><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar tarea" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-slate-400 sm:w-44" /></label><button onClick={() => setFilterOpen(!filterOpen)} aria-expanded={filterOpen} aria-label="Filtrar tareas" className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600"><SlidersHorizontal size={16} /></button></div></div>
    {filterOpen && <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 bg-slate-50 p-4"><label className="text-xs font-medium">Prioridad<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className="mt-1 block min-h-9 rounded-lg border border-slate-200 bg-white px-2"><option>Todas</option><option>Alta</option><option>Media</option><option>Baja</option></select></label><label className="text-xs font-medium">Vencimiento<select value={dueFilter} onChange={(event) => setDueFilter(event.target.value)} className="mt-1 block min-h-9 rounded-lg border border-slate-200 bg-white px-2"><option>Todas</option><option>Vencida</option><option>Vence hoy</option><option>Sin fecha</option></select></label><button onClick={() => { setPriorityFilter('Todas'); setDueFilter('Todas'); onSearch('') }} className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium">Limpiar filtros</button></div>}
    <p role="status" aria-live="assertive" className="sr-only">{announcement}</p>
    <div className="overflow-x-auto" tabIndex={0} aria-label="Tablero de tareas con desplazamiento horizontal"><div className="grid min-w-[900px] grid-cols-4 gap-3 p-4">
      {statuses.map((status) => {
        const columnTasks = ordered(status)
        const visibleTasks = columnTasks
        return <section key={status} aria-labelledby={`status-${status}`} onDragOver={(event) => over(event, status, targetLength(status))} onDrop={(event) => { event.preventDefault(); if (draggedId) commit(draggedId, destination) }} className={`rounded-lg p-2.5 transition-colors duration-150 ${destination?.status === status ? 'bg-[#eee8fa]' : 'bg-[#f7f8fa]'}`}>
          <div className="mb-3 flex items-center gap-2 px-1"><span className="size-2 rounded-full bg-[#8d72c9]" /><h4 id={`status-${status}`} className="text-xs font-semibold text-slate-700">{status}</h4><span className="text-[11px] text-slate-500">{columnTasks.length}</span></div>
          <div className="flex flex-col gap-2">{visibleTasks.map((task, index) => <div key={task.id} onDragOver={(event) => { event.stopPropagation(); const middle = event.currentTarget.getBoundingClientRect().top + event.currentTarget.offsetHeight / 2; const sourceIndex = columnTasks.findIndex((item) => item.id === draggedId); const rawIndex = index + (event.clientY > middle ? 1 : 0); over(event, status, Math.max(0, rawIndex - (sourceIndex >= 0 && sourceIndex < rawIndex ? 1 : 0))) }}>
            {movingId && destination?.status === status && destination.index === index && <div aria-hidden="true" className="mb-2 h-1 rounded-full bg-[#694ba8]" />}
            <button draggable={!tourActive && !isFiltered} onDragStart={(event) => dragStart(event, task)} onDragEnd={clearMove} onKeyDown={(event) => onKey(event, task)} data-tour={task.id === 't2' ? 'sample-task' : undefined} onClick={() => { if (!keyboardId && !draggedId) onSelectTask(task) }} aria-label={`${task.title}. ${task.status}. Posición ${index + 1}. Pulsa Espacio para mover.`} aria-describedby="board-keyboard-help" className={`group w-full rounded-lg border border-slate-200 bg-white p-3 text-left shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-[#694ba8] ${draggedId === task.id ? 'opacity-40' : ''}`}>
              <div className="mb-3 flex items-start justify-between gap-2"><span className={`rounded px-1.5 py-1 text-[10px] font-semibold ${task.priority === 'Alta' ? 'bg-red-100 text-red-800' : task.priority === 'Media' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>{task.priority}</span><GripVertical size={14} className="text-slate-400" />{task.dueDate ? <time dateTime={task.dueDate} title={formatDateMX(task.dueDate)} className="text-[10px] text-slate-500">{new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: 'America/Merida' }).format(new Date(`${task.dueDate}T12:00:00.000Z`))}</time> : <span className="text-[10px] text-slate-500">Sin fecha</span>}</div>
              {(task.dueState === 'Vencida' || task.dueState === 'Vence hoy') && <span className={`mb-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${task.dueState === 'Vencida' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{task.dueState}</span>}
              <span className="mb-2 block text-xs font-semibold leading-5 text-[#263442]">{task.title}</span><span className="inline-flex rounded bg-slate-50 px-1.5 py-1 text-[10px] text-slate-600">{task.tag}</span><div className="mt-4 flex items-center gap-2"><Avatar small person={people.find((person) => person.id === task.assigneeId)} /><span className="truncate text-[10px] text-slate-600">{people.find((person) => person.id === task.assigneeId)?.name.split(' ')[0] ?? 'Sin asignar'}</span></div>
            </button></div>)}
            {movingId && destination?.status === status && destination.index === visibleTasks.length && <div aria-hidden="true" className="h-1 rounded-full bg-[#694ba8]" />}
            {keyboardId && columnTasks.some((task) => task.id === keyboardId) && <div className="rounded-lg border border-dashed border-[#8065bb] bg-white/70 p-3 text-xs text-[#694ba8]">Tarea seleccionada para mover</div>}
            {columnTasks.length === 0 && !movingId && <p className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">{isFiltered ? 'Sin coincidencias' : 'No hay tareas'}</p>}
          </div>
        </section>
      })}
    </div></div><span id="board-keyboard-help" className="sr-only">Espacio para seleccionar; flechas izquierda y derecha para cambiar columna; arriba y abajo para reordenar; Enter para soltar; Escape para cancelar.</span>
  </section>
}
