import { BarChart3, CalendarDays, ClipboardList, FolderKanban, LayoutDashboard, Settings2, Sparkles, Users } from 'lucide-react'

const navigation = [
  { icon: LayoutDashboard, label: 'Inicio' },
  { icon: FolderKanban, label: 'Proyectos' },
  { icon: ClipboardList, label: 'Tareas' },
  { icon: CalendarDays, label: 'Calendario' },
  { icon: Users, label: 'Equipo' },
  { icon: BarChart3, label: 'Reportes' },
]

export function Sidebar({ activeView, onNavigate, onOpenDemo }: { activeView: string; onNavigate: (view: string) => void; onOpenDemo: () => void }) {
  return (
    <aside className="hidden w-[82px] shrink-0 flex-col items-center border-r border-slate-200 bg-[#fbfcfd] py-5 lg:flex">
      <div className="mb-9 grid size-10 place-items-center rounded-xl bg-[#192735] text-white shadow-sm" aria-label="Operación Uno"><Sparkles size={19} /></div>
      <nav aria-label="Navegación principal" className="flex flex-1 flex-col items-center gap-4">
        {navigation.map(({ icon: Icon, label }) => (
          <button key={label} onClick={() => onNavigate(label)} aria-label={label} aria-current={activeView === label ? 'page' : undefined} className={`grid size-10 place-items-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8065bb] ${activeView === label ? 'bg-[#edf0f3] text-[#192735]' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}`}>
            <Icon size={18} />
          </button>
        ))}
      </nav>
      <button onClick={onOpenDemo} className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8065bb]" aria-label="Centro de demostración"><Settings2 size={18} /></button>
    </aside>
  )
}
