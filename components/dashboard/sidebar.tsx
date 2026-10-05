import { BarChart3, CalendarDays, ClipboardList, FolderKanban, LayoutDashboard, Settings2, Sparkles, Users } from 'lucide-react'

export const navigation = [
  { icon: LayoutDashboard, label: 'Inicio' },
  { icon: FolderKanban, label: 'Proyectos' },
  { icon: ClipboardList, label: 'Tareas' },
  { icon: CalendarDays, label: 'Calendario' },
  { icon: Users, label: 'Equipo' },
  { icon: BarChart3, label: 'Reportes' },
]

export function Sidebar({ activeView, onNavigate, onOpenDemo, mobile = false, onClose }: { activeView: string; onNavigate: (view: string) => void; onOpenDemo: () => void; mobile?: boolean; onClose?: () => void }) {
  return (
    <aside className={mobile ? 'fixed inset-y-0 left-0 z-[70] flex w-72 flex-col border-r border-slate-200 bg-[#fbfcfd] p-5 shadow-2xl lg:hidden' : 'hidden w-[82px] shrink-0 flex-col items-center border-r border-slate-200 bg-[#fbfcfd] py-5 lg:flex'}>
      <div className="mb-9 grid size-10 place-items-center rounded-xl bg-[#192735] text-white shadow-sm" aria-label="Operación Uno"><Sparkles size={19} /></div>
      {mobile && <button onClick={onClose} className="absolute right-5 top-5 rounded-lg border border-slate-200 px-3 py-2 text-sm">Cerrar menú</button>}
      <nav aria-label="Navegación principal" className={`flex flex-1 flex-col gap-4 ${mobile ? 'items-stretch' : 'items-center'}`}>
        {navigation.map(({ icon: Icon, label }) => (
          <button key={label} onClick={() => { onNavigate(label); onClose?.() }} aria-label={label} aria-current={activeView === label ? 'page' : undefined} title={label} className={`flex min-h-10 items-center rounded-xl transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8065bb] ${mobile ? 'gap-3 px-3' : 'w-10 justify-center'} ${activeView === label ? 'bg-[#edf0f3] text-[#192735]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}>
            <Icon size={18} />{mobile && <span className="text-sm font-medium">{label}</span>}
          </button>
        ))}
      </nav>
      <button onClick={() => { onNavigate('Configuración'); onClose?.() }} className={`flex min-h-10 items-center rounded-xl text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8065bb] ${mobile ? 'gap-3 px-3' : 'w-10 justify-center'}`} aria-label="Configuración" title="Configuración"><Settings2 size={18} />{mobile && <span className="text-sm font-medium">Configuración</span>}</button>
      {mobile && <button onClick={() => { onOpenDemo(); onClose?.() }} className="mt-3 rounded-lg bg-[#694ba8] px-3 py-2 text-sm font-semibold text-white">Centro de demostración</button>}
    </aside>
  )
}
