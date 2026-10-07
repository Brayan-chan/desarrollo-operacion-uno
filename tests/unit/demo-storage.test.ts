import { describe, expect, it } from 'vitest'
import { scenarios } from '@/data/scenarios'
import { ACTIVE_SCENARIO_KEY, clearAllDemoData, createStorageSnapshot, deserializeWorkspace, loadWorkspace, parseStoredWorkspace, readActiveScenario, readScenarioStorageInfo, restoreStorageSnapshot, saveWorkspace, storageKey } from '@/lib/demo-storage'

describe('demo storage', () => {
  const fallback = scenarios.agencia.workspace

  it('builds an isolated key for each scenario', () => {
    expect(storageKey('agencia')).toBe('operacion-uno-agencia')
    expect(storageKey('software')).toBe('operacion-uno-software')
    expect(ACTIVE_SCENARIO_KEY).toBe('operacion-uno-active-scenario')
  })

  it('parses and normalizes a valid workspace', () => {
    expect(parseStoredWorkspace(JSON.stringify(fallback), fallback)).toEqual(fallback)
  })

  it('migrates the legacy task-array format', () => {
    const legacy = [{ id: 'legacy-1', title: 'Tarea anterior', project: 'Lanzamiento web corporativo', assignee: 'Ana Torres', status: 'En progreso', priority: 'Alta', due: '2026-10-10', tag: 'Migrada', description: 'Dato previo' }]
    const migrated = parseStoredWorkspace(JSON.stringify(legacy), fallback)
    expect(migrated?.version).toBe(2)
    expect(migrated?.tasks[0]).toMatchObject({ id: 'legacy-1', projectId: 'agencia-principal', assigneeId: 'ana', order: 0 })
  })

  it('returns null when there is no saved value', () => {
    expect(parseStoredWorkspace(null, fallback)).toBeNull()
  })

  it('rejects malformed saved data', () => {
    expect(() => parseStoredWorkspace('{"unexpected":true}', fallback)).toThrow('formato válido')
    expect(() => parseStoredWorkspace('invalid-json', fallback)).toThrow()
  })

  it('restores a valid active scenario and falls back safely', () => {
    expect(readActiveScenario({ getItem: () => 'software' })).toBe('software')
    expect(readActiveScenario({ getItem: () => 'invalid' })).toBe('agencia')
  })

  it('migrates a version 1 workspace without losing tasks or people', () => {
    const { activeScenario, tour, ...rest } = fallback
    const previous = { ...rest, version: 1, selectedScenario: activeScenario }
    const result = deserializeWorkspace(JSON.stringify(previous), fallback)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.migrated).toBe(true)
      expect(result.value.workspace.tasks).toHaveLength(fallback.tasks.length)
      expect(result.value.workspace.people).toEqual(fallback.people)
      expect(result.value.workspace.tour).toEqual(tour)
    }
  })

  it('never writes defaults while reading another scenario', () => {
    const data = new Map([[storageKey('software'), JSON.stringify(scenarios.software.workspace)]])
    const storage = { getItem: (key: string) => data.get(key) ?? null }
    const result = loadWorkspace(storage, 'software', scenarios.software.workspace)
    expect(result.ok && result.value.source).toBe('stored')
    expect(data.size).toBe(1)
  })

  it('shows saved counts without treating example data as saved', () => {
    const empty = readScenarioStorageInfo({ getItem: () => null }, 'agencia', fallback)
    expect(empty).toMatchObject({ state: 'example', projects: 2, tasks: 6 })
    const stored = readScenarioStorageInfo({ getItem: () => JSON.stringify(fallback) }, 'agencia', fallback)
    expect(stored).toMatchObject({ state: 'saved', projects: 2, tasks: 6, people: fallback.people.length })
    const invalid = readScenarioStorageInfo({ getItem: () => 'broken' }, 'agencia', fallback)
    expect(invalid.state).toBe('invalid')
  })

  it('reports quota exhaustion without claiming the save succeeded', () => {
    const storage = { setItem: () => { throw new DOMException('Full', 'QuotaExceededError') } }
    expect(saveWorkspace(storage, fallback)).toMatchObject({ ok: false, code: 'quota' })
  })

  it('clears only demo keys and can undo the removal', () => {
    const data = new Map([['other-app', 'keep'], [storageKey('agencia'), JSON.stringify(fallback)], [ACTIVE_SCENARIO_KEY, 'agencia']])
    const storage = { get length() { return data.size }, key: (index: number) => [...data.keys()][index] ?? null, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value) }, removeItem: (key: string) => { data.delete(key) } }
    const snapshot = createStorageSnapshot(storage)
    expect(snapshot.ok).toBe(true)
    expect(clearAllDemoData(storage).ok).toBe(true)
    expect([...data.keys()]).toEqual(['other-app'])
    if (snapshot.ok) expect(restoreStorageSnapshot(storage, snapshot.value).ok).toBe(true)
    expect(data.get(storageKey('agencia'))).toBe(JSON.stringify(fallback))
  })
})
