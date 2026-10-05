import { describe, expect, it } from 'vitest'
import { scenarios } from '@/data/scenarios'
import { formatActivityDateMX, formatDateMX, getProjectMetrics } from '@/lib/metrics'

describe('real project metrics', () => {
  it('counts statuses precisely and calculates progress for the selected project', () => {
    const workspace = scenarios.agencia.workspace
    expect(getProjectMetrics(workspace.projects, workspace.tasks, 'agencia-principal', '2026-10-05')).toMatchObject({ activeProjects: 1, pending: 3, inProgress: 2, completed: 1, total: 6, progress: 17 })
  })

  it('returns zero progress for a project without tasks and excludes completed overdue tasks', () => {
    const workspace = scenarios.agencia.workspace
    const empty = getProjectMetrics(workspace.projects, workspace.tasks, 'agencia-secundario', '2026-10-05')
    expect(empty).toMatchObject({ total: 0, progress: 0, overdue: 0 })
    expect(Number.isFinite(empty.progress)).toBe(true)
    const overdue = getProjectMetrics(workspace.projects, [{ ...workspace.tasks[0], status: 'Pendiente', dueDate: '2026-10-04' }, { ...workspace.tasks[1], status: 'Completada', dueDate: '2026-10-04' }], 'agencia-principal', '2026-10-05')
    expect(overdue.overdue).toBe(1)
  })

  it('formats Mexican dates and labels activity by calendar day', () => {
    expect(formatDateMX('2026-10-05')).toContain('octubre')
    expect(formatActivityDateMX('2026-10-05T16:00:00.000Z', '2026-10-05')).toMatch(/^Hoy,/)
    expect(formatActivityDateMX('2026-10-04T16:00:00.000Z', '2026-10-05')).toMatch(/^Ayer,/)
    expect(formatActivityDateMX('2026-09-28T16:00:00.000Z', '2026-10-05')).toContain('septiembre')
  })
})
