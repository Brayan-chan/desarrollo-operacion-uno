'use client'

import { useCallback, useEffect, useRef } from 'react'
import { driver, type Driver } from 'driver.js'
import { createDemoTourSteps } from '@/lib/demo-tour-steps'
import { canAdvanceProjectTour, projectTourSteps, type GuidedProjectFields } from '@/lib/project-tour-steps'
import { canAdvanceTaskTour, taskTourSteps, type GuidedTaskFields } from '@/lib/task-tour-steps'
import type { ScenarioKey, TourState } from '@/types/demo'

type Intent = 'pause' | 'complete' | 'dismiss' | 'unmount' | null
type TourMode = 'initial' | 'project' | 'task'

function showCorrection(message: string) {
  const description = document.querySelector<HTMLElement>('.operacion-uno-tour .driver-popover-description')
  if (!description) return
  description.dataset.originalText ??= description.textContent ?? ''
  description.textContent = `${description.dataset.originalText} ${message}`
  description.setAttribute('role', 'status')
}

export function useDemoTour({ scenarioKey, tour, isHydrating, saveTour, prepare, openScenario, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd, captureInterface, restoreInterface, onTourIssue }: { scenarioKey: ScenarioKey; tour: TourState; isHydrating: boolean; saveTour: (tour: TourState) => void; prepare: () => void; openScenario: () => void; closeSampleTask: () => void; prepareProjectTour: () => void; prepareTaskTour: () => void; onTaskTourEnd: () => void; captureInterface: () => void; restoreInterface: () => void; onTourIssue: (message: string) => void }) {
  const instanceRef = useRef<Driver | null>(null)
  const modeRef = useRef<TourMode>('initial')
  const intentRef = useRef<Intent>(null)
  const pendingRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const positionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const positionedStepRef = useRef<string | null>(null)
  const projectSelectedRef = useRef(false)
  const autoStartedRef = useRef(new Set<ScenarioKey>())
  const valuesRef = useRef({ tour, saveTour, prepare, openScenario, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd, captureInterface, restoreInterface, onTourIssue })
  useEffect(() => { valuesRef.current = { tour, saveTour, prepare, openScenario, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd, captureInterface, restoreInterface, onTourIssue } }, [tour, saveTour, prepare, openScenario, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd, captureInterface, restoreInterface, onTourIssue])

  const persist = useCallback((patch: Partial<TourState>) => {
    const next = { ...valuesRef.current.tour, ...patch }
    valuesRef.current.tour = next
    valuesRef.current.saveTour(next)
  }, [])

  const start = useCallback((index = 0) => {
    if (!instanceRef.current) return
    if (instanceRef.current.isActive()) { intentRef.current = 'pause'; instanceRef.current.destroy() }
    if (timerRef.current) clearTimeout(timerRef.current)
    valuesRef.current.captureInterface()
    pendingRef.current = null
    positionedStepRef.current = null
    projectSelectedRef.current = false
    modeRef.current = 'initial'
    instanceRef.current.setSteps(createDemoTourSteps(window.matchMedia('(max-width: 639px)').matches))
    valuesRef.current.prepare()
    timerRef.current = setTimeout(() => { instanceRef.current?.drive(index); timerRef.current = null }, 300)
  }, [])

  const pause = useCallback((nextIndex: number) => {
    if (!instanceRef.current?.isActive()) return
    pendingRef.current = nextIndex
    intentRef.current = 'pause'
    persist({ lastStep: nextIndex })
    instanceRef.current.destroy()
  }, [persist])

  const resume = useCallback((scenario = scenarioKey, nextIndex?: number) => {
    const index = pendingRef.current === null ? null : nextIndex ?? pendingRef.current
    if (index === null || !instanceRef.current) return
    autoStartedRef.current.add(scenario)
    pendingRef.current = null
    positionedStepRef.current = null
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { instanceRef.current?.drive(index); timerRef.current = null }, 180)
  }, [scenarioKey])

  const restart = useCallback(() => { persist({ completed: false, dismissed: false, lastStep: 0 }); start(0) }, [persist, start])

  const startProject = useCallback(() => {
    const instance = instanceRef.current
    if (!instance) return
    if (instance.isActive()) { intentRef.current = 'pause'; instance.destroy() }
    if (timerRef.current) clearTimeout(timerRef.current)
    valuesRef.current.captureInterface()
    pendingRef.current = null
    positionedStepRef.current = null
    autoStartedRef.current.add(scenarioKey)
    modeRef.current = 'project'
    instance.setSteps(projectTourSteps)
    valuesRef.current.prepareProjectTour()
    timerRef.current = setTimeout(() => { instanceRef.current?.drive(0); timerRef.current = null }, 300)
  }, [scenarioKey])

  const finishProject = useCallback(() => {
    if (modeRef.current !== 'project') return
    intentRef.current = 'complete'
    instanceRef.current?.destroy()
  }, [])

  const projectSaved = useCallback(() => {
    if (modeRef.current !== 'project' || !instanceRef.current?.isActive()) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { instanceRef.current?.moveTo(5); timerRef.current = null }, 180)
  }, [])

  const startTask = useCallback(() => {
    const instance = instanceRef.current
    if (!instance) return
    if (instance.isActive()) { intentRef.current = 'pause'; instance.destroy() }
    if (timerRef.current) clearTimeout(timerRef.current)
    valuesRef.current.captureInterface()
    pendingRef.current = null
    autoStartedRef.current.add(scenarioKey)
    modeRef.current = 'task'
    instance.setSteps(taskTourSteps)
    valuesRef.current.prepareTaskTour()
    timerRef.current = setTimeout(() => { instanceRef.current?.drive(0); timerRef.current = null }, 300)
  }, [scenarioKey])

  const finishTask = useCallback(() => {
    if (modeRef.current !== 'task') return
    intentRef.current = 'complete'
    instanceRef.current?.destroy()
  }, [])

  const taskSaved = useCallback(() => {
    if (modeRef.current !== 'task' || !instanceRef.current || instanceRef.current.getActiveIndex() === undefined) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { instanceRef.current?.moveTo(6); timerRef.current = null }, 180)
  }, [])

  const taskStatusChanged = useCallback((status: string) => {
    if (modeRef.current !== 'task' || !instanceRef.current || instanceRef.current.getActiveIndex() === undefined) return
    const index = instanceRef.current.getActiveIndex()
    if (index === 7 && status === 'En progreso') {
      instanceRef.current.moveTo(8)
    } else if (index === 8 && status === 'Completada') {
      valuesRef.current.closeSampleTask()
      instanceRef.current.moveTo(9)
    }
  }, [])

  const cancel = useCallback(() => {
    if (pendingRef.current !== null) {
      pendingRef.current = null
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
      if (modeRef.current === 'initial') persist({ completed: false, dismissed: true, lastStep: undefined })
      valuesRef.current.restoreInterface()
      return
    }
    if (!instanceRef.current?.isActive()) return
    intentRef.current = 'dismiss'
    instanceRef.current.destroy()
  }, [persist])

  const projectSelected = useCallback((hasTasks: boolean) => {
    if (modeRef.current !== 'initial' || instanceRef.current?.getActiveIndex() !== 3) return
    if (!hasTasks) { showCorrection('Este proyecto aún no tiene tareas. Vuelve a uno con tareas para continuar.'); return }
    projectSelectedRef.current = true
    instanceRef.current.moveNext()
  }, [])

  const initialStatusChanged = useCallback(() => {
    if (modeRef.current !== 'initial' || instanceRef.current?.getActiveIndex() !== 7) return
    valuesRef.current.closeSampleTask()
    instanceRef.current.moveTo(8)
  }, [])

  useEffect(() => {
    const instance = driver({
      steps: createDemoTourSteps(),
      popoverClass: 'operacion-uno-tour',
      overlayColor: '#172331',
      overlayOpacity: 0.62,
      stagePadding: 8,
      stageRadius: 12,
      smoothScroll: true,
      waitForElement: 1500,
      duration: 220,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Terminar',
      closeBtnLabel: 'Cerrar',
      onHighlighted: (element, step, options) => {
        if (modeRef.current === 'initial' && options.index !== undefined) persist({ lastStep: options.index })
        if (typeof step.element === 'string' && !document.querySelector(step.element) && modeRef.current !== 'initial') {
          intentRef.current = 'dismiss'
          valuesRef.current.onTourIssue('No se encontró el elemento de esta guía. Puedes iniciarla de nuevo.')
          options.driver.destroy()
          return
        }
        const positionKey = `${modeRef.current}:${options.index ?? -1}`
        if (element instanceof HTMLElement && element.isConnected && positionedStepRef.current !== positionKey) {
          positionedStepRef.current = positionKey
          element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' })
          if (positionTimerRef.current) clearTimeout(positionTimerRef.current)
          positionTimerRef.current = setTimeout(() => { if (options.driver.isActive()) options.driver.refresh(); positionTimerRef.current = null }, 260)
        }
      },
      onPopoverRender: (popover, options) => {
        if (popover.footerButtons.querySelector('[data-tour-skip]')) return
        if (modeRef.current === 'project' && options.index === 6) {
          const createTask = document.createElement('button')
          createTask.type = 'button'
          createTask.className = 'driver-popover-footer-btn operacion-uno-tour-task-cta'
          createTask.textContent = 'Crear primera tarea'
          createTask.addEventListener('click', () => document.querySelector<HTMLButtonElement>('[aria-label="Gestión de proyectos"] button')?.click())
          popover.footerButtons.appendChild(createTask)
        }
        const skip = document.createElement('button')
        skip.type = 'button'
        skip.className = 'driver-popover-footer-btn operacion-uno-tour-skip'
        skip.dataset.tourSkip = 'true'
        skip.textContent = 'Saltar recorrido'
        skip.addEventListener('click', () => { intentRef.current = 'dismiss'; options.driver.destroy() })
        popover.footerButtons.appendChild(skip)
      },
      onNextClick: (_element, _step, options) => {
        if (modeRef.current === 'task') {
          const index = options.index ?? 0
          if (index <= 5 && !document.querySelector('[data-tour="task-form"]')) { showCorrection('El formulario ya no está abierto. Cierra esta guía y vuelve a iniciarla.'); return }
          const read = (selector: string) => document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value ?? ''
          const fields: GuidedTaskFields = { title: read('[data-tour="task-title"]'), assigneeId: read('[data-tour="task-assignee"]'), dueDate: read('[data-tour="task-due-date"]'), priority: read('[data-tour="task-priority"]') }
          if (index <= 5 && !canAdvanceTaskTour(index, fields)) {
            document.querySelector<HTMLFormElement>('[data-tour="task-form"]')?.requestSubmit()
            showCorrection(!fields.title.trim() ? 'Escribe un título.' : !fields.assigneeId ? 'Selecciona un responsable.' : !fields.dueDate ? 'Elige una fecha.' : 'Elige una prioridad.')
            const target = !fields.title.trim() ? '[data-tour="task-title"]' : !fields.assigneeId ? '[data-tour="task-assignee"]' : !fields.dueDate ? '[data-tour="task-due-date"]' : '[data-tour="task-priority"]'
            document.querySelector<HTMLElement>(target)?.focus()
            if (index === 5) options.driver.moveTo(!fields.title.trim() ? 1 : !fields.assigneeId ? 2 : !fields.dueDate ? 3 : 4)
            return
          }
          if (index === 5) { document.querySelector<HTMLFormElement>('[data-tour="task-form"]')?.requestSubmit(); return }
          if (index === 7 || index === 8) {
            const select = document.querySelector<HTMLSelectElement>('[data-tour="task-drawer"] select')
            if (select?.value !== (index === 7 ? 'En progreso' : 'Completada')) { showCorrection(`Selecciona “${index === 7 ? 'En progreso' : 'Completada'}” para continuar.`); select?.focus(); return }
            if (index === 8) valuesRef.current.closeSampleTask()
          }
          options.driver.moveNext()
          return
        }
        if (modeRef.current === 'project') {
          const index = options.index ?? 0
          if (index <= 4 && !document.querySelector('[data-tour="project-form"]')) { showCorrection('El formulario ya no está abierto. Cierra esta guía y vuelve a iniciarla.'); return }
          const read = (selector: string) => (document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value ?? '')
          const fields: GuidedProjectFields = { name: read('[data-tour="project-name"]'), ownerId: read('[data-tour="project-owner"]'), startDate: read('[data-tour="project-start-date"]'), dueDate: read('[data-tour="project-due-date"]') }
          if (!canAdvanceProjectTour(index, fields)) {
            document.querySelector<HTMLFormElement>('[data-tour="project-form"]')?.requestSubmit()
            showCorrection(!fields.name.trim() ? 'Escribe el nombre.' : !fields.ownerId ? 'Elige un responsable.' : 'Revisa las fechas de inicio y entrega.')
            const selector = !fields.name.trim() ? '[data-tour="project-name"]' : !fields.ownerId ? '[data-tour="project-owner"]' : '[data-tour="project-due-date"]'
            document.querySelector<HTMLElement>(selector)?.focus()
            if (index === 4) options.driver.moveTo(!fields.name.trim() ? 1 : !fields.ownerId ? 2 : 3)
            return
          }
          if (index === 4) { document.querySelector<HTMLFormElement>('[data-tour="project-form"]')?.requestSubmit(); return }
          options.driver.moveNext()
          return
        }
        if (options.index === 1) { valuesRef.current.openScenario(); return }
        if (options.index === 3 && !projectSelectedRef.current) {
          const selector = document.querySelector<HTMLSelectElement>('[data-tour="project-selector"]')
          if (selector && selector.options.length > 2) { showCorrection('Selecciona otro proyecto para continuar.'); selector.focus(); return }
        }
        if (options.index === 5) { const card = document.querySelector<HTMLElement>('[data-tour="sample-task"]'); if (!card) { options.driver.moveNext(); return } showCorrection('Toca una tarjeta de tarea para abrirla.'); card.focus(); return }
        if (options.index === 6) { showCorrection('Pulsa Editar y guarda un cambio de responsable o fecha.'); document.querySelector<HTMLElement>('[data-tour="task-drawer"] button')?.focus(); return }
        if (options.index === 7) { showCorrection('Cambia Estado para continuar.'); document.querySelector<HTMLElement>('[data-tour="task-drawer"] select')?.focus(); return }
        options.driver.moveNext()
      },
      onPrevClick: (_element, _step, options) => { if ((modeRef.current !== 'project' && modeRef.current !== 'task') || (options.index ?? 0) < 5) options.driver.movePrevious() },
      onCloseClick: (_element, _step, options) => { intentRef.current = 'dismiss'; options.driver.destroy() },
      onDoneClick: (_element, _step, options) => { intentRef.current = 'complete'; options.driver.destroy() },
      onDestroyed: () => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        if (positionTimerRef.current) { clearTimeout(positionTimerRef.current); positionTimerRef.current = null }
        if (intentRef.current === 'dismiss') valuesRef.current.restoreInterface()
        if (modeRef.current === 'task') { if (intentRef.current !== 'unmount') valuesRef.current.onTaskTourEnd(); intentRef.current = null; return }
        if (modeRef.current === 'project') { intentRef.current = null; return }
        if (intentRef.current === 'complete') persist({ completed: true, dismissed: false, lastStep: undefined })
        else if (intentRef.current === 'dismiss' || intentRef.current === null) persist({ completed: false, dismissed: true, lastStep: undefined })
        intentRef.current = null
      },
    })
    instanceRef.current = instance
    const refreshPosition = () => { if (instance.isActive()) instance.refresh() }
    window.addEventListener('resize', refreshPosition)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (positionTimerRef.current) clearTimeout(positionTimerRef.current)
      window.removeEventListener('resize', refreshPosition)
      intentRef.current = 'unmount'
      instance.destroy()
      instanceRef.current = null
      intentRef.current = null
    }
  }, [pause, persist])

  useEffect(() => {
    if (isHydrating || tour.completed || tour.dismissed || pendingRef.current !== null || autoStartedRef.current.has(scenarioKey)) return
    const timer = setTimeout(() => { if (modeRef.current !== 'initial') return; autoStartedRef.current.add(scenarioKey); start(tour.lastStep ?? 0) }, 650)
    return () => clearTimeout(timer)
  }, [isHydrating, scenarioKey, start, tour.completed, tour.dismissed, tour.lastStep])

  return { start, restart, startProject, finishProject, projectSaved, startTask, finishTask, taskSaved, taskStatusChanged, projectSelected, initialStatusChanged, cancel, pause, resume, isProjectActive: () => modeRef.current === 'project' && instanceRef.current?.getActiveIndex() !== undefined, isTaskActive: () => modeRef.current === 'task' && instanceRef.current?.getActiveIndex() !== undefined, isInitialActive: () => modeRef.current === 'initial' && instanceRef.current?.getActiveIndex() !== undefined, isActive: () => Boolean(instanceRef.current?.isActive()), activeIndex: () => instanceRef.current?.getActiveIndex(), moveTo: (index: number) => instanceRef.current?.moveTo(index) }
}
