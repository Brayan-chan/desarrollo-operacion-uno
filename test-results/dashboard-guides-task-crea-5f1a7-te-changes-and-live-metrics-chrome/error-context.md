# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: dashboard.spec.ts >> guides task creation, state changes and live metrics
- Location: tests/e2e/dashboard.spec.ts:219:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.driver-popover').getByText('Márcala como Completada')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.driver-popover').getByText('Márcala como Completada') with timeout 5000ms
  - waiting for locator('.driver-popover').getByText('Márcala como Completada')

```

```yaml
- main:
  - complementary:
    - navigation "Navegación principal":
      - button "Inicio"
      - button "Proyectos"
      - button "Tareas"
      - button "Calendario"
      - button "Equipo"
      - button "Reportes"
    - button "Configuración"
  - paragraph: Operación Uno
  - heading "Inicio" [level=1]
  - button "Agencia"
  - button "Ver recorrido"
  - 'button "Notificaciones: 1 pendientes"'
  - button "Perfil de Ana Torres"
  - paragraph: martes, 6 de octubre de 2026
  - heading "Vista general" [level=2]
  - paragraph: Una lectura rápida de lo que está pasando y de lo que necesita atención.
  - button "Nuevo proyecto"
  - button "Crear proyecto con guía"
  - button "Crear tarea con guía"
  - text: Guardado en este navegador
  - status: Cambio guardado en este navegador.
  - region "Gestión de proyectos":
    - text: Proyecto actual
    - combobox "Proyecto actual":
      - option "Seleccionar proyecto" [disabled]
      - option "Lanzamiento web corporativo" [selected]
      - option "Campaña de temporada"
    - button "Nueva tarea"
    - button "Proyecto"
    - button "Editar proyecto"
    - button "Archivar proyecto"
    - button "Eliminar proyecto"
    - paragraph: Activo · 14% completado · Entrega 1 de noviembre de 2026
  - article:
    - text: Proyectos activos
    - strong: "1"
    - paragraph: Estado Activo; excluye archivados
  - article:
    - text: Tareas pendientes
    - strong: "3"
    - paragraph: Estado Pendiente en este proyecto
  - article:
    - text: Tareas en curso
    - strong: "3"
    - paragraph: En progreso o en revisión
  - article:
    - text: Tareas vencidas
    - strong: "0"
    - paragraph: Sin completar; fecha anterior a hoy
  - article:
    - text: Progreso del proyecto
    - strong: 14%
    - paragraph: Completadas ÷ todas las tareas
  - region "Trabajo en curso":
    - heading "Trabajo en curso" [level=3]
    - paragraph: Arrastra tareas o usa Espacio y las flechas para moverlas.
    - text: Buscar tarea
    - textbox "Buscar tarea"
    - button "Filtrar tareas"
    - status: Para mover una tarea con teclado, pulsa Espacio.
    - region "Pendiente":
      - heading "Pendiente" [level=4]
      - text: "3"
      - button "Preparar entorno de desarrollo. Pendiente. Posición 1. Pulsa Espacio para mover.":
        - text: Baja
        - time: 13 oct
        - text: Preparar entorno de desarrollo Desarrollo Diego
      - button "Revisión con cliente. Pendiente. Posición 2. Pulsa Espacio para mover.":
        - text: Alta
        - time: 15 oct
        - text: Revisión con cliente Cliente Ana
      - button "Checklist de publicación. Pendiente. Posición 3. Pulsa Espacio para mover.":
        - text: Media
        - time: 21 oct
        - text: Checklist de publicación Entrega Lucía
    - region:
      - heading "En progreso" [level=4]
      - text: "2"
      - button "Mapa de contenidos. En progreso. Posición 1. Pulsa Espacio para mover.":
        - text: Media
        - time: 8 oct
        - text: Mapa de contenidos Contenido Carlos
      - button "Tarea guiada. En progreso. Posición 2. Pulsa Espacio para mover.":
        - text: Alta
        - time: 31 dic
        - text: Tarea guiada Ana
    - region:
      - heading "En revisión" [level=4]
      - text: "1"
      - button "Propuesta de dirección visual. En revisión. Posición 1. Pulsa Espacio para mover.":
        - text: Alta
        - time: 10 oct
        - text: Propuesta de dirección visual Diseño Carlos
    - region "Completada":
      - heading "Completada" [level=4]
      - text: "1"
      - button "Validar alcance y objetivos. Completada. Posición 1. Pulsa Espacio para mover.":
        - text: Alta
        - time: 3 oct
        - text: Validar alcance y objetivos Aprobación Ana
    - text: Espacio para seleccionar; flechas izquierda y derecha para cambiar columna; arriba y abajo para reordenar; Enter para soltar; Escape para cancelar.
  - complementary:
    - heading "Proyecto seleccionado" [level=3]
    - paragraph: Lanzamiento web corporativo
    - paragraph: "Cliente: Grupo Horizonte"
    - text: "Progreso: tareas completadas / total"
    - strong: 14%
    - progressbar "Progreso del proyecto"
    - strong: "7"
    - text: Tareas
    - strong: "1"
    - text: Completadas
    - strong: "0"
    - text: Vencidas
    - heading "Actividad reciente" [level=3]
    - button "Ver todo"
    - paragraph:
      - strong: Ana Torres
      - text: movió Tarea guiada a en progreso
    - time: Hoy, 1:19 a.m.
    - paragraph:
      - strong: Ana Torres
      - text: creó la tarea Tarea guiada
    - time: Hoy, 1:19 a.m.
    - paragraph:
      - strong: Ana Torres
      - text: completó Validar alcance y objetivos
    - time: Hoy, 10:00 a.m.
  - paragraph: No es otro tablero. Es una operación adaptable.
  - paragraph: "Explora escenarios para ver cómo Operación Uno modela procesos distintos: aprobaciones, responsables, dependencias y entregas."
  - button "Abrir centro de demo"
  - dialog "Tarea guiada":
    - heading "Tarea guiada" [level=2]
    - paragraph: Lanzamiento web corporativo
    - button "Cerrar tarea"
    - button "Editar"
    - button "Duplicar"
    - button "Eliminar"
    - text: Estado
    - combobox "Estado" [expanded]:
      - option "Pendiente"
      - option "En progreso" [selected]
      - option "En revisión"
      - option "Completada"
    - paragraph: Responsable
    - text: Ana Torres
    - paragraph: Fecha límite
    - time: 31 de diciembre de 2099
    - paragraph: Descripción
    - paragraph: Sin descripción
    - text: Actividad
    - list:
      - listitem:
        - text: Ana Torres movió Tarea guiada a en progreso
        - time: Hoy, 1:19 a.m.
      - listitem:
        - text: Ana Torres creó la tarea Tarea guiada
        - time: Hoy, 1:19 a.m.
- alert
- img
- dialog "Muévela a En progreso":
  - button "Cerrar": ×
  - banner: Muévela a En progreso
  - text: Cambia el estado a “En progreso”. También podrías arrastrar la tarjeta en el tablero; aquí usamos el selector accesible.
  - contentinfo:
    - text: Paso 8 de 10
    - button "Anterior" [disabled]
    - button "Siguiente"
    - button "Saltar recorrido"
```

# Test source

```ts
  151 |   await page.getByRole('dialog', { name: /Diseñar experiencia UX\/UI/ }).getByRole('button', { name: 'Editar' }).click()
  152 |   const form = page.getByRole('dialog', { name: 'Editar tarea' })
  153 |   await form.getByLabel('Responsable').selectOption('ana')
  154 |   await form.getByRole('button', { name: 'Guardar cambios' }).click()
  155 |   await expect(popover.getByText('Cambia su estado')).toBeVisible()
  156 |   await page.getByRole('dialog', { name: /Diseñar experiencia UX\/UI/ }).getByLabel('Estado').selectOption('Completada')
  157 |   await expect(popover.getByText('Progreso actualizado')).toBeVisible()
  158 | })
  159 | 
  160 | test('remembers dismissal and can restart from the demo center', async ({ page }) => {
  161 |   await page.goto('/')
  162 |   await dismissInitialTour(page)
  163 |   await page.reload()
  164 |   await expect(page.locator('.driver-popover')).toBeHidden()
  165 |   await page.getByRole('button', { name: 'Agencia' }).click()
  166 |   await page.getByRole('button', { name: 'Reiniciar recorrido' }).click()
  167 |   await expect(page.locator('.driver-popover').getByText('Bienvenido a Operación Uno')).toBeVisible()
  168 | })
  169 | 
  170 | test('shows the scenario step on a mobile viewport', async ({ page }) => {
  171 |   await page.setViewportSize({ width: 390, height: 844 })
  172 |   await page.goto('/')
  173 |   const popover = page.locator('.driver-popover')
  174 |   await expect(popover).toHaveCount(1)
  175 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  176 |   await expect(page.locator('[data-tour="scenario-selector"]')).toBeVisible()
  177 |   await page.locator('[data-tour="scenario-selector"]').click()
  178 |   await expect(page.getByRole('dialog', { name: 'Modela una operación distinta' })).toBeVisible()
  179 | })
  180 | 
  181 | test('guides project creation without skipping required fields', async ({ page }) => {
  182 |   await page.goto('/')
  183 |   await dismissInitialTour(page)
  184 |   await page.getByRole('button', { name: 'Crear proyecto con guía' }).click()
  185 |   const popover = page.locator('.driver-popover')
  186 |   const form = page.getByRole('dialog', { name: 'Nuevo proyecto' })
  187 |   await expect(form).toBeVisible()
  188 |   await expect(popover.getByText('Crea tu proyecto')).toBeVisible()
  189 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  190 |   await expect(popover.getByText('Ponle un nombre')).toBeVisible()
  191 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  192 |   await expect(popover.getByText('Ponle un nombre')).toBeVisible()
  193 |   await expect(form.getByText('Escribe el nombre del proyecto.')).toBeVisible()
  194 |   await form.getByLabel('Nombre *').fill('Proyecto guiado')
  195 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  196 |   await expect(popover.getByText('Asigna un responsable')).toBeVisible()
  197 |   await form.getByLabel('Responsable *').selectOption('')
  198 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  199 |   await expect(popover.getByText('Asigna un responsable')).toBeVisible()
  200 |   await expect(form.getByText('Selecciona un responsable activo.')).toBeVisible()
  201 |   await form.getByLabel('Responsable *').selectOption('lucia')
  202 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  203 |   await expect(popover.getByText('Define las fechas')).toBeVisible()
  204 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  205 |   await expect(popover.getByText('Define las fechas')).toBeVisible()
  206 |   await expect(form.getByText('Selecciona una fecha de entrega.')).toBeVisible()
  207 |   await form.getByLabel('Fecha de entrega *').fill('2099-12-31')
  208 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  209 |   await expect(popover.getByText('Guarda el proyecto')).toBeVisible()
  210 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  211 |   await expect(popover.getByText('Proyecto creado')).toBeVisible()
  212 |   await expect(page.getByLabel('Proyecto actual')).toContainText('Proyecto guiado')
  213 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  214 |   await expect(popover.getByText('Crea la primera tarea')).toBeVisible()
  215 |   await page.getByRole('button', { name: 'Nueva tarea' }).click()
  216 |   await expect(page.getByRole('dialog', { name: 'Nueva tarea' })).toBeVisible()
  217 | })
  218 | 
  219 | test('guides task creation, state changes and live metrics', async ({ page }) => {
  220 |   page.on('console', (message) => console.log('BROWSER', message.text()))
  221 |   await page.goto('/')
  222 |   await dismissInitialTour(page)
  223 |   await page.getByRole('button', { name: 'Crear tarea con guía' }).click()
  224 |   const popover = page.locator('.driver-popover')
  225 |   const form = page.getByRole('dialog', { name: 'Nueva tarea' })
  226 |   await expect(form).toBeVisible()
  227 |   await expect(popover.getByText('Crea una tarea')).toBeVisible()
  228 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  229 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  230 |   await expect(popover.getByText('Describe el trabajo')).toBeVisible()
  231 |   await expect(form.getByText('Escribe el título de la tarea.')).toBeVisible()
  232 |   await form.getByLabel('Título *').fill('Tarea guiada')
  233 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  234 |   await expect(popover.getByText('Asigna un responsable')).toBeVisible()
  235 |   await form.getByLabel('Responsable').selectOption('ana')
  236 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  237 |   await expect(popover.getByText('Establece una fecha')).toBeVisible()
  238 |   await form.getByLabel('Fecha límite').fill('2099-12-31')
  239 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  240 |   await expect(popover.getByText('Elige la prioridad')).toBeVisible()
  241 |   await form.getByLabel('Prioridad').selectOption('Alta')
  242 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  243 |   await expect(popover.getByText('Guarda la tarea')).toBeVisible()
  244 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  245 |   const drawer = page.getByRole('dialog', { name: /Tarea guiada/ })
  246 |   await expect(drawer).toBeVisible()
  247 |   await expect(popover.getByText('Tarea creada')).toBeVisible()
  248 |   await popover.getByRole('button', { name: 'Siguiente' }).click()
  249 |   await expect(popover.getByText('Muévela a En progreso')).toBeVisible()
  250 |   await drawer.getByLabel('Estado').selectOption('En progreso')
> 251 |   await expect(popover.getByText('Márcala como Completada')).toBeVisible()
      |                                                              ^ Error: expect(locator).toBeVisible() failed
  252 |   await drawer.getByLabel('Estado').selectOption('Completada')
  253 |   await expect(popover.getByText('Métricas actualizadas')).toBeVisible()
  254 |   await expect(page.getByRole('article').filter({ hasText: 'Progreso del proyecto' }).getByText('29%')).toBeVisible()
  255 |   await popover.getByRole('button', { name: 'Terminar' }).click()
  256 |   await page.reload()
  257 |   await expect(page.getByRole('button', { name: /Tarea guiada\. Completada/ })).toBeVisible()
  258 | })
  259 | 
```