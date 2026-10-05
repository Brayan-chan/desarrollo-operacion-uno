'use client'

import { useCallback, useEffect, useRef } from 'react'
import { driver, type Driver } from 'driver.js'
import { demoTourSteps } from '@/lib/demo-tour-steps'
import type { ScenarioKey, TourState } from '@/types/demo'

type Intent = 'pause' | 'complete' | 'dismiss' | 'unmount' | null

export function useDemoTour({ scenarioKey, tour, isHydrating, saveTour, prepare, openSampleTask, closeSampleTask }: { scenarioKey: ScenarioKey; tour: TourState; isHydrating: boolean; saveTour: (tour: TourState) => void; prepare: () => void; openSampleTask: () => void; closeSampleTask: () => void }) {
  const instanceRef = useRef<Driver | null>(null)
  const intentRef = useRef<Intent>(null)
  const pendingRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoStartedRef = useRef(new Set<ScenarioKey>())
  const valuesRef = useRef({ tour, saveTour, prepare, openSampleTask, closeSampleTask })
  useEffect(() => { valuesRef.current = { tour, saveTour, prepare, openSampleTask, closeSampleTask } }, [tour, saveTour, prepare, openSampleTask, closeSampleTask])

  const persist = useCallback((patch: Partial<TourState>) => {
    const next = { ...valuesRef.current.tour, ...patch }
    valuesRef.current.tour = next
    valuesRef.current.saveTour(next)
  }, [])

  const start = useCallback((index = 0) => {
    if (!instanceRef.current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    pendingRef.current = null
    valuesRef.current.prepare()
    timerRef.current = setTimeout(() => { instanceRef.current?.drive(index); timerRef.current = null }, 180)
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

  useEffect(() => {
    const instance = driver({
      steps: demoTourSteps,
      popoverClass: 'operacion-uno-tour',
      overlayColor: '#172331',
      overlayOpacity: 0.62,
      stagePadding: 8,
      stageRadius: 12,
      smoothScroll: true,
      showProgress: true,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Terminar',
      closeBtnLabel: 'Cerrar',
      onHighlighted: (_element, _step, options) => { if (options.index !== undefined) persist({ lastStep: options.index }) },
      onNextClick: (_element, _step, options) => {
        if (options.index === 5) { pause(6); valuesRef.current.openSampleTask(); return }
        if (options.index === 7) valuesRef.current.closeSampleTask()
        options.driver.moveNext()
      },
      onPrevClick: (_element, _step, options) => options.driver.movePrevious(),
      onCloseClick: (_element, _step, options) => { intentRef.current = 'dismiss'; options.driver.destroy() },
      onDoneClick: (_element, _step, options) => { intentRef.current = 'complete'; options.driver.destroy() },
      onDestroyed: () => {
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
    const timer = setTimeout(() => { autoStartedRef.current.add(scenarioKey); start(tour.lastStep ?? 0) }, 650)
    return () => clearTimeout(timer)
  }, [isHydrating, scenarioKey, start, tour.completed, tour.dismissed, tour.lastStep])

  return { start, restart, pause, resume, isActive: () => Boolean(instanceRef.current?.isActive()), activeIndex: () => instanceRef.current?.getActiveIndex(), moveTo: (index: number) => instanceRef.current?.moveTo(index) }
}
