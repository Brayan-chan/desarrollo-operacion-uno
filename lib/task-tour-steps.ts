import type { DriveStep } from 'driver.js'

export const taskTourSteps: DriveStep[] = [
  { element: '[data-tour="task-form"]', waitForElement: 1200, popover: { title: 'Crea una tarea', description: 'Abrimos el formulario del proyecto actual. La tarea quedará guardada en este navegador.' } },
  { element: '[data-tour="task-title"]', popover: { title: 'Describe el trabajo', description: 'Escribe un título claro. Es necesario para continuar.' } },
  { element: '[data-tour="task-assignee"]', popover: { title: 'Asigna un responsable', description: 'Elige una persona activa para esta práctica.' } },
  { element: '[data-tour="task-due-date"]', popover: { title: 'Establece una fecha', description: 'Selecciona una fecha límite. En el uso normal, las tareas también pueden quedar sin fecha.' } },
  { element: '[data-tour="task-priority"]', popover: { title: 'Elige la prioridad', description: 'Selecciona Baja, Media o Alta según la urgencia.' } },
  { element: '[data-tour="task-save"]', popover: { title: 'Guarda la tarea', description: 'Pulsa “Crear tarea” o “Siguiente”. La guía esperará a que se guarde correctamente.' } },
  { element: '[data-tour="task-drawer"]', waitForElement: 1200, popover: { title: 'Tarea creada', description: 'La tarea ya aparece en el tablero. Desde este panel puedes revisar sus datos y cambiar su estado.', disableButtons: ['previous'] } },
  { element: '[data-tour="task-drawer"] select', popover: { title: 'Muévela a En progreso', description: 'Cambia el estado a “En progreso”. También podrías arrastrar la tarjeta en el tablero; aquí usamos el selector accesible.', disableButtons: ['previous'] } },
  { element: '[data-tour="task-drawer"] select', popover: { title: 'Márcala como Completada', description: 'Ahora cambia el estado a “Completada”. El progreso se actualizará inmediatamente.', disableButtons: ['previous'] } },
  { element: '[data-tour="metrics"]', waitForElement: 1200, popover: { title: 'Métricas actualizadas', description: 'Observa las tareas pendientes, en curso y el progreso del proyecto. Se calculan con las tareas reales y se conservan al recargar.', disableButtons: ['previous'] } },
]

export type GuidedTaskFields = { title: string; assigneeId: string; dueDate: string; priority: string }

export function canAdvanceTaskTour(step: number, fields: GuidedTaskFields): boolean {
  if (step === 1) return Boolean(fields.title.trim())
  if (step === 2) return Boolean(fields.assigneeId)
  if (step === 3) return /^\d{4}-\d{2}-\d{2}$/.test(fields.dueDate)
  if (step === 4) return ['Baja', 'Media', 'Alta'].includes(fields.priority)
  if (step === 5) return Boolean(fields.title.trim() && fields.assigneeId && /^\d{4}-\d{2}-\d{2}$/.test(fields.dueDate) && ['Baja', 'Media', 'Alta'].includes(fields.priority))
  return true
}
