import { describe, expect, it } from 'vitest'
import { canAdvanceTaskTour } from '@/lib/task-tour-steps'

describe('tour práctico de tareas', () => {
  const valid = { title: 'Preparar propuesta', assigneeId: 'ana', dueDate: '2099-12-31', priority: 'Alta' }

  it('bloquea los pasos hasta completar sus datos', () => {
    expect(canAdvanceTaskTour(1, { ...valid, title: '  ' })).toBe(false)
    expect(canAdvanceTaskTour(2, { ...valid, assigneeId: '' })).toBe(false)
    expect(canAdvanceTaskTour(3, { ...valid, dueDate: '' })).toBe(false)
    expect(canAdvanceTaskTour(4, { ...valid, priority: '' })).toBe(false)
    expect(canAdvanceTaskTour(5, { ...valid, assigneeId: '' })).toBe(false)
    expect(canAdvanceTaskTour(5, valid)).toBe(true)
  })
})
