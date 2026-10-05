import { calculateDueState } from '@/lib/workspace'
import type { Project, Task } from '@/types/demo'

export function getProjectMetrics(projects: Project[], tasks: Task[], projectId: string | null, today: string) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId)
  return {
    activeProjects: projects.filter((project) => !project.archived && project.status === 'Activo').length,
    pending: projectTasks.filter((task) => task.status === 'Pendiente').length,
    inProgress: projectTasks.filter((task) => task.status === 'En progreso' || task.status === 'En revisión').length,
    overdue: projectTasks.filter((task) => calculateDueState(task, today) === 'Vencida').length,
    completed: projectTasks.filter((task) => task.status === 'Completada').length,
    total: projectTasks.length,
    progress: projectTasks.length ? Math.round(projectTasks.filter((task) => task.status === 'Completada').length * 100 / projectTasks.length) : 0,
  }
}

export function formatDateMX(date: string | null): string {
  if (!date) return 'Sin fecha'
  const parsed = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00.000Z`) : new Date(date)
  return Number.isNaN(parsed.getTime()) ? 'Fecha inválida' : new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Merida' }).format(parsed)
}

export function formatActivityDateMX(date: string, today: string): string {
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return 'Fecha inválida'
  const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Merida', year: 'numeric', month: '2-digit', day: '2-digit' }).format(parsed)
  const yesterday = new Date(`${today}T12:00:00.000Z`)
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const dayLabel = localDate === today ? 'Hoy' : localDate === yesterday.toISOString().slice(0, 10) ? 'Ayer' : formatDateMX(localDate)
  return `${dayLabel}, ${new Intl.DateTimeFormat('es-MX', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Merida' }).format(parsed)}`
}
