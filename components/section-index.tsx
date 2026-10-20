"use client"

import { useEffect, useState } from "react"

const sections = [
  { id: "challenge", n: "01", label: "Challenge" },
  { id: "squad", n: "02", label: "Squad" },
  { id: "approach", n: "03", label: "Approach" },
  { id: "fixtures", n: "04", label: "Fixtures" },
  { id: "follow", n: "05", label: "Follow" },
]

/**
 * Índice de la portada: se queda fijo bajo la cabecera y marca la sección en la que estás.
 * La barra de arriba cambia de vista (Team / Log); este índice solo se mueve dentro de esta.
 */
export function SectionIndex() {
  const [active, setActive] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => Boolean(e))
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: "-40% 0px -55% 0px" },
    )
    els.forEach((e) => io.observe(e))

    const onScroll = () => {
      const first = els[0]
      if (!first) return
      const start = first.offsetTop - window.innerHeight * 0.4
      const end = document.documentElement.scrollHeight - window.innerHeight
      setProgress(Math.min(1, Math.max(0, (window.scrollY - start) / (end - start))))
      if (window.scrollY < start) setActive(null)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  return (
    <nav aria-label="On this page" className="sticky top-16 z-40 border-y border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <span className="label hidden shrink-0 text-muted md:block">On this page</span>
        <ol className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto py-2 [scrollbar-width:none] md:justify-end [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? "location" : undefined}
                className="flex items-baseline gap-1.5 rounded-full px-3 py-1.5 text-sm text-ink/70 transition-colors hover:text-ink aria-[current=location]:bg-ink aria-[current=location]:text-paper"
              >
                <span className={`label text-[0.62rem] ${active === s.id ? "text-paper/60" : "text-accent"}`}>{s.n}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent" style={{ transform: `scaleX(${progress})` }} />
    </nav>
  )
}
