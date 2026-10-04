export type Status = 'Pendiente' | 'En progreso' | 'En revisión' | 'Completada'

export type ScenarioKey =
  | 'agencia'
  | 'despacho'
  | 'software'
  | 'construccion'
  | 'operacion'

export type Person = {
  id: string
  name: string
  role: string
  initials: string
  color: string
}

export type Task = {
  id: string
  title: string
  project: string
  assignee: string
  status: Status
  priority: 'Alta' | 'Media' | 'Baja'
  due: string
  tag: string
  description: string
}

export type Scenario = {
  label: string
  description: string
  projects: string[]
  people: Person[]
  tasks: Task[]
}
