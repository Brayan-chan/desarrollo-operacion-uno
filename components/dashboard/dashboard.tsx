'use client'

/* eslint-disable react-hooks/set-state-in-effect -- The selected scenario is restored from browser storage after hydration. */

import { useEffect, useMemo, useState } from 'react'
import { Plus, Sparkles } from 'lucide-react'
import { scenarios } from '@/data/scenarios'
import { useDemoWorkspace } from '@/hooks/use-demo-workspace'
import { ACTIVE_SCENARIO_KEY, clearAllDemoData, createStorageSnapshot, readActiveScenario, restoreStorageSnapshot, type StorageSnapshot } from '@/lib/demo-storage'
import { changeTaskStatus, createProject, createTask, deleteProject, deleteTask, duplicateTask, setProjectArchived, updateProject, updateTask, type ProjectInput, type TaskInput } from '@/lib/workspace'
import type { Project, ScenarioKey, Status, Task } from '@/types/demo'
import { DashboardHeader } from './header'
import { KanbanBoard } from './kanban-board'
import { ProjectSummary } from './project-summary'
import { ScenarioDialog } from './scenario-dialog'
import { Sidebar } from './sidebar'
import { StatsGrid } from './stats-grid'
import { StorageAlert } from './storage-alert'
import { TaskDrawer } from './task-drawer'
import { ConfirmDialog } from './confirm-dialog'
import { ProjectForm } from './project-form'
import { TaskForm } from './task-form'
import { ProjectToolbar } from './project-toolbar'

export function Dashboard() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('agencia')
  const [activeView, setActiveView] = useState('Inicio')
  const [search, setSearch] = useState('')
  const [showScenario, setShowScenario] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'scenario' | 'all' | 'clear' | null>(null)
  const [undoSnapshot, setUndoSnapshot] = useState<StorageSnapshot | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const [projectForm, setProjectForm] = useState<Project | 'new' | null>(null)
  const [taskForm, setTaskForm] = useState<Task | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ kind: 'project' | 'task'; id: string } | null>(null)
  const scenario = scenarios[scenarioKey]
  const { workspace, setWorkspace, storageError, saveState, isHydrating, clearStorageError, restore } = useDemoWorkspace(scenarioKey, scenario.workspace, resetKey)

  useEffect(() => {
    setScenarioKey(readActiveScenario(window.localStorage))
  }, [])

  const selectedTask = workspace.tasks.find((task) => task.id === selectedTaskId) ?? null
  const currentProject = workspace.projects.find((project) => project.id === workspace.selectedProjectId) ?? workspace.projects.find((project) => !project.archived) ?? workspace.projects[0]
  const projectTasks = workspace.tasks.filter((task) => task.projectId === currentProject?.id)
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-MX')
    if (!query) return projectTasks
    return projectTasks.filter((task) => {
      const project = workspace.projects.find((item) => item.id === task.projectId)
      const assignee = workspace.people.find((person) => person.id === task.assigneeId)
      return `${task.title} ${project?.name ?? ''} ${assignee?.name ?? ''} ${task.tag}`.toLocaleLowerCase('es-MX').includes(query)
    })
  }, [projectTasks, search, workspace.people, workspace.projects])
  const completed = projectTasks.filter((task) => task.status === 'Completada').length
  const active = projectTasks.filter((task) => task.status === 'En progreso' || task.status === 'En revisión').length
  const overdue = projectTasks.filter((task) => task.dueState === 'Vencida').length
  const activeProjects = workspace.projects.filter((project) => !project.archived && project.status !== 'Completado').length
  const displayDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeZone: 'America/Merida' }).format(new Date())

  const updateStatus = (id: string, status: Status) => {
    const result = setWorkspace((current) => changeTaskStatus(current, id, status))
    setNotice(result?.ok ? 'Cambio guardado en este navegador.' : 'El cambio no se pudo guardar.')
    setUndoSnapshot(null)
  }

  const saveProject = (input: ProjectInput) => {
    const result = setWorkspace((current) => projectForm === 'new' ? createProject(current, input) : projectForm ? updateProject(current, projectForm.id, input) : current)
    setNotice(result?.ok ? 'Proyecto guardado en este navegador.' : 'No se pudo guardar el proyecto.')
    setProjectForm(null)
  }

  const saveTask = (input: TaskInput) => {
    const result = setWorkspace((current) => {
      const next = taskForm === 'new' ? createTask(current, input) : taskForm ? updateTask(current, taskForm.id, input) : current
      return next === current || current.selectedProjectId === input.projectId ? next : { ...next, selectedProjectId: input.projectId }
    })
    setNotice(result?.ok ? 'Tarea guardada en este navegador.' : 'No se pudo guardar la tarea.')
    setTaskForm(null)
  }

  const duplicateSelectedTask = (task: Task) => {
    const result = setWorkspace((current) => duplicateTask(current, task.id))
    setNotice(result?.ok ? 'Tarea duplicada.' : 'No se pudo duplicar la tarea.')
    setSelectedTaskId(null)
  }

  const requestDeleteProject = (project: Project) => {
    const count = workspace.tasks.filter((task) => task.projectId === project.id).length
    if (count) { setNotice(`No se puede eliminar “${project.name}”: tiene ${count} tarea${count === 1 ? '' : 's'}. Muévelas o elimínalas primero; también puedes archivar el proyecto.`); return }
    setDeleteTarget({ kind: 'project', id: project.id })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const snapshot = createStorageSnapshot(window.localStorage)
    const result = setWorkspace((current) => deleteTarget.kind === 'project' ? deleteProject(current, deleteTarget.id) : deleteTask(current, deleteTarget.id))
    setNotice(result?.ok ? `${deleteTarget.kind === 'project' ? 'Proyecto' : 'Tarea'} eliminad${deleteTarget.kind === 'project' ? 'o' : 'a'}.` : 'No se pudo eliminar.')
    if (result?.ok && snapshot.ok) setUndoSnapshot(snapshot.value)
    setSelectedTaskId(null)
    setDeleteTarget(null)
  }

  const selectScenario = (key: ScenarioKey) => {
    setSelectedTaskId(null)
    setSearch('')
    setNotice(null)
    setUndoSnapshot(null)
    setProjectForm(null)
    setTaskForm(null)
    try { window.localStorage.setItem(ACTIVE_SCENARIO_KEY, key) } catch { setNotice('No se pudo recordar el escenario seleccionado.') }
    setScenarioKey(key)
    setShowScenario(false)
  }

  const performDestructiveAction = () => {
    if (!confirmAction) return
    const snapshot = createStorageSnapshot(window.localStorage)
    if (!snapshot.ok) { setNotice(snapshot.message); setConfirmAction(null); return }
    const result = confirmAction === 'scenario' ? restore() : clearAllDemoData(window.localStorage)
    if (!result.ok) { setNotice(result.message); setConfirmAction(null); return }
    setUndoSnapshot(snapshot.value)
    setSelectedTaskId(null)
    setNotice(confirmAction === 'clear' ? 'Datos locales borrados.' : 'Datos de demostración restaurados.')
    if (confirmAction !== 'scenario') { setScenarioKey('agencia'); setResetKey((value) => value + 1) }
    setConfirmAction(null)
    setShowScenario(false)
  }

  const undo = () => {
    if (!undoSnapshot) return
    const result = restoreStorageSnapshot(window.localStorage, undoSnapshot)
    if (!result.ok) { setNotice(result.message); return }
    setScenarioKey(readActiveScenario(window.localStorage))
    setResetKey((value) => value + 1)
    setUndoSnapshot(null)
    setNotice('Datos recuperados.')
  }

  return (
    <main className="min-h-screen bg-[#f6f7f9] text-[#182230]">
      <div className="flex min-h-screen">
        <Sidebar activeView={activeView} onNavigate={setActiveView} onOpenDemo={() => setShowScenario(true)} />
        <section className="min-w-0 flex-1">
          <DashboardHeader activeView={activeView} scenarioLabel={scenario.label} person={workspace.people[0]} onOpenDemo={() => setShowScenario(true)} />
          <div className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:px-10">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm capitalize text-slate-500">{displayDate}</p><h2 className="text-3xl font-semibold tracking-[-0.04em] text-[#192735]">Vista general</h2><p className="mt-2 max-w-xl text-sm text-slate-500">Una lectura rápida de lo que está pasando y de lo que necesita atención.</p></div><button data-tour="new-project" onClick={() => setProjectForm('new')} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#192735] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#263a4b]"><Plus size={16} />Nuevo proyecto</button></div>
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-slate-500"><span aria-live="polite">{isHydrating ? 'Cargando datos locales…' : saveState === 'error' ? 'Cambios sin guardar' : 'Guardado en este navegador'}</span>{notice && <span role="status">{notice} {undoSnapshot && <button onClick={undo} className="ml-2 font-semibold text-[#694ba8] underline">Deshacer</button>}</span>}</div>
            {storageError && <StorageAlert message={storageError.message} onDismiss={clearStorageError} onRestore={() => setConfirmAction('scenario')} />}
            {isHydrating ? <div className="grid min-h-[320px] place-items-center rounded-xl bg-white text-sm text-slate-500">Cargando espacio de trabajo…</div> : <>
            <ProjectToolbar projects={workspace.projects} selectedId={currentProject?.id ?? null} onSelect={(id) => { setWorkspace((current) => ({ ...current, selectedProjectId: id, updatedAt: new Date().toISOString() })); setSearch(''); setSelectedTaskId(null) }} onCreateProject={() => setProjectForm('new')} onEditProject={setProjectForm} onArchiveProject={(project) => { const result = setWorkspace((current) => setProjectArchived(current, project.id, !project.archived)); setNotice(result?.ok ? project.archived ? 'Proyecto reactivado.' : 'Proyecto archivado.' : 'No se pudo actualizar el proyecto.') }} onDeleteProject={requestDeleteProject} onCreateTask={() => setTaskForm('new')} />
            <StatsGrid projects={activeProjects} pending={projectTasks.length - completed} active={active} progress={currentProject?.progress ?? 0} />
            {!currentProject ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><h3 className="text-lg font-semibold">Todavía no hay proyectos</h3><p className="mt-2 text-sm text-slate-500">Crea un proyecto para organizar tus tareas.</p><button onClick={() => setProjectForm('new')} className="mt-5 min-h-11 rounded-lg bg-[#192735] px-4 text-sm font-semibold text-white">Crear primer proyecto</button></div> : <>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <KanbanBoard tasks={filteredTasks} people={workspace.people} search={search} onSearch={setSearch} onSelectTask={(task: Task) => setSelectedTaskId(task.id)} />
              <ProjectSummary project={currentProject} tasksCount={projectTasks.length} completed={completed} overdue={overdue} people={workspace.people} activities={workspace.activities.filter((activity) => activity.metadata.projectId === currentProject.id || activity.entityId === currentProject.id || projectTasks.some((task) => task.id === activity.entityId))} />
            </div>
            </>}
            <div className="mt-8 flex flex-col gap-3 rounded-xl border border-[#ddd2f3] bg-[#f7f4ff] p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-[#694ba8] shadow-sm"><Sparkles size={17} /></div><div><p className="text-sm font-semibold text-[#4e3e79]">No es otro tablero. Es una operación adaptable.</p><p className="mt-1 text-xs leading-5 text-[#665985]">Explora escenarios para ver cómo Operación Uno modela procesos distintos: aprobaciones, responsables, dependencias y entregas.</p></div></div><button onClick={() => setShowScenario(true)} className="min-h-10 shrink-0 rounded-lg bg-[#694ba8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#5c4098]">Abrir centro de demo</button></div>
            </>}
          </div>
        </section>
      </div>
      {showScenario && <ScenarioDialog current={scenarioKey} onSelect={selectScenario} onClose={() => setShowScenario(false)} onRestore={() => setConfirmAction('scenario')} onRestoreAll={() => setConfirmAction('all')} onClearAll={() => setConfirmAction('clear')} />}
      {confirmAction && <ConfirmDialog title={confirmAction === 'scenario' ? '¿Restaurar este escenario?' : confirmAction === 'all' ? '¿Restaurar toda la demo?' : '¿Borrar los datos locales?'} description={confirmAction === 'scenario' ? 'Se reemplazarán los cambios de este escenario por sus datos iniciales.' : confirmAction === 'all' ? 'Todos los escenarios volverán a sus datos iniciales.' : 'Se eliminarán los datos de Operación Uno guardados en este navegador.'} confirmLabel={confirmAction === 'clear' ? 'Borrar datos' : 'Restaurar'} onConfirm={performDestructiveAction} onCancel={() => setConfirmAction(null)} />}
      {deleteTarget && <ConfirmDialog title={deleteTarget.kind === 'project' ? '¿Eliminar proyecto?' : '¿Eliminar tarea?'} description="Esta acción elimina el elemento de la demo local. Podrás deshacerla inmediatamente." confirmLabel="Eliminar" onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />}
      {selectedTask && !taskForm && <TaskDrawer task={selectedTask} project={workspace.projects.find((project) => project.id === selectedTask.projectId)} people={workspace.people} scenarioLabel={scenario.label} onClose={() => setSelectedTaskId(null)} onChangeStatus={(status) => updateStatus(selectedTask.id, status)} onEdit={() => setTaskForm(selectedTask)} onDuplicate={() => duplicateSelectedTask(selectedTask)} onDelete={() => setDeleteTarget({ kind: 'task', id: selectedTask.id })} />}
      {projectForm && <ProjectForm key={projectForm === 'new' ? 'new' : projectForm.id} project={projectForm === 'new' ? undefined : projectForm} workspace={workspace} onSave={saveProject} onCancel={() => setProjectForm(null)} />}
      {taskForm && currentProject && <TaskForm key={taskForm === 'new' ? 'new' : taskForm.id} task={taskForm === 'new' ? undefined : taskForm} projectId={currentProject.id} workspace={workspace} onSave={saveTask} onCancel={() => setTaskForm(null)} />}
    </main>
  )
}
