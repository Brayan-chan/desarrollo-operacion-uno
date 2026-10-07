import type { DriveStep } from 'driver.js'

export const projectTourSteps: DriveStep[] = [
  { element: '[data-tour="project-form"]', waitForElement: 1200, popover: { title: 'Crea tu proyecto', description: 'Abrimos el formulario por ti. Puedes añadir descripción y cliente, pero para guardar bastan nombre, responsable y fechas válidas.' } },
  { element: '[data-tour="project-name"]', popover: { title: 'Ponle un nombre', description: 'Escribe un nombre que tu equipo reconozca. Este campo es obligatorio.' } },
  { element: '[data-tour="project-owner"]', popover: { title: 'Asigna un responsable', description: 'Elige quién coordina este proyecto. Solo se muestran personas activas.' } },
  { element: '[data-tour="project-fields"]', popover: { title: 'Define las fechas', description: 'Confirma el inicio y fija la entrega. La entrega no puede ser anterior al inicio.' } },
  { element: '[data-tour="project-save"]', popover: { title: 'Guarda el proyecto', description: 'Pulsa “Crear proyecto” o “Siguiente”. Si falta algún dato, verás el error junto al campo y la guía no avanzará.' } },
  { element: '[data-tour="project-selector"]', waitForElement: 1200, popover: { title: 'Proyecto creado', description: 'Tu proyecto ya está seleccionado. El tablero, las métricas y las tareas se enfocan en él.', disableButtons: ['previous'] } },
  { element: '[aria-label="Gestión de proyectos"] button', popover: { title: 'Crea la primera tarea', description: 'Tu proyecto está listo. Pulsa “Nueva tarea” si quieres agregar su primer entregable, o termina esta guía para hacerlo después.', disableButtons: ['previous'] } },
]

export type GuidedProjectFields = { name: string; ownerId: string; startDate: string; dueDate: string }

export function canAdvanceProjectTour(step: number, fields: GuidedProjectFields): boolean {
  if (step === 1) return Boolean(fields.name.trim())
  if (step === 2) return Boolean(fields.ownerId)
  if (step === 3 || step === 4) return Boolean(fields.name.trim() && fields.ownerId && fields.startDate && fields.dueDate && fields.dueDate >= fields.startDate)
  return true
}
