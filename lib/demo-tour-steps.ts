import type { DriveStep } from 'driver.js'

export const demoTourSteps: DriveStep[] = [
  { popover: { title: 'Bienvenido a Operación Uno', description: 'Esta es una demo funcional. Puedes probarla libremente: los cambios se guardan solo en este navegador.' } },
  { element: '[data-tour="scenario-selector"]', popover: { title: 'Elige tu industria', description: 'Abre este selector para probar un escenario distinto. Cada uno conserva sus propios proyectos y tareas.' } },
  { element: '[data-tour="metrics"]', popover: { title: 'Métricas reales', description: 'Estos números se calculan a partir de los proyectos y tareas que ves. Cambian cuando editas o mueves tareas.' } },
  { element: '[data-tour="project-selector"]', popover: { title: 'Cambia de proyecto', description: 'Selecciona qué proyecto quieres revisar. El tablero y las métricas mostrarán sus tareas.' } },
  { element: '[data-tour="board"]', popover: { title: 'Tablero Kanban', description: 'Cada columna representa un estado. Puedes crear tareas, abrirlas y moverlas entre columnas.' } },
  { element: '[data-tour="sample-task"]', skipMissingElement: false, popover: { title: 'Abre una tarea', description: 'Haz clic en esta tarjeta para ver sus detalles. También puedes pulsar Siguiente y la abriremos por ti.' } },
  { element: '[data-tour="task-drawer"]', waitForElement: 1200, popover: { title: 'Edita el trabajo', description: 'Aquí puedes revisar la tarea. Pulsa Editar para cambiar responsable o fecha límite; el recorrido se reanudará al guardar o cancelar.' } },
  { element: '[data-tour="task-drawer"]', waitForElement: 1200, popover: { title: 'Cambia su estado', description: 'Prueba el selector Estado para moverla. Fuera del recorrido también puedes arrastrar tarjetas o usar el teclado.' } },
  { element: '[data-tour="progress"]', popover: { title: 'Progreso actualizado', description: 'El porcentaje refleja las tareas completadas de este proyecto entre todas sus tareas. Si no hay tareas, muestra 0%.' } },
  { element: '[data-tour="persistence"]', popover: { title: 'Guardado local', description: 'Tus cambios quedan en este navegador. Puedes recargar la página y continuar, restaurar un escenario o borrar todos los datos.' } },
  { popover: { title: 'Ahora te toca explorar', description: 'Crea un proyecto, cambia de escenario o prueba el tablero. Puedes repetir esta guía cuando quieras con “Ver recorrido”.' } },
]
