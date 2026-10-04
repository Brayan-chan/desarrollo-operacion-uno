import { AlertTriangle, X } from 'lucide-react'

export function StorageAlert({ message, onDismiss, onRestore }: { message: string; onDismiss: () => void; onRestore: () => void }) {
  return (
    <div role="alert" className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0" size={18} /><p className="text-sm leading-5">{message}</p></div>
      <div className="flex items-center gap-2"><button onClick={onRestore} className="rounded-lg bg-amber-950 px-3 py-2 text-xs font-semibold text-white">Restaurar</button><button onClick={onDismiss} className="grid size-9 place-items-center rounded-lg hover:bg-amber-100" aria-label="Cerrar aviso"><X size={16} /></button></div>
    </div>
  )
}
