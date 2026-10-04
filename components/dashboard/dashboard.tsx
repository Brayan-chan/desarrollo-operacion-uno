'use client'

import { useMemo, useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { scenarios } from '@/data/scenarios'
import { useDemoTasks } from '@/hooks/use-demo-tasks'
import type { ScenarioKey, Status, Task } from '@/types/demo'
import { DashboardHeader } from './header'
import { KanbanBoard } from './kanban-board'
import { ProjectSummary } from './project-summary'
import { ScenarioDialog } from './scenario-dialog'
import { Sidebar } from './sidebar'
import { StatsGrid } from './stats-grid'
import { StorageAlert } from './storage-alert'
import { TaskDrawer } from './task-drawer'

function DashboardSkeleton() {
  return <div className="grid min-h-[420px] place-items-center rounded-xl border border-slate-200 bg-white"><div className="text-center"><div className="mx-auto mb-3 size-8 animate-pulse rounded-full bg-[#ddd2f3]" /><p className="text-sm text-slate-500">Cargando tu espacio de trabajo…</p></div></div>
}

export function Dashboard() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('agencia')
  const [activeView, setActiveView] = useState('Inicio')
  const [search, setSearch] = useState('')
  const [showScenario, setShowScenario] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const scenario = scenarios[scenarioKey]
  const { tasks, setTasks, isLoading, storageError, clearStorageError, restore } = useDemoTasks(scenarioKey, scenario.tasks)

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? null
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-MX')
    if (!query) return tasks
    return tasks.filter((task) => `${task.title} ${task.project} ${task.assignee} ${task.tag}`.toLocaleLowerCase('es-MX').includes(query))
  }, [search, tasks])
  const completed = tasks.filter((task) => task.status === 'Completada').length
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)
  const active = tasks.filter((task) => task.status === 'En progreso' || task.status === 'En revisión').length
  const today = new Date().toISOString().slice(0, 10)
  const overdue = tasks.filter((task) => task.due < today && task.status !== 'Completada').length
  const displayDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeZone: 'America/Merida' }).format(new Date())

  const updateStatus = (id: string, status: Status) => setTasks((current) => current.map((task) => task.id === id ? { ...task, status } : task))

  const selectScenario = (key: ScenarioKey) => {
    setSelectedTaskId(null)
    setSearch('')
    setScenarioKey(key)
    setShowScenario(false)
  }

  const confirmRestore = () => {
    if (window.confirm('Esta acción reemplazará los datos actuales de este escenario por los datos originales de demostración.')) {
      restore()
      setSelectedTaskId(null)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#182230]">
      <div className="flex min-h-screen">
        <Sidebar activeView={activeView} onNavigate={setActiveView} onOpenDemo={() => setShowScenario(true)} />
        <section className="min-w-0 flex-1">
          <DashboardHeader activeView={activeView} scenarioLabel={scenario.label} person={scenario.people[0]} onOpenDemo={() => setShowScenario(true)} />
          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm capitalize text-slate-500">{displayDate}</p><h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#192735]">Vista general</h2><p className="mt-2 max-w-xl text-sm text-slate-500">Una lectura rápida de lo que está pasando y de lo que necesita atención.</p></div><button data-tour="new-project" onClick={() => setShowScenario(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#192735] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#263a4b]"><Plus size={16} />Nuevo proyecto</button></div>
            {storageError && <StorageAlert message={storageError} onDismiss={clearStorageError} onRestore={restore} />}
            {isLoading ? <DashboardSkeleton /> : <><StatsGrid projects={scenario.projects.length} pending={tasks.length - completed} active={active} progress={progress} /><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"><KanbanBoard tasks={filteredTasks} search={search} onSearch={setSearch} onSelectTask={(task: Task) => setSelectedTaskId(task.id)} /><ProjectSummary project={scenario.projects[0]} tasksCount={tasks.length} completed={completed} overdue={overdue} progress={progress} /></div><div className="mt-8 flex flex-col gap-3 rounded-xl border border-[#ddd2f3] bg-[#f7f4ff] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#694ba8] shadow-sm"><Sparkles size={17} /></div><div><p className="text-sm font-semibold text-[#4e3e79]">No es otro tablero. Es una operación adaptable.</p><p className="mt-1 text-xs leading-5 text-[#665985]">Explora escenarios para ver cómo Operación Uno modela procesos distintos: aprobaciones, responsables, dependencias y entregas.</p></div></div><button onClick={() => setShowScenario(true)} className="min-h-10 shrink-0 rounded-lg bg-[#694ba8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5c4098]">Abrir centro de demo</button></div></>}
          </div>
        </section>
      </div>
      {showScenario && <ScenarioDialog current={scenarioKey} onSelect={selectScenario} onClose={() => setShowScenario(false)} onRestore={confirmRestore} />}
      {selectedTask && <TaskDrawer task={selectedTask} scenarioLabel={scenario.label} onClose={() => setSelectedTaskId(null)} onChangeStatus={(status) => updateStatus(selectedTask.id, status)} />}
    </main>
  )
}
