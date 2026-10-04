import type { ScenarioKey, Task } from '@/types/demo'

export const storageKey = (scenarioKey: ScenarioKey) => `operacion-uno-${scenarioKey}`

export function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Partial<Task>
  return typeof task.id === 'string'
    && typeof task.title === 'string'
    && typeof task.project === 'string'
    && typeof task.assignee === 'string'
    && ['Pendiente', 'En progreso', 'En revisión', 'Completada'].includes(task.status ?? '')
    && ['Alta', 'Media', 'Baja'].includes(task.priority ?? '')
    && typeof task.due === 'string'
    && typeof task.tag === 'string'
    && typeof task.description === 'string'
}

export function parseStoredTasks(raw: string | null): Task[] | null {
  if (raw === null) return null
  const parsed: unknown = JSON.parse(raw)
  if (!Array.isArray(parsed) || !parsed.every(isTask)) {
    throw new Error('Los datos guardados no tienen un formato válido.')
  }
  return parsed
}
