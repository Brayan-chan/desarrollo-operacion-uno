'use client'

/* eslint-disable react-hooks/set-state-in-effect -- This hook hydrates state from the browser's external storage system. */

import { useCallback, useEffect, useState, type SetStateAction } from 'react'
import { ACTIVE_SCENARIO_KEY, parseStoredWorkspace, storageKey } from '@/lib/demo-storage'
import type { ScenarioKey, Workspace } from '@/types/demo'

export function useDemoWorkspace(scenarioKey: ScenarioKey, initialWorkspace: Workspace) {
  const [workspace, setWorkspace] = useState(initialWorkspace)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = parseStoredWorkspace(window.localStorage.getItem(storageKey(scenarioKey)), initialWorkspace)
      const next = saved ?? initialWorkspace
      setWorkspace(next)
      if (saved) window.localStorage.setItem(storageKey(scenarioKey), JSON.stringify(next))
      setStorageError(null)
    } catch {
      setWorkspace(initialWorkspace)
      setStorageError('No pudimos leer los datos guardados. Puedes restaurar este escenario para continuar.')
    }
  }, [initialWorkspace, scenarioKey])

  const updateWorkspace = useCallback((action: SetStateAction<Workspace>) => {
    const next = typeof action === 'function' ? action(workspace) : action
    setWorkspace(next)
    try {
      window.localStorage.setItem(storageKey(scenarioKey), JSON.stringify(next))
      window.localStorage.setItem(ACTIVE_SCENARIO_KEY, scenarioKey)
      setStorageError(null)
    } catch {
      setStorageError('No pudimos guardar los cambios en este navegador.')
    }
  }, [scenarioKey, workspace])

  const restore = useCallback(() => {
    try {
      window.localStorage.removeItem(storageKey(scenarioKey))
      setWorkspace(initialWorkspace)
      setStorageError(null)
    } catch {
      setStorageError('No pudimos restaurar los datos de este escenario.')
    }
  }, [initialWorkspace, scenarioKey])

  return { workspace, setWorkspace: updateWorkspace, storageError, clearStorageError: () => setStorageError(null), restore }
}
