import { describe, expect, it } from 'vitest'
import { scenarios } from '@/data/scenarios'
import { calculateDueState, calculateProjectProgress, changeTaskStatus } from '@/lib/workspace'

describe('workspace domain', () => {
  it('calculates task due state', () => {
    expect(calculateDueState({ status: 'Pendiente', dueDate: null }, '2026-10-04')).toBe('Sin fecha')
    expect(calculateDueState({ status: 'Pendiente', dueDate: '2026-10-03' }, '2026-10-04')).toBe('Vencida')
    expect(calculateDueState({ status: 'Pendiente', dueDate: '2026-10-04' }, '2026-10-04')).toBe('Vence hoy')
    expect(calculateDueState({ status: 'Completada', dueDate: '2026-10-01' }, '2026-10-04')).toBe('Completada')
  })

  it('calculates project progress from related tasks only', () => {
    const workspace = scenarios.agencia.workspace
    expect(calculateProjectProgress('agencia-principal', workspace.tasks)).toBe(17)
    expect(calculateProjectProgress('agencia-secundario', workspace.tasks)).toBe(0)
  })

  it('updates timestamps, progress, due state and activity together', () => {
    const workspace = scenarios.agencia.workspace
    const changed = changeTaskStatus(workspace, 't2', 'Completada', new Date('2026-10-04T18:00:00.000Z'))
    expect(changed.updatedAt).toBe('2026-10-04T18:00:00.000Z')
    expect(changed.tasks.find((task) => task.id === 't2')).toMatchObject({ status: 'Completada', dueState: 'Completada' })
    expect(changed.projects.find((project) => project.id === 'agencia-principal')?.progress).toBe(33)
    expect(changed.activities[0]).toMatchObject({ type: 'task.status_changed', entityId: 't2', actorId: 'carlos', metadata: { previousStatus: 'En progreso', nextStatus: 'Completada' } })
  })
})
