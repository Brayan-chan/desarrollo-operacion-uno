'use client'

/* eslint-disable react-hooks/set-state-in-effect -- This hook hydrates React state from the browser's external storage system. */

import { useCallback, useEffect, useState, type SetStateAction } from 'react'
import { parseStoredTasks, storageKey } from '@/lib/demo-storage'
import type { ScenarioKey, Task } from '@/types/demo'

export function useDemoTasks(scenarioKey: ScenarioKey, initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = parseStoredTasks(window.localStorage.getItem(storageKey(scenarioKey)))
      setTasks(saved ?? initialTasks)
      setStorageError(null)
    } catch {
      setTasks(initialTasks)
      setStorageError('No pudimos leer los datos guardados. Puedes restaurar este escenario para continuar.')
    }
  }, [initialTasks, scenarioKey])

  const updateTasks = useCallback((action: SetStateAction<Task[]>) => {
    const next = typeof action === 'function' ? action(tasks) : action
    setTasks(next)
    try {
      window.localStorage.setItem(storageKey(scenarioKey), JSON.stringify(next))
      setStorageError(null)
    } catch {
      setStorageError('No pudimos guardar los cambios en este navegador.')
    }
  }, [scenarioKey, tasks])

  const restore = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey(scenarioKey))
      setTasks(initialTasks)
      setStorageError(null)
    } catch {
      setStorageError('No pudimos restaurar los datos de este escenario.')
    }
  }, [initialTasks, scenarioKey])

  return {
    tasks,
    setTasks: updateTasks,
    isLoading: false,
    storageError,
    clearStorageError: () => setStorageError(null),
    restore,
  }
}
