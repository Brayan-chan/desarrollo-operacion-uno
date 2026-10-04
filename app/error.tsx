'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCcw } from 'lucide-react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return <main className="grid min-h-screen place-items-center bg-[#f6f7f9] p-6 text-[#182230]"><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"><div className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-amber-50 text-amber-700"><AlertTriangle size={22} /></div><h1 className="text-2xl font-semibold">No pudimos cargar la demo</h1><p className="mt-3 text-sm leading-6 text-slate-500">Tus datos siguen guardados en este navegador. Intenta cargar el espacio de trabajo nuevamente.</p><button onClick={reset} className="mx-auto mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#192735] px-4 text-sm font-semibold text-white"><RefreshCcw size={16} />Intentar de nuevo</button></section></main>
}
