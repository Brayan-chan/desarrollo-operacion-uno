import type { Person, Scenario, ScenarioKey, Task } from '@/types/demo'

export const people: Person[] = [
  { id: 'ana', name: 'Ana Torres', role: 'Dirección de proyectos', initials: 'AT', color: 'bg-[#f4b6c2]' },
  { id: 'carlos', name: 'Carlos Ruiz', role: 'Diseño y estrategia', initials: 'CR', color: 'bg-[#c4b5fd]' },
  { id: 'lucia', name: 'Lucía Méndez', role: 'Operaciones', initials: 'LM', color: 'bg-[#f2d399]' },
  { id: 'diego', name: 'Diego Soto', role: 'Desarrollo', initials: 'DS', color: 'bg-[#9cc7b4]' },
]

export const baseTasks: Task[] = [
  { id: 't1', title: 'Validar alcance y objetivos', project: 'Lanzamiento web corporativo', assignee: 'Ana Torres', status: 'Completada', priority: 'Alta', due: '2026-10-02', tag: 'Aprobación', description: 'Alinear objetivos, entregables y responsables con el cliente.' },
  { id: 't2', title: 'Mapa de contenidos', project: 'Lanzamiento web corporativo', assignee: 'Carlos Ruiz', status: 'En progreso', priority: 'Media', due: '2026-10-07', tag: 'Contenido', description: 'Definir la estructura de contenidos para las páginas principales.' },
  { id: 't3', title: 'Propuesta de dirección visual', project: 'Lanzamiento web corporativo', assignee: 'Carlos Ruiz', status: 'En revisión', priority: 'Alta', due: '2026-10-09', tag: 'Diseño', description: 'Presentar rutas visuales y recibir aprobación interna.' },
  { id: 't4', title: 'Preparar entorno de desarrollo', project: 'Lanzamiento web corporativo', assignee: 'Diego Soto', status: 'Pendiente', priority: 'Baja', due: '2026-10-12', tag: 'Desarrollo', description: 'Configurar repositorio, ambientes y convenciones técnicas.' },
  { id: 't5', title: 'Revisión con cliente', project: 'Lanzamiento web corporativo', assignee: 'Ana Torres', status: 'Pendiente', priority: 'Alta', due: '2026-10-14', tag: 'Cliente', description: 'Revisar avance y registrar decisiones de la sesión.' },
  { id: 't6', title: 'Checklist de publicación', project: 'Lanzamiento web corporativo', assignee: 'Lucía Méndez', status: 'Pendiente', priority: 'Media', due: '2026-10-20', tag: 'Entrega', description: 'Confirmar analítica, dominios, contenidos y QA final.' },
]

const adaptTasks = (project: string, titles: string[], tags?: string[]) =>
  baseTasks.map((task, index) => ({
    ...task,
    project,
    title: titles[index],
    tag: tags?.[index] ?? task.tag,
  }))

export const scenarios: Record<ScenarioKey, Scenario> = {
  agencia: {
    label: 'Agencia',
    description: 'Un flujo de lanzamiento donde conviven estrategia, diseño, contenido, desarrollo y aprobación del cliente.',
    projects: ['Lanzamiento web corporativo', 'Campaña de temporada'],
    people,
    tasks: baseTasks,
  },
  despacho: {
    label: 'Despacho profesional',
    description: 'Seguimiento de un servicio para cliente con recopilación, análisis, revisión y entrega documental.',
    projects: ['Implementación de servicio para cliente'],
    people,
    tasks: adaptTasks('Implementación de servicio para cliente', ['Recopilar información inicial', 'Analizar documentación', 'Elaborar informe ejecutivo', 'Revisión de calidad', 'Aprobación del cliente', 'Entrega de expediente'], ['Entrada', 'Análisis', 'Documento', 'Revisión', 'Aprobación', 'Entrega']),
  },
  software: {
    label: 'Desarrollo de software',
    description: 'Un flujo de producto que conecta requerimientos, UX/UI, desarrollo, QA, correcciones y lanzamiento.',
    projects: ['Aplicación móvil'],
    people,
    tasks: adaptTasks('Aplicación móvil', ['Levantar requerimientos', 'Diseñar experiencia UX/UI', 'Construir funcionalidad principal', 'Ejecutar pruebas QA', 'Resolver correcciones', 'Preparar lanzamiento'], ['Requerimientos', 'UX/UI', 'Desarrollo', 'QA', 'Correcciones', 'Lanzamiento']),
  },
  construccion: {
    label: 'Construcción / remodelación',
    description: 'Control de una remodelación con presupuesto, compras, preparación, instalación, inspección y entrega.',
    projects: ['Remodelación de oficina'],
    people,
    tasks: adaptTasks('Remodelación de oficina', ['Aprobar presupuesto', 'Comprar materiales', 'Preparar área de trabajo', 'Ejecutar instalación', 'Inspección de avance', 'Entrega de espacio'], ['Presupuesto', 'Compras', 'Preparación', 'Instalación', 'Inspección', 'Entrega']),
  },
  operacion: {
    label: 'Operación general',
    description: 'Un escenario neutral para mostrar cómo el sistema puede adaptarse a cualquier operación por proyectos.',
    projects: ['Operación interna trimestral'],
    people,
    tasks: adaptTasks('Operación interna trimestral', ['Definir prioridades', 'Organizar recursos', 'Ejecutar plan de trabajo', 'Revisar avance', 'Ajustar responsables', 'Cerrar periodo']),
  },
}
