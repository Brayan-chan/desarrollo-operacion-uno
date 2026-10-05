import type { Activity, ActivityType, DueState, Project, Task, TaskStatus, Workspace } from '@/types/demo'

export function getLocalDate(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Merida', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

export function calculateDueState(task: Pick<Task, 'status' | 'dueDate'>, today = getLocalDate()): DueState {
  if (task.status === 'Completada') return 'Completada'
  if (!task.dueDate) return 'Sin fecha'
  if (task.dueDate < today) return 'Vencida'
  if (task.dueDate === today) return 'Vence hoy'
  return 'En tiempo'
}

export function calculateProjectProgress(projectId: string, tasks: Task[]): number {
  const projectTasks = tasks.filter((task) => task.projectId === projectId)
  if (projectTasks.length === 0) return 0
  return Math.round((projectTasks.filter((task) => task.status === 'Completada').length / projectTasks.length) * 100)
}

export function refreshWorkspace(workspace: Workspace, today = getLocalDate()): Workspace {
  const tasks = workspace.tasks.map((task) => ({ ...task, dueState: calculateDueState(task, today) }))
  const projects: Project[] = workspace.projects.map((project) => ({ ...project, progress: calculateProjectProgress(project.id, tasks) }))
  return { ...workspace, tasks, projects }
}

export function changeTaskStatus(workspace: Workspace, taskId: string, status: TaskStatus, now = new Date()): Workspace {
  const task = workspace.tasks.find((item) => item.id === taskId)
  if (!task || task.status === status) return workspace
  const timestamp = now.toISOString()
  const actor = workspace.people.find((person) => person.id === task.assigneeId) ?? workspace.people[0]
  const order = Math.max(-1, ...workspace.tasks.filter((item) => item.projectId === task.projectId && item.status === status).map((item) => item.order)) + 1
  const tasks = workspace.tasks.map((item) => item.id === taskId ? { ...item, status, order, updatedAt: timestamp } : item)
  return refreshWorkspace({
    ...workspace,
    updatedAt: timestamp,
    tasks,
    activities: [{ id: crypto.randomUUID(), type: 'task.status_changed', entityType: 'task', entityId: taskId, actorId: actor?.id ?? 'sistema', description: `movió ${task.title} a ${status.toLocaleLowerCase('es-MX')}`, createdAt: timestamp, metadata: { projectId: task.projectId, previousStatus: task.status, nextStatus: status } }, ...workspace.activities],
  }, getLocalDate(now))
}

export function moveTask(workspace: Workspace, taskId: string, status: TaskStatus, targetIndex: number, now = new Date()): Workspace {
  const task = workspace.tasks.find((item) => item.id === taskId)
  if (!task) return workspace
  const source = workspace.tasks.filter((item) => item.projectId === task.projectId && item.status === task.status).sort((a, b) => a.order - b.order)
  const destination = (status === task.status ? source : workspace.tasks.filter((item) => item.projectId === task.projectId && item.status === status).sort((a, b) => a.order - b.order)).filter((item) => item.id !== taskId)
  const index = Math.max(0, Math.min(targetIndex, destination.length))
  if (status === task.status && source.findIndex((item) => item.id === taskId) === index) return workspace
  const timestamp = now.toISOString()
  destination.splice(index, 0, { ...task, status, updatedAt: timestamp })
  const positions = new Map(destination.map((item, position) => [item.id, { status, order: position }]))
  if (status !== task.status) source.filter((item) => item.id !== taskId).forEach((item, position) => positions.set(item.id, { status: task.status, order: position }))
  const tasks = workspace.tasks.map((item) => {
    const next = positions.get(item.id)
    return next ? { ...item, ...next, updatedAt: item.id === taskId ? timestamp : item.updatedAt } : item
  })
  const actorId = workspace.people.find((person) => person.id === task.assigneeId)?.id ?? workspace.people[0]?.id ?? 'sistema'
  const description = status === task.status ? `reordenó ${task.title} en ${status.toLocaleLowerCase('es-MX')}` : `movió ${task.title} a ${status.toLocaleLowerCase('es-MX')}`
  const next = logActivity({ ...workspace, tasks }, status === task.status ? 'task.reordered' : 'task.status_changed', 'task', taskId, description, actorId, now, { projectId: task.projectId, previousStatus: task.status, nextStatus: status, previousOrder: task.order, nextOrder: index })
  return refreshWorkspace(next, getLocalDate(now))
}

export type ProjectInput = Pick<Project, 'name' | 'description' | 'client' | 'status' | 'startDate' | 'dueDate' | 'ownerId' | 'color'>
export type TaskInput = Pick<Task, 'projectId' | 'title' | 'description' | 'status' | 'priority' | 'assigneeId' | 'dueDate' | 'tag'>
export type FieldErrors = Record<string, string>

export function validateProject(input: ProjectInput, workspace: Workspace): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.name.trim()) errors.name = 'Escribe el nombre del proyecto.'
  if (!input.ownerId || !workspace.people.some((person) => person.id === input.ownerId && person.active)) errors.ownerId = 'Selecciona un responsable activo.'
  if (!input.startDate) errors.startDate = 'Selecciona una fecha de inicio.'
  if (!input.dueDate) errors.dueDate = 'Selecciona una fecha de entrega.'
  if (input.startDate && input.dueDate && input.dueDate < input.startDate) errors.dueDate = 'La entrega debe ser posterior al inicio.'
  return errors
}

export function validateTask(input: TaskInput, workspace: Workspace): FieldErrors {
  const errors: FieldErrors = {}
  if (!input.title.trim()) errors.title = 'Escribe el título de la tarea.'
  if (!workspace.projects.some((project) => project.id === input.projectId && !project.archived)) errors.projectId = 'Selecciona un proyecto disponible.'
  if (input.assigneeId && !workspace.people.some((person) => person.id === input.assigneeId && person.active)) errors.assigneeId = 'Selecciona un responsable activo.'
  return errors
}

function logActivity(workspace: Workspace, type: ActivityType, entityType: Activity['entityType'], entityId: string, description: string, actorId: string, now: Date, metadata: Activity['metadata'] = {}): Workspace {
  const timestamp = now.toISOString()
  return { ...workspace, updatedAt: timestamp, activities: [{ id: crypto.randomUUID(), type, entityType, entityId, actorId, description, createdAt: timestamp, metadata }, ...workspace.activities] }
}

export function createProject(workspace: Workspace, input: ProjectInput, now = new Date()): Workspace {
  if (Object.keys(validateProject(input, workspace)).length) return workspace
  const project: Project = { ...input, id: crypto.randomUUID(), name: input.name.trim(), description: input.description.trim(), client: input.client?.trim() || null, progress: 0, archived: false }
  return logActivity({ ...workspace, projects: [...workspace.projects, project], selectedProjectId: project.id }, 'project.created', 'project', project.id, `creó el proyecto ${project.name}`, input.ownerId, now, { projectId: project.id })
}

export function updateProject(workspace: Workspace, id: string, input: ProjectInput, now = new Date()): Workspace {
  if (!workspace.projects.some((project) => project.id === id) || Object.keys(validateProject(input, workspace)).length) return workspace
  const projects = workspace.projects.map((project) => project.id === id ? { ...project, ...input, name: input.name.trim(), description: input.description.trim(), client: input.client?.trim() || null } : project)
  return logActivity({ ...workspace, projects }, 'project.updated', 'project', id, `actualizó el proyecto ${input.name.trim()}`, input.ownerId, now, { projectId: id })
}

export function setProjectArchived(workspace: Workspace, id: string, archived: boolean, now = new Date()): Workspace {
  const project = workspace.projects.find((item) => item.id === id)
  if (!project || project.archived === archived) return workspace
  const projects = workspace.projects.map((item) => item.id === id ? { ...item, archived } : item)
  const selectedProjectId = workspace.selectedProjectId === id && archived ? projects.find((item) => !item.archived)?.id ?? null : workspace.selectedProjectId
  return logActivity({ ...workspace, projects, selectedProjectId }, archived ? 'project.archived' : 'project.unarchived', 'project', id, `${archived ? 'archivó' : 'reactivó'} el proyecto ${project.name}`, project.ownerId, now, { archived })
}

export function deleteProject(workspace: Workspace, id: string, now = new Date()): Workspace {
  const project = workspace.projects.find((item) => item.id === id)
  if (!project || workspace.tasks.some((task) => task.projectId === id)) return workspace
  const projects = workspace.projects.filter((item) => item.id !== id)
  const selectedProjectId = workspace.selectedProjectId === id ? projects.find((item) => !item.archived)?.id ?? null : workspace.selectedProjectId
  return logActivity({ ...workspace, projects, selectedProjectId }, 'project.deleted', 'project', id, `eliminó el proyecto ${project.name}`, project.ownerId, now, { projectName: project.name })
}

export function createTask(workspace: Workspace, input: TaskInput, now = new Date()): Workspace {
  if (Object.keys(validateTask(input, workspace)).length) return workspace
  const timestamp = now.toISOString()
  const order = Math.max(-1, ...workspace.tasks.filter((task) => task.projectId === input.projectId && task.status === input.status).map((task) => task.order)) + 1
  const task: Task = { ...input, id: crypto.randomUUID(), title: input.title.trim(), description: input.description.trim(), tag: input.tag.trim(), order, createdAt: timestamp, updatedAt: timestamp, dueState: calculateDueState(input, getLocalDate(now)) }
  const next = logActivity({ ...workspace, tasks: [...workspace.tasks, task] }, 'task.created', 'task', task.id, `creó la tarea ${task.title}`, input.assigneeId || workspace.people[0]?.id || 'sistema', now, { projectId: input.projectId })
  return refreshWorkspace(next, getLocalDate(now))
}

export function updateTask(workspace: Workspace, id: string, input: TaskInput, now = new Date()): Workspace {
  const previous = workspace.tasks.find((task) => task.id === id)
  if (!previous || Object.keys(validateTask(input, workspace)).length) return workspace
  const timestamp = now.toISOString()
  const moved = previous.status !== input.status || previous.projectId !== input.projectId
  const order = moved ? Math.max(-1, ...workspace.tasks.filter((task) => task.id !== id && task.projectId === input.projectId && task.status === input.status).map((task) => task.order)) + 1 : previous.order
  const tasks = workspace.tasks.map((task) => task.id === id ? { ...task, ...input, title: input.title.trim(), description: input.description.trim(), tag: input.tag.trim(), order, updatedAt: timestamp } : task)
  const changedFields = (Object.keys(input) as (keyof TaskInput)[]).filter((key) => previous[key] !== input[key])
  if (!changedFields.length) return workspace
  const next = logActivity({ ...workspace, tasks }, 'task.updated', 'task', id, `actualizó la tarea ${input.title.trim()}`, input.assigneeId || workspace.people[0]?.id || 'sistema', now, { fields: changedFields.join(', '), previousProjectId: previous.projectId, projectId: input.projectId, previousStatus: previous.status, status: input.status })
  return refreshWorkspace(next, getLocalDate(now))
}

export function duplicateTask(workspace: Workspace, id: string, now = new Date()): Workspace {
  const source = workspace.tasks.find((task) => task.id === id)
  if (!source) return workspace
  const timestamp = now.toISOString()
  const task: Task = { ...source, id: crypto.randomUUID(), title: `${source.title} (copia)`, status: 'Pendiente', order: Math.max(-1, ...workspace.tasks.filter((item) => item.projectId === source.projectId && item.status === 'Pendiente').map((item) => item.order)) + 1, createdAt: timestamp, updatedAt: timestamp, dueState: calculateDueState({ status: 'Pendiente', dueDate: source.dueDate }, getLocalDate(now)) }
  const next = logActivity({ ...workspace, tasks: [...workspace.tasks, task] }, 'task.duplicated', 'task', task.id, `duplicó la tarea ${source.title}`, source.assigneeId || workspace.people[0]?.id || 'sistema', now, { sourceTaskId: id, projectId: source.projectId })
  return refreshWorkspace(next, getLocalDate(now))
}

export function deleteTask(workspace: Workspace, id: string, now = new Date()): Workspace {
  const task = workspace.tasks.find((item) => item.id === id)
  if (!task) return workspace
  const next = logActivity({ ...workspace, tasks: workspace.tasks.filter((item) => item.id !== id) }, 'task.deleted', 'task', id, `eliminó la tarea ${task.title}`, task.assigneeId || workspace.people[0]?.id || 'sistema', now, { projectId: task.projectId, taskTitle: task.title })
  return refreshWorkspace(next, getLocalDate(now))
}
