import { describe, expect, it } from 'vitest'
import { canAdvanceProjectTour } from '@/lib/project-tour-steps'

describe('guided project creation', () => {
  const valid = { name: 'Proyecto nuevo', ownerId: 'ana', startDate: '2026-10-06', dueDate: '2026-10-20' }

  it('blocks advancement until each required field is valid', () => {
    expect(canAdvanceProjectTour(1, { ...valid, name: ' ' })).toBe(false)
    expect(canAdvanceProjectTour(2, { ...valid, ownerId: '' })).toBe(false)
    expect(canAdvanceProjectTour(3, { ...valid, dueDate: '' })).toBe(false)
    expect(canAdvanceProjectTour(3, { ...valid, dueDate: '2026-10-05' })).toBe(false)
    expect(canAdvanceProjectTour(4, { ...valid, name: '' })).toBe(false)
    expect(canAdvanceProjectTour(4, valid)).toBe(true)
  })
})
