import type { DriveStep } from 'driver.js'

export function createDemoTourSteps(isMobile = false): DriveStep[] { return [
  { popover: { title: 'Bienvenido a Operación Uno', description: 'Esta es una demo funcional. Puedes probarla libremente: los cambios se guardan solo en este navegador.' } },
  { element: '[data-tour="scenario-selector"]', waitForElement: 1200, popover: { title: 'Elige tu industria', description: isMobile ? 'Toca el botón de escenarios en la parte superior. Se abrirá el centro de demo para elegir una industria.' : 'Abre este selector para probar un escenario distinto. Cada uno conserva sus propios proyectos y tareas.', side: isMobile ? 'bottom' : 'left' } },
  { element: '[data-tour="metrics"]', popover: { title: 'Métricas reales', description: 'Estos números se calculan a partir de los proyectos y tareas que ves. Cambian cuando editas o mueves tareas.' } },
  { element: '[data-tour="project-selector"]', skipMissingElement: true, popover: { title: 'Cambia de proyecto', description: 'Selecciona otro proyecto para ver cómo cambian su tablero y sus métricas.' } },
  { element: '[data-tour="board"]', skipMissingElement: true, popover: { title: 'Tablero Kanban', description: isMobile ? 'Desliza el tablero horizontalmente para ver todas las columnas y toca una tarjeta para abrirla.' : 'Cada columna representa un estado. Puedes abrir tarjetas, arrastrarlas o moverlas con el teclado.', side: isMobile ? 'top' : 'bottom' } },
  { element: '[data-tour="sample-task"]', skipMissingElement: true, popover: { title: 'Abre una tarea', description: 'Toca esta tarjeta para abrir sus detalles. La guía continuará cuando se abra el panel.' } },
  { element: '[data-tour="task-drawer"]', waitForElement: 1500, skipMissingElement: true, popover: { title: 'Edita el trabajo', description: 'Pulsa Editar y cambia el responsable o la fecha. Guarda los cambios para continuar.' } },
  { element: '[data-tour="task-drawer"] select', waitForElement: 1500, skipMissingElement: true, popover: { title: 'Cambia su estado', description: 'Usa Estado para mover esta tarea a otra columna. La guía esperará a que el cambio se guarde.' } },
  { element: '[data-tour="progress"]', popover: { title: 'Progreso actualizado', description: 'El porcentaje refleja las tareas completadas de este proyecto entre todas sus tareas. Si no hay tareas, muestra 0%.' } },
  { element: '[data-tour="persistence"]', popover: { title: 'Guardado local', description: 'Tus cambios quedan en este navegador. Puedes recargar la página y continuar, restaurar un escenario o borrar todos los datos.' } },
  { popover: { title: 'Ahora te toca explorar', description: 'Crea un proyecto, cambia de escenario o prueba el tablero. Puedes repetir esta guía cuando quieras con “Ver recorrido”.' } },
] }

export const demoTourSteps = createDemoTourSteps()
