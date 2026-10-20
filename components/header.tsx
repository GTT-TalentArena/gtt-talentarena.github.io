"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { site } from "@/lib/content"
import { Arrow, Dot } from "@/components/icons"

const links = [
  { href: "/#challenge", label: "Challenge" },
  { href: "/#squad", label: "Squad" },
  { href: "/#approach", label: "Approach" },
  { href: "/#fixtures", label: "Fixtures" },
  { href: "/log", label: "Log" },
]

export function Logo({ size = "1.9rem" }: { size?: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <span className="accent leading-none" style={{ ["--accent-base" as string]: size }}>
        gtt
      </span>
      <Dot className="size-2 transition-transform duration-500 group-hover:scale-150" />
    </span>
  )
}

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        scrolled && !open ? "border-b border-line bg-paper/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        <Link href="/" className="group relative z-10" aria-label="GTT — home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 rounded-full border border-line bg-paper/60 p-1 backdrop-blur">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={pathname.startsWith(l.href) ? "page" : undefined}
                  className="block rounded-full px-4 py-1.5 text-sm text-ink/75 transition-colors hover:bg-ink hover:text-paper aria-[current=page]:bg-ink aria-[current=page]:text-paper"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative z-10 flex items-center gap-2">
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            className="group hidden items-center gap-2 rounded-full bg-ink py-2 pl-4 pr-2 text-sm text-paper transition-colors hover:bg-accent hover:text-on-accent sm:inline-flex"
          >
            GitHub
            <span className="grid size-6 place-items-center rounded-full bg-paper text-ink transition-transform duration-500 group-hover:rotate-45">
              <Arrow />
            </span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-full border border-line md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-px w-4 bg-current transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`fixed inset-0 bg-paper transition-[opacity,visibility] duration-500 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="flex h-full flex-col justify-between px-4 pb-10 pt-24">
          <ul className="space-y-1">
            {[...links, { href: site.github, label: "GitHub" }].map((l, i) => (
              <li key={l.href} className="overflow-hidden">
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`font-display-tight block py-1 text-[3.4rem] transition-transform duration-700 ${open ? "translate-y-0" : "translate-y-full"}`}
                  style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="label text-muted">Barcelona · More than a Hack 2027</p>
        </nav>
      </div>
    </header>
  )
}
