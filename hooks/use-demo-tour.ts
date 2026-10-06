'use client'

import { useCallback, useEffect, useRef } from 'react'
import { driver, type Driver } from 'driver.js'
import { demoTourSteps } from '@/lib/demo-tour-steps'
import { canAdvanceProjectTour, projectTourSteps, type GuidedProjectFields } from '@/lib/project-tour-steps'
import { canAdvanceTaskTour, taskTourSteps, type GuidedTaskFields } from '@/lib/task-tour-steps'
import type { ScenarioKey, TourState } from '@/types/demo'

type Intent = 'pause' | 'complete' | 'dismiss' | 'unmount' | null
type TourMode = 'initial' | 'project' | 'task'

export function useDemoTour({ scenarioKey, tour, isHydrating, saveTour, prepare, openSampleTask, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd }: { scenarioKey: ScenarioKey; tour: TourState; isHydrating: boolean; saveTour: (tour: TourState) => void; prepare: () => void; openSampleTask: () => void; closeSampleTask: () => void; prepareProjectTour: () => void; prepareTaskTour: () => void; onTaskTourEnd: () => void }) {
  const instanceRef = useRef<Driver | null>(null)
  const modeRef = useRef<TourMode>('initial')
  const intentRef = useRef<Intent>(null)
  const pendingRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoStartedRef = useRef(new Set<ScenarioKey>())
  const valuesRef = useRef({ tour, saveTour, prepare, openSampleTask, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd })
  useEffect(() => { valuesRef.current = { tour, saveTour, prepare, openSampleTask, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd } }, [tour, saveTour, prepare, openSampleTask, closeSampleTask, prepareProjectTour, prepareTaskTour, onTaskTourEnd])

  const persist = useCallback((patch: Partial<TourState>) => {
    const next = { ...valuesRef.current.tour, ...patch }
    valuesRef.current.tour = next
    valuesRef.current.saveTour(next)
  }, [])

  const start = useCallback((index = 0) => {
    if (!instanceRef.current) return
    if (instanceRef.current.isActive()) { intentRef.current = 'pause'; instanceRef.current.destroy() }
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingRef.current = null
    modeRef.current = 'initial'
    instanceRef.current.setSteps(demoTourSteps)
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

  const resume = useCallback((scenario = scenarioKey) => {
    const index = pendingRef.current
    if (index === null || !instanceRef.current) return
    autoStartedRef.current.add(scenario)
    pendingRef.current = null
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { instanceRef.current?.drive(index); timerRef.current = null }, 180)
  }, [scenarioKey])

  const restart = useCallback(() => { persist({ completed: false, dismissed: false, lastStep: 0 }); start(0) }, [persist, start])

  const startProject = useCallback(() => {
    const instance = instanceRef.current
    if (!instance) return
    if (instance.isActive()) { intentRef.current = 'pause'; instance.destroy() }
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingRef.current = null
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
    if (modeRef.current !== 'task' || !instanceRef.current?.isActive()) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { instanceRef.current?.moveTo(6); timerRef.current = null }, 180)
  }, [])

  const taskStatusChanged = useCallback((status: string) => {
    if (modeRef.current !== 'task' || !instanceRef.current?.isActive()) return
    const index = instanceRef.current.getActiveIndex()
    if (index === 7 && status === 'En progreso') {
      timerRef.current = setTimeout(() => { instanceRef.current?.moveTo(8); timerRef.current = null }, 100)
    } else if (index === 8 && status === 'Completada') {
      valuesRef.current.closeSampleTask()
      timerRef.current = setTimeout(() => { instanceRef.current?.moveTo(9); timerRef.current = null }, 100)
    }
  }, [])

  useEffect(() => {
    const instance = driver({
      steps: demoTourSteps,
      popoverClass: 'operacion-uno-tour',
      overlayColor: '#172331',
      overlayOpacity: 0.62,
      stagePadding: 8,
      stageRadius: 12,
      smoothScroll: true,
      duration: 220,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Terminar',
      closeBtnLabel: 'Cerrar',
      onHighlighted: (_element, _step, options) => { if (modeRef.current === 'initial' && options.index !== undefined) persist({ lastStep: options.index }) },
      onNextClick: (_element, _step, options) => {
        if (modeRef.current === 'task') {
          const index = options.index ?? 0
          const read = (selector: string) => document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value ?? ''
          const fields: GuidedTaskFields = { title: read('[data-tour="task-title"]'), assigneeId: read('[data-tour="task-assignee"]'), dueDate: read('[data-tour="task-due-date"]'), priority: read('[data-tour="task-priority"]') }
          if (index <= 5 && !canAdvanceTaskTour(index, fields)) {
            document.querySelector<HTMLFormElement>('[data-tour="task-form"]')?.requestSubmit()
            const target = !fields.title.trim() ? '[data-tour="task-title"]' : !fields.assigneeId ? '[data-tour="task-assignee"]' : !fields.dueDate ? '[data-tour="task-due-date"]' : '[data-tour="task-priority"]'
            document.querySelector<HTMLElement>(target)?.focus()
            if (index === 5) options.driver.moveTo(!fields.title.trim() ? 1 : !fields.assigneeId ? 2 : !fields.dueDate ? 3 : 4)
            return
          }
          if (index === 5) { document.querySelector<HTMLFormElement>('[data-tour="task-form"]')?.requestSubmit(); return }
          if (index === 7 || index === 8) {
            const select = document.querySelector<HTMLSelectElement>('[data-tour="task-drawer"] select')
            if (select?.value !== (index === 7 ? 'En progreso' : 'Completada')) { select?.focus(); return }
            if (index === 8) valuesRef.current.closeSampleTask()
          }
          options.driver.moveNext()
          return
        }
        if (modeRef.current === 'project') {
          const index = options.index ?? 0
          const read = (selector: string) => (document.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value ?? '')
          const fields: GuidedProjectFields = { name: read('[data-tour="project-name"]'), ownerId: read('[data-tour="project-owner"]'), startDate: read('[data-tour="project-start-date"]'), dueDate: read('[data-tour="project-due-date"]') }
          if (!canAdvanceProjectTour(index, fields)) {
            document.querySelector<HTMLFormElement>('[data-tour="project-form"]')?.requestSubmit()
            const selector = !fields.name.trim() ? '[data-tour="project-name"]' : !fields.ownerId ? '[data-tour="project-owner"]' : '[data-tour="project-due-date"]'
            document.querySelector<HTMLElement>(selector)?.focus()
            if (index === 4) options.driver.moveTo(!fields.name.trim() ? 1 : !fields.ownerId ? 2 : 3)
            return
          }
          if (index === 4) { document.querySelector<HTMLFormElement>('[data-tour="project-form"]')?.requestSubmit(); return }
          options.driver.moveNext()
          return
        }
        if (options.index === 5) { pause(6); valuesRef.current.openSampleTask(); return }
        if (options.index === 7) valuesRef.current.closeSampleTask()
        options.driver.moveNext()
      },
      onPrevClick: (_element, _step, options) => { if ((modeRef.current !== 'project' && modeRef.current !== 'task') || (options.index ?? 0) < 5) options.driver.movePrevious() },
      onCloseClick: (_element, _step, options) => { intentRef.current = 'dismiss'; options.driver.destroy() },
      onDoneClick: (_element, _step, options) => { intentRef.current = 'complete'; options.driver.destroy() },
      onDestroyed: () => {
        if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
        if (modeRef.current === 'task') { if (intentRef.current !== 'unmount') valuesRef.current.onTaskTourEnd(); intentRef.current = null; return }
        if (modeRef.current === 'project') { intentRef.current = null; return }
        if (intentRef.current === 'complete') persist({ completed: true, dismissed: false, lastStep: undefined })
        else if (intentRef.current === 'dismiss' || intentRef.current === null) persist({ completed: false, dismissed: true, lastStep: undefined })
        intentRef.current = null
      },
    })
    instanceRef.current = instance
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
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

  return { start, restart, startProject, finishProject, projectSaved, startTask, finishTask, taskSaved, taskStatusChanged, pause, resume, isProjectActive: () => modeRef.current === 'project' && Boolean(instanceRef.current?.isActive()), isTaskActive: () => modeRef.current === 'task' && Boolean(instanceRef.current?.isActive()), isInitialActive: () => modeRef.current === 'initial' && Boolean(instanceRef.current?.isActive()), isActive: () => Boolean(instanceRef.current?.isActive()), activeIndex: () => instanceRef.current?.getActiveIndex(), moveTo: (index: number) => instanceRef.current?.moveTo(index) }
}
