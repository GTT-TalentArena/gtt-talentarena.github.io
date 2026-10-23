"use client"

import { useEffect, useRef, useState } from "react"

const sections = [
  { id: "challenge", n: "01", label: "Challenge" },
  { id: "squad", n: "02", label: "Squad" },
  { id: "approach", n: "03", label: "Approach" },
  { id: "fixtures", n: "04", label: "Fixtures" },
  { id: "follow", n: "05", label: "Follow" },
]

/**
 * Home page index: stays fixed under the header and marks the section you're in.
 * The top bar switches view (Team / Log); this index only moves within this one.
 * On mobile it fits whole: sections are numbers and only the active one shows its name.
 */
export function SectionIndex() {
  const [active, setActive] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const list = useRef<HTMLOListElement>(null)

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

  // in case it doesn't fit (very narrow screens or large text): the active one always in view
  useEffect(() => {
    const ol = list.current
    const li = ol?.querySelector<HTMLElement>("[aria-current]")
    if (!ol || !li || ol.scrollWidth <= ol.clientWidth) return
    ol.scrollTo({ left: li.offsetLeft - (ol.clientWidth - li.offsetWidth) / 2, behavior: "smooth" })
  }, [active])

  return (
    <nav aria-label="On this page" className="sticky top-16 z-40 border-y border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-10">
        <span className="label hidden shrink-0 text-muted md:block">On this page</span>
        <ol
          ref={list}
          className="-mx-1 flex flex-1 items-center justify-between gap-1 overflow-x-auto py-1.5 [scrollbar-width:none] sm:justify-end sm:py-2 [&::-webkit-scrollbar]:hidden"
        >
          {sections.map((s) => {
            const on = active === s.id
            return (
              <li key={s.id} className="shrink-0">
                <a
                  href={`#${s.id}`}
                  aria-current={on ? "location" : undefined}
                  className="flex min-h-9 min-w-9 items-center justify-center gap-1.5 rounded-full px-3 text-sm text-ink/70 transition-colors hover:text-ink aria-[current=location]:bg-ink aria-[current=location]:text-paper"
                >
                  <span className={`label text-[0.62rem] ${on ? "text-paper/60" : "text-accent"}`}>{s.n}</span>
                  {/* on mobile only the active one's name shows; the others are left for screen readers */}
                  <span className={on ? "" : "sr-only sm:not-sr-only"}>{s.label}</span>
                </a>
              </li>
            )
          })}
        </ol>
      </div>
      <span aria-hidden className="absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent" style={{ transform: `scaleX(${progress})` }} />
    </nav>
  )
}
