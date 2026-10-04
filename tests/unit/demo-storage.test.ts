import { describe, expect, it } from 'vitest'
import { scenarios } from '@/data/scenarios'
import { ACTIVE_SCENARIO_KEY, parseStoredWorkspace, readActiveScenario, storageKey } from '@/lib/demo-storage'

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
    expect(migrated?.version).toBe(1)
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
})
