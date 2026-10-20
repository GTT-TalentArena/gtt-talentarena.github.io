"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { defaultType, typesets, typeStorageKey, type TypesetId } from "@/lib/typesets"
import { Arrow } from "@/components/icons"

export function applyType(id: TypesetId) {
  const set = () => document.documentElement.setAttribute("data-type", id)
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> }
  }
  if (doc.startViewTransition && !reduce) {
    // Si el navegador cancela la animación, la tipografía ya está aplicada: ignoramos el aviso.
    const vt = doc.startViewTransition(set)
    vt.ready.catch(() => {})
    vt.finished.catch(() => {})
  } else set()
  try {
    localStorage.setItem(typeStorageKey, id)
  } catch {}
  window.dispatchEvent(new CustomEvent("gtt:type", { detail: id }))
}

/** Selector flotante de tipografía; solo hasta el lanzamiento (ver lib/launch.ts). */
export function TypeSwitcher() {
  const [current, setCurrent] = useState<TypesetId>(defaultType)
  const [open, setOpen] = useState(false)
  const [framed, setFramed] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    setFramed(window.self !== window.top)
    const read = () => {
      const t = document.documentElement.getAttribute("data-type") as TypesetId | null
      if (t && typesets.some((x) => x.id === t)) setCurrent(t)
    }
    read()
    window.addEventListener("gtt:type", read)
    return () => window.removeEventListener("gtt:type", read)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    const onClick = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false)
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onClick)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onClick)
    }
  }, [open])

  const active = typesets.find((t) => t.id === current) ?? typesets[0]

  // las previews del README se capturan sin el selector encima
  if (framed || pathname.startsWith("/previews")) return null

  return (
    <div ref={root} className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <div
        id="type-picker"
        role="dialog"
        aria-label="Choose a typeface"
        className={`absolute bottom-full right-0 mb-2 flex max-h-[min(36rem,calc(100svh-6rem))] w-[min(24rem,calc(100vw-2rem))] origin-bottom-right flex-col rounded-[22px] border border-line bg-paper p-2 text-ink shadow-[0_24px_60px_-12px_rgb(0_0_0/0.35)] transition-[opacity,transform,visibility] duration-300 ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <div className="px-3 pb-2 pt-3">
          <p className="label text-muted">Choose a typeface</p>
          <p className="mt-1 text-sm text-muted">Team vote: try each one on the real site.</p>
        </div>
        <ul className="-mx-0.5 space-y-0.5 overflow-y-auto px-0.5">
          {typesets.map((t, i) => {
            const selected = t.id === current
            return (
              <li key={t.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    applyType(t.id)
                    setCurrent(t.id)
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                    selected ? "bg-paper-2" : "hover:bg-paper-2/60"
                  }`}
                >
                  <span className="label w-5 shrink-0 text-accent">{String(i).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xl leading-tight" style={{ fontFamily: t.display }}>
                      {t.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.75rem] text-muted">
                      {t.fonts.display} · {t.fonts.accent}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className={`grid size-5 shrink-0 place-items-center rounded-full border text-[0.7rem] ${
                      selected ? "border-ink bg-ink text-paper" : "border-line"
                    }`}
                  >
                    {selected && "✓"}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <Link
          href="/type"
          onClick={() => setOpen(false)}
          className="label group mt-2 flex items-center justify-between rounded-2xl border-t border-line px-3 pb-2 pt-3 text-muted hover:text-ink"
        >
          Compare them side by side
          <Arrow className="size-3 transition-transform duration-500 group-hover:rotate-45" />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="type-picker"
        className="flex items-center gap-2.5 rounded-full border border-paper/15 bg-ink py-2 pl-3 pr-4 text-sm text-paper shadow-[0_12px_30px_-10px_rgb(0_0_0/0.45)] transition-transform hover:-translate-y-0.5"
      >
        <span aria-hidden className="text-lg leading-none" style={{ fontFamily: active.display }}>
          Aa
        </span>
        <span>
          Type: <strong className="font-semibold">{active.name}</strong>
        </span>
        <svg viewBox="0 0 12 12" className={`size-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden>
          <path d="M3 7.5 6 4.5l3 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
