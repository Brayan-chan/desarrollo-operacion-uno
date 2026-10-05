'use client'

import { useEffect, useRef } from 'react'

export function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: { title: string; description: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null)
  useEffect(() => { cancelRef.current?.focus() }, [])
  return <div className="fixed inset-0 z-[60] grid place-items-center bg-[#172331]/50 p-4"><div role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-description" onKeyDown={(event) => { if (event.key === 'Escape') onCancel() }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 id="confirm-title" className="text-xl font-semibold">{title}</h2><p id="confirm-description" className="mt-3 text-sm leading-6 text-slate-600">{description}</p><div className="mt-6 flex justify-end gap-2"><button ref={cancelRef} onClick={onCancel} className="min-h-11 rounded-lg border border-slate-200 px-4 text-sm">Cancelar</button><button onClick={onConfirm} className="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-semibold text-white">{confirmLabel}</button></div></div></div>
}
