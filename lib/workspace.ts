import type { DueState, Project, Task, TaskStatus, Workspace } from '@/types/demo'

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
  const tasks = workspace.tasks.map((item) => item.id === taskId ? { ...item, status, updatedAt: timestamp } : item)
  return refreshWorkspace({
    ...workspace,
    updatedAt: timestamp,
    tasks,
    activities: [{ id: `activity-${taskId}-${now.getTime()}`, type: 'task.status_changed', entityType: 'task', entityId: taskId, actorId: actor.id, description: `movió ${task.title} a ${status.toLocaleLowerCase('es-MX')}`, createdAt: timestamp, metadata: { previousStatus: task.status, nextStatus: status } }, ...workspace.activities],
  }, getLocalDate(now))
}
