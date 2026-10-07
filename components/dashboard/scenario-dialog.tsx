'use client'

import { useState } from 'react'
import { ArrowRight, FolderPlus, Play, RefreshCcw, X } from 'lucide-react'
import { scenarios } from '@/data/scenarios'
import { readScenarioStorageInfo, type ScenarioStorageInfo } from '@/lib/demo-storage'
import type { ScenarioKey } from '@/types/demo'

const keys = Object.keys(scenarios) as ScenarioKey[]
const workflow: Record<ScenarioKey, string> = {
  agencia: 'Brief → contenido → revisión → entrega',
  despacho: 'Recepción → análisis → informe → aprobación',
  software: 'Requerimientos → diseño → desarrollo → QA',
  construccion: 'Presupuesto → compras → ejecución → inspección',
  operacion: 'Planeación → asignación → seguimiento → cierre',
}
const included = ['Proyectos y tareas editables', 'Tablero Kanban y responsables', 'Fechas, prioridades y progreso', 'Actividad y datos locales', 'Recorridos guiados']
const future = ['Aprobaciones y permisos por rol', 'Archivos adjuntos', 'Notificaciones automáticas', 'Reportes avanzados de productividad']

type Props = {
  current: ScenarioKey
  onSelect: (key: ScenarioKey, reset: boolean) => void
  onClose: () => void
  onCreateProject: () => void
  onRestore: () => void
  onRestoreAll: () => void
  onClearAll: () => void
  onRestartTour: () => void
  onStartProjectTour: () => void
  onStartTaskTour: () => void
  canStartTask: boolean
}

function readSummaries(): Record<ScenarioKey, ScenarioStorageInfo> {
  try { return Object.fromEntries(keys.map((key) => [key, readScenarioStorageInfo(window.localStorage, key, scenarios[key].workspace)])) as Record<ScenarioKey, ScenarioStorageInfo> }
  catch { return Object.fromEntries(keys.map((key) => [key, { state: 'unavailable', projects: 0, tasks: 0, people: 0, activities: 0, updatedAt: null }])) as Record<ScenarioKey, ScenarioStorageInfo> }
}

export function ScenarioDialog({ current, onSelect, onClose, onCreateProject, onRestore, onRestoreAll, onClearAll, onRestartTour, onStartProjectTour, onStartTaskTour, canStartTask }: Props) {
  const [preview, setPreview] = useState<ScenarioKey>(current)
  const [resetOnEntry, setResetOnEntry] = useState(false)
  const [summaries] = useState<Record<ScenarioKey, ScenarioStorageInfo>>(() => readSummaries())
  const selected = scenarios[preview]
  const saved = summaries[preview]
  const hasSavedData = saved.state === 'saved'
  const savedDate = saved.updatedAt && !Number.isNaN(Date.parse(saved.updatedAt)) ? new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(saved.updatedAt)) : null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#172331]/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="scenario-title" onKeyDown={(event) => { if (event.key === 'Escape') onClose() }} className="max-h-[96vh] w-full max-w-5xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#694ba8]">Centro de demostración</p><h2 id="scenario-title" className="text-2xl font-semibold tracking-tight">Explora Operación Uno</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Cada industria muestra un ejemplo distinto de proyectos y tareas. Puedes previsualizarla antes de cambiar; los datos de cada escenario se guardan por separado en este navegador.</p></div>
          <button onClick={onClose} className="grid size-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100" aria-label="Cerrar centro de demostración"><X size={18} /></button>
        </div>

        <section aria-labelledby="industry-heading">
          <div className="mb-3"><h3 id="industry-heading" className="text-base font-semibold">Cambiar industria</h3><p className="mt-1 text-xs text-slate-500">Cambia los proyectos de ejemplo, sus tareas, personas y actividad visible. Tus otros escenarios no se sobrescriben.</p></div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.9fr)]">
            <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Escenarios disponibles">
              {keys.map((key) => {
                const info = summaries[key]
                return <button key={key} type="button" onClick={() => { setPreview(key); setResetOnEntry(false) }} aria-pressed={preview === key} className={`rounded-xl border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-[#694ba8] ${preview === key ? 'border-[#8d72c9] bg-[#f8f5ff] shadow-sm' : 'border-slate-200 hover:border-[#bba8e2]'}`}>
                  <span className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{scenarios[key].label}</span>{key === current && <span className="rounded-full bg-[#e9e0f8] px-2 py-0.5 text-[10px] font-semibold text-[#694ba8]">Actual</span>}</span>
                  <span className="mt-2 block text-xs leading-5 text-slate-600">{workflow[key]}</span>
                  <span className="mt-3 block text-[11px] font-medium text-slate-500">{info.state === 'saved' ? `${info.projects} proyectos · ${info.tasks} tareas guardadas` : info.state === 'example' ? 'Sin cambios guardados; incluye datos de ejemplo' : 'Datos locales no disponibles'}</span>
                </button>
              })}
            </div>
            <div className="rounded-xl border border-[#ddd2f3] bg-[#faf8ff] p-5" aria-live="polite">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#694ba8]">Vista previa · {selected.label}</p>
              <h4 className="mt-2 text-lg font-semibold">{selected.workspace.projects[0]?.name}</h4>
              <p className="mt-2 text-xs leading-5 text-slate-600">{selected.description}</p>
              <p className="mt-4 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700">{workflow[preview]}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg bg-white p-3"><strong className="block text-lg">{saved.projects}</strong>Proyectos</div><div className="rounded-lg bg-white p-3"><strong className="block text-lg">{saved.tasks}</strong>Tareas</div><div className="rounded-lg bg-white p-3"><strong className="block text-lg">{saved.people}</strong>Personas</div><div className="rounded-lg bg-white p-3"><strong className="block text-lg">{saved.activities}</strong>Eventos de actividad</div></div>
              <p className="mt-3 text-[11px] text-slate-600">{hasSavedData ? `Guardado en este navegador${savedDate ? ` · última modificación ${savedDate}` : ''}.` : saved.state === 'example' ? 'Se cargarán los datos de ejemplo. Todavía no hay cambios guardados para este escenario.' : 'No pudimos leer los datos de este escenario. Puedes reiniciarlo para recuperar el ejemplo.'}</p>
              <fieldset className="mt-4 space-y-2 border-t border-[#e4daf5] pt-4"><legend className="text-xs font-semibold">Al entrar en este escenario</legend><label className="flex items-start gap-2 text-xs"><input type="radio" name="scenario-data-choice" checked={!resetOnEntry} onChange={() => setResetOnEntry(false)} className="mt-0.5 accent-[#694ba8]" />Conservar sus datos guardados</label><label className="flex items-start gap-2 text-xs"><input type="radio" name="scenario-data-choice" checked={resetOnEntry} onChange={() => setResetOnEntry(true)} className="mt-0.5 accent-[#694ba8]" />Reiniciarlo con los datos de ejemplo</label></fieldset>
              <button onClick={() => onSelect(preview, resetOnEntry)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#694ba8] px-4 text-sm font-semibold text-white hover:bg-[#5c4098]">{resetOnEntry ? 'Confirmar reinicio y entrar' : preview === current ? 'Continuar en este escenario' : 'Entrar en este escenario'}<ArrowRight size={15} /></button>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section aria-labelledby="project-demo-heading" className="rounded-xl border border-slate-200 p-4"><h3 id="project-demo-heading" className="text-sm font-semibold">Crear proyecto</h3><p className="mt-1 text-xs leading-5 text-slate-500">Añade un proyecto propio al escenario actual, sin cambiar de industria.</p><button onClick={onCreateProject} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold"><FolderPlus size={15} />Crear proyecto</button></section>
          <section aria-labelledby="tour-demo-heading" className="rounded-xl border border-slate-200 p-4"><h3 id="tour-demo-heading" className="text-sm font-semibold">Recorridos guiados</h3><p className="mt-1 text-xs leading-5 text-slate-500">Conoce el tablero o practica creando datos reales.</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={onRestartTour} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#192735] px-3 text-xs font-semibold text-white"><Play size={13} />Iniciar recorrido</button><button onClick={onStartProjectTour} className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium">Crear proyecto con guía</button><button onClick={onStartTaskTour} disabled={!canStartTask} title={!canStartTask ? 'Selecciona un proyecto activo para iniciar esta guía.' : undefined} className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50">Gestionar tarea con guía</button></div></section>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2"><section aria-labelledby="included-heading" className="rounded-xl bg-emerald-50 p-4"><h3 id="included-heading" className="text-sm font-semibold text-emerald-950">Funciona en esta demo</h3><ul className="mt-2 space-y-1 text-xs text-emerald-900">{included.map((item) => <li key={item}>✓ {item}</li>)}</ul></section><section aria-labelledby="future-heading" className="rounded-xl bg-slate-50 p-4"><h3 id="future-heading" className="text-sm font-semibold">Posibles ampliaciones, no incluidas aún</h3><ul className="mt-2 space-y-1 text-xs text-slate-600">{future.map((item) => <li key={item}>· {item}</li>)}</ul></section></div>

        <section aria-labelledby="data-heading" className="mt-4 rounded-xl border border-slate-200 p-4"><h3 id="data-heading" className="text-sm font-semibold">Tus datos de demostración</h3><p className="mt-1 text-xs leading-5 text-slate-500">Solo se guardan en este navegador. “Este escenario” se refiere al actual: {scenarios[current].label}. Restaurar reemplaza cambios; borrar elimina únicamente los datos locales de Operación Uno. Estas acciones piden confirmación y ofrecen Deshacer.</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={onRestore} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-medium"><RefreshCcw size={13} />Restaurar este escenario</button><button onClick={onRestoreAll} className="min-h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium">Restaurar toda la demo</button><button onClick={onClearAll} className="min-h-10 rounded-lg border border-red-200 px-3 text-xs font-medium text-red-700">Borrar mis datos locales</button></div></section>
      </section>
    </div>
  )
}
