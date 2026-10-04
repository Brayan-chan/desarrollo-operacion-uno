import { Bell, ChevronDown, Menu, Sparkles } from 'lucide-react'
import type { Person } from '@/types/demo'
import { Avatar } from './avatar'

export function DashboardHeader({ activeView, scenarioLabel, person, onOpenDemo }: { activeView: string; scenarioLabel: string; person: Person; onOpenDemo: () => void }) {
  return (
    <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-[#fbfcfd] px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <button className="grid size-9 place-items-center rounded-lg border border-slate-200 lg:hidden" aria-label="Abrir menú"><Menu size={18} /></button>
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Operación Uno</p><h1 className="text-lg font-semibold tracking-tight">{activeView}</h1></div>
      </div>
      <div className="flex items-center gap-3">
        <button data-tour="scenario-selector" className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 sm:flex" onClick={onOpenDemo}><Sparkles size={14} className="text-[#866bc1]" />{scenarioLabel}<ChevronDown size={14} /></button>
        <button className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100" aria-label="Notificaciones"><Bell size={18} /></button>
        <span aria-label={`Perfil de ${person.name}`}><Avatar person={person} /></span>
      </div>
    </header>
  )
}
