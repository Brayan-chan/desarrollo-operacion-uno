'use client'

/* eslint-disable react-hooks/set-state-in-effect -- Hydration reads external browser storage. */

import { useCallback, useEffect, useState } from 'react'
import { loadWorkspace, removeScenario, saveWorkspace, type StorageFailure } from '@/lib/demo-storage'
import type { ScenarioKey, TourState, Workspace } from '@/types/demo'
import { refreshWorkspace } from '@/lib/workspace'

export type SaveState = 'loading' | 'saved' | 'error'

export function useDemoWorkspace(scenarioKey: ScenarioKey, initialWorkspace: Workspace, resetKey = 0) {
  const [loaded, setLoaded] = useState<{ key: ScenarioKey; workspace: Workspace } | null>(null)
  const [storageError, setStorageError] = useState<StorageFailure | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('loading')

  useEffect(() => {
    const result = loadWorkspace(window.localStorage, scenarioKey, initialWorkspace)
    setLoaded({ key: scenarioKey, workspace: result.ok ? result.value.workspace : refreshWorkspace(initialWorkspace) })
    setStorageError(result.ok ? null : result)
    setSaveState(result.ok ? 'saved' : 'error')
    if (result.ok && result.value.source === 'migrated') {
      const saved = saveWorkspace(window.localStorage, result.value.workspace)
      if (!saved.ok) { setStorageError(saved); setSaveState('error') }
    }
  }, [scenarioKey, initialWorkspace, resetKey])

  const updateWorkspace = useCallback((action: Workspace | ((current: Workspace) => Workspace)) => {
    if (!loaded || loaded.key !== scenarioKey) return null
    const next = typeof action === 'function' ? action(loaded.workspace) : action
    const saved = saveWorkspace(window.localStorage, next)
    setLoaded({ key: scenarioKey, workspace: next })
    setStorageError(saved.ok ? null : saved)
    setSaveState(saved.ok ? 'saved' : 'error')
    return saved
  }, [loaded, scenarioKey])

  const restore = useCallback(() => {
    const result = removeScenario(window.localStorage, scenarioKey)
    if (result.ok) {
      setLoaded({ key: scenarioKey, workspace: refreshWorkspace(initialWorkspace) })
      setStorageError(null)
      setSaveState('saved')
    } else {
      setStorageError(result)
      setSaveState('error')
    }
    return result
  }, [initialWorkspace, scenarioKey])

  const updateTour = useCallback((tour: TourState) => {
    updateWorkspace((current) => ({ ...current, tour, updatedAt: new Date().toISOString() }))
  }, [updateWorkspace])

  return {
    workspace: loaded?.key === scenarioKey ? loaded.workspace : initialWorkspace,
    isHydrating: loaded?.key !== scenarioKey,
    setWorkspace: updateWorkspace,
    updateTour,
    storageError,
    saveState,
    clearStorageError: () => setStorageError(null),
    restore,
  }
}
