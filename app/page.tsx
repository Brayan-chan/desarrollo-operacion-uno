'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from 'lucide-react'

type Status = 'Pendiente' | 'En progreso' | 'En revisión' | 'Completada'
type ScenarioKey = 'agencia' | 'despacho' | 'software' | 'construccion' | 'operacion'

type Person = { id: string; name: string; role: string; initials: string; color: string }
type Task = {
  id: string; title: string; project: string; assignee: string; status: Status; priority: 'Alta' | 'Media' | 'Baja'; due: string; tag: string; description: string
}
type Scenario = { label: string; description: string; projects: string[]; people: Person[]; tasks: Task[] }

const people: Person[] = [
  { id: 'ana', name: 'Ana Torres', role: 'Dirección de proyectos', initials: 'AT', color: 'bg-[#f4b6c2]' },
  { id: 'carlos', name: 'Carlos Ruiz', role: 'Diseño y estrategia', initials: 'CR', color: 'bg-[#c4b5fd]' },
  { id: 'lucia', name: 'Lucía Méndez', role: 'Operaciones', initials: 'LM', color: 'bg-[#f2d399]' },
  { id: 'diego', name: 'Diego Soto', role: 'Desarrollo', initials: 'DS', color: 'bg-[#9cc7b4]' },
]

const baseTasks: Task[] = [
  { id: 't1', title: 'Validar alcance y objetivos', project: 'Lanzamiento web corporativo', assignee: 'Ana Torres', status: 'Completada', priority: 'Alta', due: '2026-10-02', tag: 'Aprobación', description: 'Alinear objetivos, entregables y responsables con el cliente.' },
  { id: 't2', title: 'Mapa de contenidos', project: 'Lanzamiento web corporativo', assignee: 'Carlos Ruiz', status: 'En progreso', priority: 'Media', due: '2026-10-07', tag: 'Contenido', description: 'Definir la estructura de contenidos para las páginas principales.' },
  { id: 't3', title: 'Propuesta de dirección visual', project: 'Lanzamiento web corporativo', assignee: 'Carlos Ruiz', status: 'En revisión', priority: 'Alta', due: '2026-10-09', tag: 'Diseño', description: 'Presentar rutas visuales y recibir aprobación interna.' },
  { id: 't4', title: 'Preparar entorno de desarrollo', project: 'Lanzamiento web corporativo', assignee: 'Diego Soto', status: 'Pendiente', priority: 'Baja', due: '2026-10-12', tag: 'Desarrollo', description: 'Configurar repositorio, ambientes y convenciones técnicas.' },
  { id: 't5', title: 'Revisión con cliente', project: 'Lanzamiento web corporativo', assignee: 'Ana Torres', status: 'Pendiente', priority: 'Alta', due: '2026-10-14', tag: 'Cliente', description: 'Revisar avance y registrar decisiones de la sesión.' },
  { id: 't6', title: 'Checklist de publicación', project: 'Lanzamiento web corporativo', assignee: 'Lucía Méndez', status: 'Pendiente', priority: 'Media', due: '2026-10-20', tag: 'Entrega', description: 'Confirmar analítica, dominios, contenidos y QA final.' },
]

const scenarios: Record<ScenarioKey, Scenario> = {
  agencia: { label: 'Agencia', description: 'Un flujo de lanzamiento donde conviven estrategia, diseño, contenido, desarrollo y aprobación del cliente.', projects: ['Lanzamiento web corporativo', 'Campaña de temporada'], people, tasks: baseTasks },
  despacho: { label: 'Despacho profesional', description: 'Seguimiento de un servicio para cliente con recopilación, análisis, revisión y entrega documental.', projects: ['Implementación de servicio para cliente'], people, tasks: baseTasks.map((t, i) => ({ ...t, project: 'Implementación de servicio para cliente', title: ['Recopilar información inicial', 'Analizar documentación', 'Elaborar informe ejecutivo', 'Revisión de calidad', 'Aprobación del cliente', 'Entrega de expediente'][i], tag: ['Entrada', 'Análisis', 'Documento', 'Revisión', 'Aprobación', 'Entrega'][i] })) },
  software: { label: 'Desarrollo de software', description: 'Un flujo de producto que conecta requerimientos, UX/UI, desarrollo, QA, correcciones y lanzamiento.', projects: ['Aplicación móvil'], people, tasks: baseTasks.map((t, i) => ({ ...t, project: 'Aplicación móvil', title: ['Levantar requerimientos', 'Diseñar experiencia UX/UI', 'Construir funcionalidad principal', 'Ejecutar pruebas QA', 'Resolver correcciones', 'Preparar lanzamiento'][i], tag: ['Requerimientos', 'UX/UI', 'Desarrollo', 'QA', 'Correcciones', 'Lanzamiento'][i] })) },
  construccion: { label: 'Construcción / remodelación', description: 'Control de una remodelación con presupuesto, compras, preparación, instalación, inspección y entrega.', projects: ['Remodelación de oficina'], people, tasks: baseTasks.map((t, i) => ({ ...t, project: 'Remodelación de oficina', title: ['Aprobar presupuesto', 'Comprar materiales', 'Preparar área de trabajo', 'Ejecutar instalación', 'Inspección de avance', 'Entrega de espacio'][i], tag: ['Presupuesto', 'Compras', 'Preparación', 'Instalación', 'Inspección', 'Entrega'][i] })) },
  operacion: { label: 'Operación general', description: 'Un escenario neutral para mostrar cómo el sistema puede adaptarse a cualquier operación por proyectos.', projects: ['Operación interna trimestral'], people, tasks: baseTasks.map((t, i) => ({ ...t, project: 'Operación interna trimestral', title: ['Definir prioridades', 'Organizar recursos', 'Ejecutar plan de trabajo', 'Revisar avance', 'Ajustar responsables', 'Cerrar periodo'][i] })) },
}

const statusMeta: Record<Status, { color: string; dot: string }> = {
  Pendiente: { color: 'border-slate-200 bg-white', dot: 'bg-slate-400' },
  'En progreso': { color: 'border-[#d9cdf2] bg-[#f8f5ff]', dot: 'bg-[#8d72c9]' },
  'En revisión': { color: 'border-[#f2d7a5] bg-[#fffaf0]', dot: 'bg-[#d99c25]' },
  Completada: { color: 'border-[#c7e1d4] bg-[#f2faf5]', dot: 'bg-[#59a77d]' },
}

function Avatar({ person, small = false }: { person?: Person; small?: boolean }) {
  return <span className={`inline-flex ${small ? 'size-7 text-[10px]' : 'size-9 text-xs'} shrink-0 items-center justify-center rounded-full font-semibold text-slate-700 ring-2 ring-white ${person?.color ?? 'bg-slate-200'}`}>{person?.initials ?? '—'}</span>
}

export default function Page() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('agencia')
  const [tasks, setTasks] = useState<Task[]>(baseTasks)
  const [activeView, setActiveView] = useState('Inicio')
  const [search, setSearch] = useState('')
  const [showScenario, setShowScenario] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const scenario = scenarios[scenarioKey]

  useEffect(() => {
    const saved = window.localStorage.getItem(`operacion-uno-${scenarioKey}`)
    setTasks(saved ? JSON.parse(saved) : scenario.tasks)
  }, [scenarioKey, scenario.tasks])

  useEffect(() => {
    window.localStorage.setItem(`operacion-uno-${scenarioKey}`, JSON.stringify(tasks))
  }, [tasks, scenarioKey])

  const updateStatus = (id: string, status: Status) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task))
  const filteredTasks = tasks.filter((task) => `${task.title} ${task.project} ${task.assignee} ${task.tag}`.toLowerCase().includes(search.toLowerCase()))
  const completed = tasks.filter((task) => task.status === 'Completada').length
  const progress = Math.round((completed / tasks.length) * 100)
  const active = tasks.filter((task) => task.status === 'En progreso' || task.status === 'En revisión').length
  const overdue = tasks.filter((task) => task.due < '2026-10-03' && task.status !== 'Completada').length

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#182230]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[82px] shrink-0 flex-col items-center border-r border-slate-200 bg-[#fbfcfd] py-5 lg:flex">
          <div className="mb-9 grid size-10 place-items-center rounded-xl bg-[#192735] text-white shadow-sm"><Sparkles size={19} /></div>
          <nav className="flex flex-1 flex-col items-center gap-4">
            {[[LayoutDashboard, 'Inicio'], [FolderKanban, 'Proyectos'], [ClipboardList, 'Tareas'], [CalendarDays, 'Calendario'], [Users, 'Equipo'], [BarChart3, 'Reportes']].map(([Icon, label]) => <button key={label as string} onClick={() => setActiveView(label as string)} title={label as string} className={`grid size-10 place-items-center rounded-xl transition ${activeView === label ? 'bg-[#edf0f3] text-[#192735]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}><Icon size={18} /></button>)}
          </nav>
          <button onClick={() => setShowScenario(true)} className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100" title="Centro de demostración"><Settings2 size={18} /></button>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-[#fbfcfd] px-5 sm:px-8">
            <div className="flex items-center gap-3"><button className="grid size-9 place-items-center rounded-lg border border-slate-200 lg:hidden"><Menu size={18} /></button><div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Operación Uno</p><h1 className="text-lg font-semibold tracking-tight">{activeView}</h1></div></div>
            <div className="flex items-center gap-3"><button className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:flex" onClick={() => setShowScenario(true)}><Sparkles size={14} className="text-[#866bc1]" />{scenario.label}<ChevronDown size={14} /></button><button className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><Bell size={18} /></button><Avatar person={people[0]} /></div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm text-slate-500">Martes, 3 de octubre de 2026</p><h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#192735]">Vista general</h2><p className="mt-2 max-w-xl text-sm text-slate-500">Una lectura rápida de lo que está pasando y de lo que necesita atención.</p></div><button onClick={() => setShowScenario(true)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#192735] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#263a4b]"><Plus size={16} />Nuevo proyecto</button></div>

            <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[['Proyectos activos', '2', 'En seguimiento', FolderKanban], ['Tareas pendientes', `${tasks.length - completed}`, 'Por atender', ClipboardList], ['En progreso', `${active}`, 'Con movimiento esta semana', Activity], ['Progreso promedio', `${progress}%`, 'Del proyecto principal', BarChart3]].map(([label, value, detail, Icon]) => <div key={label as string} className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]"><div className="mb-5 flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon size={17} className="text-slate-300" /></div><div className="flex items-end justify-between"><strong className="text-3xl font-semibold tracking-tight">{value}</strong><span className="mb-1 text-[11px] text-slate-400">{detail}</span></div></div>)}
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(24,34,48,0.03)]">
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">Trabajo en curso</h3><p className="mt-1 text-xs text-slate-400">El flujo actual del proyecto principal</p></div><div className="flex items-center gap-2"><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar tarea" className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none placeholder:text-slate-400 focus:border-slate-400 sm:w-44" /></div><button className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500"><SlidersHorizontal size={15} /></button></div></div>
                <div className="overflow-x-auto"><div className="grid min-w-[900px] grid-cols-4 gap-3 p-4">{(['Pendiente', 'En progreso', 'En revisión', 'Completada'] as Status[]).map((status) => <div key={status} className="rounded-lg bg-[#f7f8fa] p-2.5"><div className="mb-3 flex items-center justify-between px-1"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${statusMeta[status].dot}`} /><span className="text-xs font-semibold text-slate-700">{status}</span><span className="text-[11px] text-slate-400">{filteredTasks.filter((t) => t.status === status).length}</span></div><button className="text-slate-400"><MoreHorizontal size={16} /></button></div><div className="flex flex-col gap-2">{filteredTasks.filter((task) => task.status === status).map((task) => <button key={task.id} onClick={() => setSelectedTask(task)} className={`group rounded-lg border p-3 text-left shadow-[0_1px_3px_rgba(24,34,48,0.04)] transition hover:-translate-y-0.5 hover:shadow-md ${statusMeta[status].color}`}><div className="mb-3 flex items-start justify-between gap-2"><span className={`rounded px-1.5 py-1 text-[10px] font-semibold ${task.priority === 'Alta' ? 'bg-[#fbe5e5] text-[#bd5b5b]' : task.priority === 'Media' ? 'bg-[#fff1cf] text-[#a97720]' : 'bg-[#dff3e8] text-[#4b936b]'}`}>{task.priority}</span><span className="text-[10px] text-slate-400">{task.due.slice(5).replace('-', '/')}</span></div><h4 className="mb-2 text-xs font-semibold leading-5 text-[#263442]">{task.title}</h4><span className="inline-flex rounded bg-white/80 px-1.5 py-1 text-[10px] text-slate-500">{task.tag}</span><div className="mt-4 flex items-center justify-between"><div className="flex items-center gap-2"><Avatar small person={people.find((person) => person.name === task.assignee)} /><span className="max-w-[80px] truncate text-[10px] text-slate-500">{task.assignee.split(' ')[0]}</span></div><ChevronDown size={13} className="text-slate-300" /></div></button>)}</div></div>)}</div></div>
              </div>

              <div className="flex flex-col gap-6"><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]"><div className="mb-5 flex items-start justify-between"><div><h3 className="font-semibold">Proyecto principal</h3><p className="mt-1 text-xs text-slate-400">{scenario.projects[0]}</p></div><button className="text-slate-400"><MoreHorizontal size={17} /></button></div><div className="mb-2 flex items-center justify-between text-xs"><span className="text-slate-500">Progreso</span><strong>{progress}%</strong></div><div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#8d72c9] transition-all" style={{ width: `${progress}%` }} /></div><div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center"><div><strong className="block text-lg">{tasks.length}</strong><span className="text-[10px] text-slate-400">Tareas</span></div><div><strong className="block text-lg">{completed}</strong><span className="text-[10px] text-slate-400">Completadas</span></div><div><strong className="block text-lg">{overdue}</strong><span className="text-[10px] text-slate-400">Vencidas</span></div></div></div><div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_2px_8px_rgba(24,34,48,0.03)]"><div className="mb-5 flex items-center justify-between"><h3 className="font-semibold">Actividad reciente</h3><button className="text-xs text-[#8065bb]">Ver todo</button></div><div className="flex flex-col gap-4">{[['Ana Torres', 'completó Validar alcance', 'hace 2 h'], ['Carlos Ruiz', 'movió Propuesta visual a revisión', 'hace 4 h'], ['Lucía Méndez', 'fue asignada a Checklist', 'ayer']].map(([name, event, time]) => <div key={event} className="flex gap-3"><Avatar small person={people.find((p) => p.name === name)} /><div className="min-w-0"><p className="text-xs leading-5 text-slate-600"><strong className="font-semibold text-slate-800">{name}</strong> {event}</p><p className="mt-0.5 text-[10px] text-slate-400">{time}</p></div></div>)}</div></div></div>
            </div>

            <div className="mt-8 flex flex-col gap-3 rounded-xl border border-[#ddd2f3] bg-[#f7f4ff] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#8065bb] shadow-sm"><Sparkles size={17} /></div><div><p className="text-sm font-semibold text-[#4e3e79]">No es otro tablero. Es una operación adaptable.</p><p className="mt-1 text-xs leading-5 text-[#766a96]">Explora escenarios para ver cómo Operación Uno modela procesos distintos: aprobaciones, responsables, dependencias y entregas.</p></div></div><button onClick={() => setShowScenario(true)} className="shrink-0 rounded-lg bg-[#8065bb] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#7055ab]">Abrir centro de demo</button></div>
          </div>
        </section>
      </div>

      {showScenario && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#172331]/30 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"><div className="w-full max-w-2xl rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"><div className="mb-6 flex items-start justify-between"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#8065bb]">Centro de demostración</p><h3 className="text-xl font-semibold">Modela una operación distinta</h3><p className="mt-1 max-w-lg text-sm text-slate-500">Cada escenario tiene datos aislados. Tus cambios permanecen guardados en este navegador.</p></div><button onClick={() => setShowScenario(false)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X size={17} /></button></div><div className="grid gap-2 sm:grid-cols-2">{(Object.keys(scenarios) as ScenarioKey[]).map((key) => <button key={key} onClick={() => { setScenarioKey(key); setShowScenario(false) }} className={`rounded-xl border p-4 text-left transition ${key === scenarioKey ? 'border-[#aa91dd] bg-[#f8f5ff]' : 'border-slate-200 hover:border-slate-300'}`}><div className="mb-2 flex items-center justify-between"><span className="text-sm font-semibold">{scenarios[key].label}</span>{key === scenarioKey && <Check size={16} className="text-[#8065bb]" />}</div><p className="text-xs leading-5 text-slate-500">{scenarios[key].description}</p></button>)}</div><div className="mt-6 flex flex-col gap-3 rounded-lg bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold">Capacidades que se pueden personalizar</p><p className="mt-1 text-[11px] text-slate-500">Flujos de aprobación · permisos · formularios · automatizaciones · reportes · integraciones</p></div><button onClick={() => { if (window.confirm('Esta acción reemplazará los datos actuales de este escenario por los datos originales de demostración.')) { setTasks(scenario.tasks) } }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><RefreshCcw size={13} />Restaurar datos</button></div></div></div>}

      {selectedTask && <div className="fixed inset-0 z-40 flex items-end justify-end bg-[#172331]/20 backdrop-blur-[1px] sm:p-6"><div className="h-[88vh] w-full max-w-md rounded-t-2xl bg-white p-6 shadow-2xl sm:h-full sm:rounded-2xl"><div className="mb-6 flex items-start justify-between"><div><span className="mb-2 inline-flex rounded bg-[#f0eafb] px-2 py-1 text-[10px] font-semibold text-[#8065bb]">{selectedTask.tag}</span><h3 className="text-xl font-semibold leading-7">{selectedTask.title}</h3><p className="mt-1 text-xs text-slate-400">{selectedTask.project}</p></div><button onClick={() => setSelectedTask(null)} className="grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"><X size={17} /></button></div><div className="flex flex-col gap-5"><div><label className="mb-2 block text-xs font-semibold text-slate-500">Estado</label><select value={selectedTask.status} onChange={(e) => { const status = e.target.value as Status; updateStatus(selectedTask.id, status); setSelectedTask({ ...selectedTask, status }) }} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none"><option>Pendiente</option><option>En progreso</option><option>En revisión</option><option>Completada</option></select></div><div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-xs font-semibold text-slate-500">Responsable</label><div className="flex items-center gap-2 rounded-lg border border-slate-200 p-2"><Avatar small person={people.find((p) => p.name === selectedTask.assignee)} /><span className="text-xs">{selectedTask.assignee}</span></div></div><div><label className="mb-2 block text-xs font-semibold text-slate-500">Fecha límite</label><div className="flex items-center gap-2 rounded-lg border border-slate-200 p-2.5 text-xs text-slate-600"><Clock3 size={14} />{selectedTask.due}</div></div></div><div><label className="mb-2 block text-xs font-semibold text-slate-500">Descripción</label><p className="rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{selectedTask.description}</p></div><div className="rounded-lg border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold">Actividad</span><Activity size={14} className="text-slate-400" /></div><p className="text-xs text-slate-500">Tarea creada en el escenario {scenario.label}.</p><p className="mt-3 text-xs text-slate-500">Responsable: {selectedTask.assignee}</p></div></div></div></div>}
    </main>
  )
}
