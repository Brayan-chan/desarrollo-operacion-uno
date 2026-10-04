import { describe, expect, it } from 'vitest'
import { baseTasks } from '@/data/scenarios'
import { parseStoredTasks, storageKey } from '@/lib/demo-storage'

describe('demo storage', () => {
  it('builds an isolated key for each scenario', () => {
    expect(storageKey('agencia')).toBe('operacion-uno-agencia')
    expect(storageKey('software')).toBe('operacion-uno-software')
  })

  it('parses valid tasks', () => {
    expect(parseStoredTasks(JSON.stringify(baseTasks))).toEqual(baseTasks)
  })

  it('returns null when there is no saved value', () => {
    expect(parseStoredTasks(null)).toBeNull()
  })

  it('rejects malformed saved data', () => {
    expect(() => parseStoredTasks('{"unexpected":true}')).toThrow('formato válido')
    expect(() => parseStoredTasks('invalid-json')).toThrow()
  })
})
