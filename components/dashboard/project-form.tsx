'use client'

import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { getLocalDate, validateProject, type FieldErrors, type ProjectInput } from '@/lib/workspace'
import type { Project, Workspace } from '@/types/demo'

export function ProjectForm({ project, workspace, onSave, onCancel }: { project?: Project; workspace: Workspace; onSave: (input: ProjectInput) => void; onCancel: () => void }) {
  const [form, setForm] = useState<ProjectInput>({ name: project?.name ?? '', description: project?.description ?? '', client: project?.client ?? '', status: project?.status ?? 'Activo', startDate: project?.startDate ?? getLocalDate(), dueDate: project?.dueDate ?? '', ownerId: project?.ownerId ?? workspace.people.find((person) => person.active)?.id ?? '', color: project?.color ?? '#8d72c9' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const set = <K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => ({ ...current, [key]: '' })) }
  const submit = (event: FormEvent) => { event.preventDefault(); const next = validateProject(form, workspace); setErrors(next); if (!Object.keys(next).length) onSave(form) }
  const people = workspace.people.filter((person) => person.active)
  const inputClass = 'mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm focus:border-[#8065bb] focus:outline-none'

  return <div className="fixed inset-0 z-50 grid place-items-center bg-[#172331]/40 p-3 sm:p-6">
    <section role="dialog" aria-modal="true" aria-labelledby="project-form-title" className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-5 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-widest text-[#694ba8]">Proyecto</p><h2 id="project-form-title" className="mt-1 text-xl font-semibold">{project ? 'Editar proyecto' : 'Nuevo proyecto'}</h2></div><button type="button" onClick={onCancel} aria-label="Cerrar formulario de proyecto" className="grid size-10 place-items-center rounded-lg hover:bg-slate-100"><X size={18} /></button></div>
      <form data-tour="project-form" onSubmit={submit} noValidate className="space-y-4">
        <label className="block text-sm font-medium">Nombre *<input data-tour="project-name" autoFocus className={inputClass} value={form.name} onChange={(event) => set('name', event.target.value)} aria-invalid={Boolean(errors.name)} />{errors.name && <span className="mt-1 block text-xs text-red-700">{errors.name}</span>}</label>
        <label className="block text-sm font-medium">Descripción<textarea className={`${inputClass} min-h-24 py-3`} value={form.description} onChange={(event) => set('description', event.target.value)} /></label>
        <label className="block text-sm font-medium">Cliente opcional<input className={inputClass} value={form.client ?? ''} onChange={(event) => set('client', event.target.value)} /></label>
        <div data-tour="project-fields" className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Responsable *<select data-tour="project-owner" className={inputClass} value={form.ownerId} onChange={(event) => set('ownerId', event.target.value)}><option value="">Seleccionar</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select>{errors.ownerId && <span className="mt-1 block text-xs text-red-700">{errors.ownerId}</span>}</label>
          <label className="block text-sm font-medium">Estado<select className={inputClass} value={form.status} onChange={(event) => set('status', event.target.value as ProjectInput['status'])}>{['Planeación', 'Activo', 'En pausa', 'Completado'].map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="block text-sm font-medium">Fecha de inicio *<input data-tour="project-start-date" type="date" className={inputClass} value={form.startDate} onChange={(event) => set('startDate', event.target.value)} />{errors.startDate && <span className="mt-1 block text-xs text-red-700">{errors.startDate}</span>}</label>
          <label className="block text-sm font-medium">Fecha de entrega *<input data-tour="project-due-date" type="date" className={inputClass} value={form.dueDate} onChange={(event) => set('dueDate', event.target.value)} />{errors.dueDate && <span className="mt-1 block text-xs text-red-700">{errors.dueDate}</span>}</label>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium">Identificador visual<input type="color" className="size-10 cursor-pointer rounded border border-slate-200" value={form.color} onChange={(event) => set('color', event.target.value)} /></label>
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onCancel} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm">Cancelar</button><button data-tour="project-save" type="submit" className="min-h-11 rounded-lg bg-[#192735] px-4 text-sm font-semibold text-white">{project ? 'Guardar cambios' : 'Crear proyecto'}</button></div>
      </form>
    </section>
  </div>
}
