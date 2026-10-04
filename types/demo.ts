export const WORKSPACE_SCHEMA_VERSION = 1 as const

export type ScenarioKey = 'agencia' | 'despacho' | 'software' | 'construccion' | 'operacion'
export type TaskStatus = 'Pendiente' | 'En progreso' | 'En revisión' | 'Completada'
export type ProjectStatus = 'Planeación' | 'Activo' | 'En pausa' | 'Completado'
export type Priority = 'Alta' | 'Media' | 'Baja'
export type DueState = 'Sin fecha' | 'En tiempo' | 'Vence hoy' | 'Vencida' | 'Completada'
export type ActivityType = 'workspace.created' | 'task.created' | 'task.status_changed' | 'task.assigned' | 'project.created'
export type EntityType = 'workspace' | 'project' | 'task' | 'person'
export type ActivityMetadata = Record<string, string | number | boolean | null>

export type Person = { id: string; name: string; role: string; initials: string; color: string; avatarUrl: string | null; active: boolean }
export type Project = { id: string; name: string; description: string; client: string | null; status: ProjectStatus; startDate: string; dueDate: string; ownerId: string; color: string; progress: number; archived: boolean }
export type Task = { id: string; projectId: string; title: string; description: string; status: TaskStatus; priority: Priority; assigneeId: string; dueDate: string | null; tag: string; order: number; createdAt: string; updatedAt: string; dueState: DueState }
export type Activity = { id: string; type: ActivityType; entityType: EntityType; entityId: string; actorId: string; description: string; createdAt: string; metadata: ActivityMetadata }

export type Workspace = {
  id: string
  version: typeof WORKSPACE_SCHEMA_VERSION
  selectedScenario: ScenarioKey
  createdAt: string
  updatedAt: string
  projects: Project[]
  tasks: Task[]
  people: Person[]
  activities: Activity[]
}

export type Scenario = { label: string; description: string; workspace: Workspace }
export type Status = TaskStatus
