import { refreshWorkspace } from '@/lib/workspace'
import { WORKSPACE_SCHEMA_VERSION, type Activity, type Person, type Project, type ScenarioKey, type Task, type Workspace } from '@/types/demo'

export const ACTIVE_SCENARIO_KEY = 'operacion-uno-active-scenario'
export const storageKey = (scenarioKey: ScenarioKey) => `operacion-uno-${scenarioKey}`

const scenarioKeys: ScenarioKey[] = ['agencia', 'despacho', 'software', 'construccion', 'operacion']
const taskStatuses = ['Pendiente', 'En progreso', 'En revisión', 'Completada']
const priorities = ['Alta', 'Media', 'Baja']
const projectStatuses = ['Planeación', 'Activo', 'En pausa', 'Completado']
const dueStates = ['Sin fecha', 'En tiempo', 'Vence hoy', 'Vencida', 'Completada']
const activityTypes = ['workspace.created', 'task.created', 'task.status_changed', 'task.assigned', 'project.created']
const entityTypes = ['workspace', 'project', 'task', 'person']

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object'
const isStringOrNull = (value: unknown): value is string | null => typeof value === 'string' || value === null

export function isPerson(value: unknown): value is Person {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.name === 'string' && typeof value.role === 'string' && typeof value.initials === 'string' && typeof value.color === 'string' && isStringOrNull(value.avatarUrl) && typeof value.active === 'boolean'
}

export function isProject(value: unknown): value is Project {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.name === 'string' && typeof value.description === 'string' && isStringOrNull(value.client) && projectStatuses.includes(String(value.status)) && typeof value.startDate === 'string' && typeof value.dueDate === 'string' && typeof value.ownerId === 'string' && typeof value.color === 'string' && typeof value.progress === 'number' && typeof value.archived === 'boolean'
}

export function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.projectId === 'string' && typeof value.title === 'string' && typeof value.description === 'string' && taskStatuses.includes(String(value.status)) && priorities.includes(String(value.priority)) && typeof value.assigneeId === 'string' && isStringOrNull(value.dueDate) && typeof value.tag === 'string' && typeof value.order === 'number' && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string' && dueStates.includes(String(value.dueState))
}

export function isActivity(value: unknown): value is Activity {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && activityTypes.includes(String(value.type)) && entityTypes.includes(String(value.entityType)) && typeof value.entityId === 'string' && typeof value.actorId === 'string' && typeof value.description === 'string' && typeof value.createdAt === 'string' && isRecord(value.metadata)
}

export function isWorkspace(value: unknown): value is Workspace {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.version === WORKSPACE_SCHEMA_VERSION && scenarioKeys.includes(value.selectedScenario as ScenarioKey) && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string' && Array.isArray(value.projects) && value.projects.every(isProject) && Array.isArray(value.tasks) && value.tasks.every(isTask) && Array.isArray(value.people) && value.people.every(isPerson) && Array.isArray(value.activities) && value.activities.every(isActivity)
}

type LegacyTask = { id: string; title: string; project: string; assignee: string; status: Task['status']; priority: Task['priority']; due: string; tag: string; description: string }

function isLegacyTask(value: unknown): value is LegacyTask {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.title === 'string' && typeof value.project === 'string' && typeof value.assignee === 'string' && taskStatuses.includes(String(value.status)) && priorities.includes(String(value.priority)) && typeof value.due === 'string' && typeof value.tag === 'string' && typeof value.description === 'string'
}

export function migrateLegacyTasks(tasks: LegacyTask[], fallback: Workspace): Workspace {
  const now = new Date().toISOString()
  const migratedTasks: Task[] = tasks.map((task, index) => {
    const project = fallback.projects.find((item) => item.name === task.project) ?? fallback.projects[0]
    const assignee = fallback.people.find((person) => person.name === task.assignee) ?? fallback.people[0]
    return { id: task.id, projectId: project.id, assigneeId: assignee.id, title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.due, tag: task.tag, order: index, createdAt: fallback.createdAt, updatedAt: now, dueState: 'En tiempo' }
  })
  return refreshWorkspace({ ...fallback, updatedAt: now, tasks: migratedTasks })
}

export function parseStoredWorkspace(raw: string | null, fallback: Workspace): Workspace | null {
  if (raw === null) return null
  const parsed: unknown = JSON.parse(raw)
  if (isWorkspace(parsed)) return refreshWorkspace(parsed)
  if (Array.isArray(parsed) && parsed.every(isLegacyTask)) return migrateLegacyTasks(parsed, fallback)
  throw new Error('Los datos guardados no tienen un formato válido.')
}

export function readActiveScenario(storage: Pick<Storage, 'getItem'>): ScenarioKey {
  const value = storage.getItem(ACTIVE_SCENARIO_KEY)
  return scenarioKeys.includes(value as ScenarioKey) ? value as ScenarioKey : 'agencia'
}
