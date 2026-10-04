import { refreshWorkspace } from '@/lib/workspace'
import { WORKSPACE_SCHEMA_VERSION, type Person, type Scenario, type ScenarioKey, type Task, type Workspace } from '@/types/demo'

const CREATED_AT = '2026-09-15T15:00:00.000Z'
const UPDATED_AT = '2026-10-04T14:00:00.000Z'

export const people: Person[] = [
  { id: 'ana', name: 'Ana Torres', role: 'Dirección de proyectos', initials: 'AT', color: 'bg-[#f4b6c2]', avatarUrl: null, active: true },
  { id: 'carlos', name: 'Carlos Ruiz', role: 'Diseño y estrategia', initials: 'CR', color: 'bg-[#c4b5fd]', avatarUrl: null, active: true },
  { id: 'lucia', name: 'Lucía Méndez', role: 'Operaciones', initials: 'LM', color: 'bg-[#f2d399]', avatarUrl: null, active: true },
  { id: 'diego', name: 'Diego Soto', role: 'Desarrollo', initials: 'DS', color: 'bg-[#9cc7b4]', avatarUrl: null, active: true },
]

const taskSeed: Omit<Task, 'projectId' | 'title' | 'tag'>[] = [
  { id: 't1', assigneeId: 'ana', status: 'Completada', priority: 'Alta', dueDate: '2026-10-02', description: 'Alinear objetivos, entregables y responsables con el cliente.', order: 0, createdAt: CREATED_AT, updatedAt: '2026-10-02T16:00:00.000Z', dueState: 'Completada' },
  { id: 't2', assigneeId: 'carlos', status: 'En progreso', priority: 'Media', dueDate: '2026-10-07', description: 'Definir la estructura de contenidos para las páginas principales.', order: 0, createdAt: CREATED_AT, updatedAt: '2026-10-04T12:00:00.000Z', dueState: 'En tiempo' },
  { id: 't3', assigneeId: 'carlos', status: 'En revisión', priority: 'Alta', dueDate: '2026-10-09', description: 'Presentar rutas visuales y recibir aprobación interna.', order: 0, createdAt: CREATED_AT, updatedAt: '2026-10-04T10:00:00.000Z', dueState: 'En tiempo' },
  { id: 't4', assigneeId: 'diego', status: 'Pendiente', priority: 'Baja', dueDate: '2026-10-12', description: 'Configurar repositorio, ambientes y convenciones técnicas.', order: 0, createdAt: CREATED_AT, updatedAt: CREATED_AT, dueState: 'En tiempo' },
  { id: 't5', assigneeId: 'ana', status: 'Pendiente', priority: 'Alta', dueDate: '2026-10-14', description: 'Revisar avance y registrar decisiones de la sesión.', order: 1, createdAt: CREATED_AT, updatedAt: CREATED_AT, dueState: 'En tiempo' },
  { id: 't6', assigneeId: 'lucia', status: 'Pendiente', priority: 'Media', dueDate: '2026-10-20', description: 'Confirmar analítica, dominios, contenidos y QA final.', order: 2, createdAt: CREATED_AT, updatedAt: CREATED_AT, dueState: 'En tiempo' },
]

const createTasks = (projectId: string, titles: string[], tags: string[]) => taskSeed.map((task, index) => ({ ...task, projectId, title: titles[index], tag: tags[index] }))

function createWorkspace(scenario: ScenarioKey, projectName: string, client: string | null, titles: string[], tags: string[], secondaryProject?: string): Workspace {
  const projectId = `${scenario}-principal`
  const workspace: Workspace = {
    id: `workspace-${scenario}`,
    version: WORKSPACE_SCHEMA_VERSION,
    selectedScenario: scenario,
    createdAt: CREATED_AT,
    updatedAt: UPDATED_AT,
    people: people.map((person) => ({ ...person })),
    projects: [
      { id: projectId, name: projectName, description: `Proyecto demostrativo para el escenario ${scenario}.`, client, status: 'Activo', startDate: '2026-09-15', dueDate: '2026-10-31', ownerId: 'ana', color: '#8d72c9', progress: 0, archived: false },
      ...(secondaryProject ? [{ id: `${scenario}-secundario`, name: secondaryProject, description: 'Proyecto adicional para demostrar una operación con múltiples iniciativas.', client: 'Cliente secundario', status: 'Planeación' as const, startDate: '2026-10-01', dueDate: '2026-11-15', ownerId: 'lucia', color: '#59a77d', progress: 0, archived: false }] : []),
    ],
    tasks: createTasks(projectId, titles, tags),
    activities: [
      { id: `${scenario}-activity-1`, type: 'task.status_changed', entityType: 'task', entityId: 't1', actorId: 'ana', description: `completó ${titles[0]}`, createdAt: '2026-10-04T12:00:00.000Z', metadata: { previousStatus: 'En revisión', nextStatus: 'Completada' } },
      { id: `${scenario}-activity-2`, type: 'task.status_changed', entityType: 'task', entityId: 't3', actorId: 'carlos', description: `movió ${titles[2]} a revisión`, createdAt: '2026-10-04T10:00:00.000Z', metadata: { previousStatus: 'En progreso', nextStatus: 'En revisión' } },
      { id: `${scenario}-activity-3`, type: 'task.assigned', entityType: 'task', entityId: 't6', actorId: 'lucia', description: `fue asignada a ${titles[5]}`, createdAt: '2026-10-03T16:00:00.000Z', metadata: { assigneeId: 'lucia' } },
    ],
  }
  return refreshWorkspace(workspace, '2026-10-04')
}

export const scenarios: Record<ScenarioKey, Scenario> = {
  agencia: { label: 'Agencia', description: 'Un flujo de lanzamiento donde conviven estrategia, diseño, contenido, desarrollo y aprobación del cliente.', workspace: createWorkspace('agencia', 'Lanzamiento web corporativo', 'Grupo Horizonte', ['Validar alcance y objetivos', 'Mapa de contenidos', 'Propuesta de dirección visual', 'Preparar entorno de desarrollo', 'Revisión con cliente', 'Checklist de publicación'], ['Aprobación', 'Contenido', 'Diseño', 'Desarrollo', 'Cliente', 'Entrega'], 'Campaña de temporada') },
  despacho: { label: 'Despacho profesional', description: 'Seguimiento de un servicio para cliente con recopilación, análisis, revisión y entrega documental.', workspace: createWorkspace('despacho', 'Implementación de servicio para cliente', 'Corporativo del Sureste', ['Recopilar información inicial', 'Analizar documentación', 'Elaborar informe ejecutivo', 'Revisión de calidad', 'Aprobación del cliente', 'Entrega de expediente'], ['Entrada', 'Análisis', 'Documento', 'Revisión', 'Aprobación', 'Entrega']) },
  software: { label: 'Desarrollo de software', description: 'Un flujo de producto que conecta requerimientos, UX/UI, desarrollo, QA, correcciones y lanzamiento.', workspace: createWorkspace('software', 'Aplicación móvil', 'Nébula Labs', ['Levantar requerimientos', 'Diseñar experiencia UX/UI', 'Construir funcionalidad principal', 'Ejecutar pruebas QA', 'Resolver correcciones', 'Preparar lanzamiento'], ['Requerimientos', 'UX/UI', 'Desarrollo', 'QA', 'Correcciones', 'Lanzamiento']) },
  construccion: { label: 'Construcción / remodelación', description: 'Control de una remodelación con presupuesto, compras, preparación, instalación, inspección y entrega.', workspace: createWorkspace('construccion', 'Remodelación de oficina', 'Estudio Central', ['Aprobar presupuesto', 'Comprar materiales', 'Preparar área de trabajo', 'Ejecutar instalación', 'Inspección de avance', 'Entrega de espacio'], ['Presupuesto', 'Compras', 'Preparación', 'Instalación', 'Inspección', 'Entrega']) },
  operacion: { label: 'Operación general', description: 'Un escenario neutral para mostrar cómo el sistema puede adaptarse a cualquier operación por proyectos.', workspace: createWorkspace('operacion', 'Operación interna trimestral', null, ['Definir prioridades', 'Organizar recursos', 'Ejecutar plan de trabajo', 'Revisar avance', 'Ajustar responsables', 'Cerrar periodo'], ['Planeación', 'Recursos', 'Ejecución', 'Revisión', 'Equipo', 'Cierre']) },
}

export const baseTasks = scenarios.agencia.workspace.tasks
