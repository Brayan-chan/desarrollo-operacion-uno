import { refreshWorkspace } from '@/lib/workspace'
import { WORKSPACE_SCHEMA_VERSION, type Activity, type Person, type Project, type ScenarioKey, type Task, type TourState, type Workspace } from '@/types/demo'

export const STORAGE_PREFIX = 'operacion-uno-'
export const ACTIVE_SCENARIO_KEY = `${STORAGE_PREFIX}active-scenario`
export const storageKey = (scenarioKey: ScenarioKey) => `${STORAGE_PREFIX}${scenarioKey}`

export type StorageErrorCode = 'unavailable' | 'quota' | 'corrupt' | 'unsupported-version' | 'write'
export type StorageFailure = { ok: false; code: StorageErrorCode; message: string }
export type StorageSuccess<T> = { ok: true; value: T }
export type StorageResult<T> = StorageSuccess<T> | StorageFailure
export type StorageSnapshot = { entries: Record<string, string> }
export type WorkspaceLoad = { workspace: Workspace; source: 'default' | 'stored' | 'migrated' | 'recovered' }
export type ScenarioStorageInfo = { state: 'saved' | 'example' | 'invalid' | 'unavailable'; projects: number; tasks: number; people: number; activities: number; updatedAt: string | null }

type StorageReader = Pick<Storage, 'getItem'>
type StorageWriter = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'length' | 'key'>

const scenarioKeys: ScenarioKey[] = ['agencia', 'despacho', 'software', 'construccion', 'operacion']
const taskStatuses = ['Pendiente', 'En progreso', 'En revisión', 'Completada']
const priorities = ['Alta', 'Media', 'Baja']
const projectStatuses = ['Planeación', 'Activo', 'En pausa', 'Completado']
const dueStates = ['Sin fecha', 'En tiempo', 'Vence hoy', 'Vencida', 'Completada']
const activityTypes = ['workspace.created', 'task.created', 'task.updated', 'task.status_changed', 'task.reordered', 'task.assigned', 'task.duplicated', 'task.deleted', 'project.created', 'project.updated', 'project.archived', 'project.unarchived', 'project.deleted']
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

function isTourState(value: unknown): value is TourState {
  if (!isRecord(value)) return false
  return typeof value.completed === 'boolean' && typeof value.dismissed === 'boolean' && (value.lastStep === undefined || typeof value.lastStep === 'number')
}

export function isWorkspace(value: unknown): value is Workspace {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && value.version === WORKSPACE_SCHEMA_VERSION && scenarioKeys.includes(value.activeScenario as ScenarioKey) && (value.selectedProjectId === undefined || isStringOrNull(value.selectedProjectId)) && typeof value.createdAt === 'string' && typeof value.updatedAt === 'string' && Array.isArray(value.projects) && value.projects.every(isProject) && Array.isArray(value.tasks) && value.tasks.every(isTask) && Array.isArray(value.people) && value.people.every(isPerson) && Array.isArray(value.activities) && value.activities.every(isActivity) && isTourState(value.tour)
}

type LegacyTask = { id: string; title: string; project: string; assignee: string; status: Task['status']; priority: Task['priority']; due: string; tag: string; description: string }

function isLegacyTask(value: unknown): value is LegacyTask {
  if (!isRecord(value)) return false
  return typeof value.id === 'string' && typeof value.title === 'string' && typeof value.project === 'string' && typeof value.assignee === 'string' && taskStatuses.includes(String(value.status)) && priorities.includes(String(value.priority)) && typeof value.due === 'string' && typeof value.tag === 'string' && typeof value.description === 'string'
}

function migrateLegacyTasks(tasks: LegacyTask[], fallback: Workspace): Workspace {
  const now = new Date().toISOString()
  const migratedTasks: Task[] = tasks.map((task, index) => {
    const project = fallback.projects.find((item) => item.name === task.project) ?? fallback.projects[0]
    const assignee = fallback.people.find((person) => person.name === task.assignee) ?? fallback.people[0]
    return { id: task.id, projectId: project.id, assigneeId: assignee.id, title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.due, tag: task.tag, order: index, createdAt: fallback.createdAt, updatedAt: now, dueState: 'En tiempo' }
  })
  return refreshWorkspace({ ...fallback, updatedAt: now, tasks: migratedTasks })
}

function migrateVersionOne(value: Record<string, unknown>): Workspace | null {
  if (value.version !== 1) return null
  const { selectedScenario, ...rest } = value
  const candidate = { ...rest, version: WORKSPACE_SCHEMA_VERSION, activeScenario: selectedScenario, tour: { completed: false, dismissed: false } }
  return isWorkspace(candidate) ? refreshWorkspace(candidate) : null
}

export function deserializeWorkspace(raw: string, fallback: Workspace): StorageResult<{ workspace: Workspace; migrated: boolean }> {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, code: 'corrupt', message: 'Los datos guardados contienen JSON inválido.' }
  }
  if (isWorkspace(parsed)) return { ok: true, value: { workspace: refreshWorkspace(parsed), migrated: false } }
  if (Array.isArray(parsed) && parsed.every(isLegacyTask)) return { ok: true, value: { workspace: migrateLegacyTasks(parsed, fallback), migrated: true } }
  if (isRecord(parsed) && typeof parsed.version === 'number' && parsed.version > WORKSPACE_SCHEMA_VERSION) return { ok: false, code: 'unsupported-version', message: 'Los datos pertenecen a una versión más reciente de la demo.' }
  if (isRecord(parsed)) {
    const migrated = migrateVersionOne(parsed)
    if (migrated) return { ok: true, value: { workspace: migrated, migrated: true } }
  }
  return { ok: false, code: 'corrupt', message: 'Los datos guardados no tienen un formato válido.' }
}

export function parseStoredWorkspace(raw: string | null, fallback: Workspace): Workspace | null {
  if (raw === null) return null
  const result = deserializeWorkspace(raw, fallback)
  if (!result.ok) throw new Error(result.message)
  return result.value.workspace
}

export function loadWorkspace(storage: StorageReader, scenario: ScenarioKey, fallback: Workspace): StorageResult<WorkspaceLoad> {
  try {
    const raw = storage.getItem(storageKey(scenario))
    if (raw === null) return { ok: true, value: { workspace: refreshWorkspace(fallback), source: 'default' } }
    const parsed = deserializeWorkspace(raw, fallback)
    if (!parsed.ok) return parsed
    return { ok: true, value: { workspace: parsed.value.workspace, source: parsed.value.migrated ? 'migrated' : 'stored' } }
  } catch {
    return { ok: false, code: 'unavailable', message: 'El almacenamiento del navegador no está disponible.' }
  }
}

export function readScenarioStorageInfo(storage: StorageReader, scenario: ScenarioKey, fallback: Workspace): ScenarioStorageInfo {
  try {
    const raw = storage.getItem(storageKey(scenario))
    if (raw === null) return { state: 'example', projects: fallback.projects.length, tasks: fallback.tasks.length, people: fallback.people.length, activities: fallback.activities.length, updatedAt: null }
    const parsed = deserializeWorkspace(raw, fallback)
    if (!parsed.ok) return { state: 'invalid', projects: 0, tasks: 0, people: 0, activities: 0, updatedAt: null }
    const saved = parsed.value.workspace
    return { state: 'saved', projects: saved.projects.length, tasks: saved.tasks.length, people: saved.people.length, activities: saved.activities.length, updatedAt: saved.updatedAt }
  } catch {
    return { state: 'unavailable', projects: 0, tasks: 0, people: 0, activities: 0, updatedAt: null }
  }
}

function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014)
}

export function saveWorkspace(storage: Pick<Storage, 'setItem'>, workspace: Workspace): StorageResult<Workspace> {
  try {
    storage.setItem(storageKey(workspace.activeScenario), JSON.stringify(workspace))
    storage.setItem(ACTIVE_SCENARIO_KEY, workspace.activeScenario)
    return { ok: true, value: workspace }
  } catch (error) {
    if (isQuotaError(error)) return { ok: false, code: 'quota', message: 'El navegador se quedó sin espacio. Borra datos de la demo e inténtalo nuevamente.' }
    return { ok: false, code: 'write', message: 'No pudimos guardar los cambios en este navegador.' }
  }
}

export function removeScenario(storage: Pick<Storage, 'removeItem'>, scenario: ScenarioKey): StorageResult<null> {
  try { storage.removeItem(storageKey(scenario)); return { ok: true, value: null } } catch { return { ok: false, code: 'write', message: 'No pudimos restaurar este escenario.' } }
}

export function createStorageSnapshot(storage: StorageWriter): StorageResult<StorageSnapshot> {
  try {
    const entries: Record<string, string> = {}
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index)
      if (key?.startsWith(STORAGE_PREFIX)) {
        const value = storage.getItem(key)
        if (value !== null) entries[key] = value
      }
    }
    return { ok: true, value: { entries } }
  } catch { return { ok: false, code: 'unavailable', message: 'No pudimos leer los datos locales.' } }
}

export function clearAllDemoData(storage: StorageWriter): StorageResult<null> {
  const snapshot = createStorageSnapshot(storage)
  if (!snapshot.ok) return snapshot
  try {
    Object.keys(snapshot.value.entries).forEach((key) => storage.removeItem(key))
    return { ok: true, value: null }
  } catch {
    try { Object.entries(snapshot.value.entries).forEach(([key, value]) => storage.setItem(key, value)) } catch { /* The caller receives the failure and can retry. */ }
    return { ok: false, code: 'write', message: 'No pudimos borrar todos los datos locales.' }
  }
}

export function restoreStorageSnapshot(storage: StorageWriter, snapshot: StorageSnapshot): StorageResult<null> {
  const previous = createStorageSnapshot(storage)
  if (!previous.ok) return previous
  const cleared = clearAllDemoData(storage)
  if (!cleared.ok) return cleared
  try {
    Object.entries(snapshot.entries).forEach(([key, value]) => storage.setItem(key, value))
    return { ok: true, value: null }
  } catch (error) {
    try {
      Object.keys(snapshot.entries).forEach((key) => storage.removeItem(key))
      Object.entries(previous.value.entries).forEach(([key, value]) => storage.setItem(key, value))
    } catch { /* Retain the error state for the caller. */ }
    if (isQuotaError(error)) return { ok: false, code: 'quota', message: 'No hay espacio suficiente para recuperar los datos.' }
    return { ok: false, code: 'write', message: 'No pudimos recuperar los datos eliminados.' }
  }
}

export function readActiveScenario(storage: StorageReader): ScenarioKey {
  try {
    const value = storage.getItem(ACTIVE_SCENARIO_KEY)
    return scenarioKeys.includes(value as ScenarioKey) ? value as ScenarioKey : 'agencia'
  } catch { return 'agencia' }
}
