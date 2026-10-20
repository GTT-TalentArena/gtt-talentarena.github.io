export function Arrow({ className = "size-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path d="M3 9 9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowDown({ className = "size-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" className={className} aria-hidden>
      <path d="M6 2v8M2.5 6.5 6 10l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Círculo central con la línea de medio campo: separador de la banda. */
export function CenterSpot({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 1v22" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.8" fill="currentColor" />
    </svg>
  )
}

/** Punto blaugrana: la marca mínima de GTT (balón partido en blau y grana). */
export function Dot({ className = "size-2" }: { className?: string }) {
  return <span aria-hidden className={`blaugrana inline-block shrink-0 rounded-full ${className}`} />
}
