import type { Person } from '@/types/demo'

export function Avatar({ person, small = false }: { person?: Person; small?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${small ? 'size-7 text-[10px]' : 'size-9 text-xs'} shrink-0 items-center justify-center rounded-full font-semibold text-slate-700 ring-2 ring-white ${person?.color ?? 'bg-slate-200'}`}
    >
      {person?.initials ?? '—'}
    </span>
  )
}
