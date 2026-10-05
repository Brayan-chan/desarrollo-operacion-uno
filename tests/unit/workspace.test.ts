import { describe, expect, it } from 'vitest'
import { scenarios } from '@/data/scenarios'
import { calculateDueState, calculateProjectProgress, changeTaskStatus, createProject, createTask, deleteProject, deleteTask, duplicateTask, moveTask, setProjectArchived, updateTask, validateProject, validateTask } from '@/lib/workspace'

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

  it('validates required project and task fields', () => {
    const workspace = scenarios.agencia.workspace
    const project = workspace.projects[0]
    expect(validateProject({ name: '', description: '', client: null, status: 'Activo', startDate: '2026-10-05', dueDate: '2026-10-04', ownerId: 'missing', color: project.color }, workspace)).toMatchObject({ name: expect.any(String), ownerId: expect.any(String), dueDate: expect.any(String) })
    expect(validateTask({ projectId: 'missing', title: '', description: '', status: 'Pendiente', priority: 'Media', assigneeId: '', dueDate: null, tag: '' }, workspace)).toMatchObject({ projectId: expect.any(String), title: expect.any(String) })
  })

  it('creates, archives and deletes a project without tasks', () => {
    const initial = scenarios.agencia.workspace
    const project = initial.projects[0]
    const created = createProject(initial, { name: ' Nuevo cliente ', description: ' Inicio ', client: null, status: 'Activo', startDate: '2026-10-05', dueDate: '2026-10-12', ownerId: initial.people[0].id, color: project.color })
    const added = created.projects.at(-1)!
    expect(added.name).toBe('Nuevo cliente')
    expect(created.selectedProjectId).toBe(added.id)
    expect(created.activities[0].type).toBe('project.created')
    const archived = setProjectArchived(created, added.id, true)
    expect(archived.projects.at(-1)?.archived).toBe(true)
    expect(archived.selectedProjectId).not.toBe(added.id)
    const deleted = deleteProject(archived, added.id)
    expect(deleted.projects.some((item) => item.id === added.id)).toBe(false)
    expect(deleteProject(initial, project.id)).toBe(initial)
  })

  it('creates, edits, duplicates and deletes a task while recalculating progress', () => {
    const initial = scenarios.agencia.workspace
    const input = { projectId: 'agencia-secundario', title: ' Tarea nueva ', description: 'Detalle', status: 'Pendiente' as const, priority: 'Alta' as const, assigneeId: '', dueDate: null, tag: 'Demo' }
    const created = createTask(initial, input, new Date('2026-10-05T12:00:00.000Z'))
    const added = created.tasks.at(-1)!
    expect(added).toMatchObject({ title: 'Tarea nueva', dueState: 'Sin fecha', assigneeId: '' })
    const edited = updateTask(created, added.id, { ...input, title: 'Terminada', status: 'Completada' }, new Date('2026-10-05T13:00:00.000Z'))
    expect(edited.projects.find((item) => item.id === input.projectId)?.progress).toBeGreaterThan(0)
    expect(edited.activities[0].metadata.fields).toContain('status')
    const duplicated = duplicateTask(edited, added.id)
    expect(duplicated.tasks.at(-1)).toMatchObject({ title: 'Terminada (copia)', status: 'Pendiente' })
    const removed = deleteTask(duplicated, added.id)
    expect(removed.tasks.some((item) => item.id === added.id)).toBe(false)
    expect(removed.activities[0].type).toBe('task.deleted')
  })

  it('moves tasks across columns and reorders within a column', () => {
    const initial = scenarios.agencia.workspace
    const moved = moveTask(initial, 't4', 'Completada', 0, new Date('2026-10-05T12:00:00.000Z'))
    expect(moved.tasks.find((task) => task.id === 't4')).toMatchObject({ status: 'Completada', order: 0, dueState: 'Completada' })
    expect(moved.projects.find((project) => project.id === 'agencia-principal')?.progress).toBe(33)
    expect(moved.activities[0]).toMatchObject({ type: 'task.status_changed', entityId: 't4', metadata: { previousStatus: 'Pendiente', nextStatus: 'Completada', nextOrder: 0 } })
    const reordered = moveTask(initial, 't6', 'Pendiente', 0, new Date('2026-10-05T13:00:00.000Z'))
    expect(reordered.tasks.filter((task) => task.status === 'Pendiente').sort((a, b) => a.order - b.order).map((task) => task.id)).toEqual(['t6', 't4', 't5'])
    expect(reordered.activities[0].description).toContain('reordenó')
    expect(moveTask(reordered, 't6', 'Pendiente', 0)).toBe(reordered)
  })
})
