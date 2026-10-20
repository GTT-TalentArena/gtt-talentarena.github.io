"use client"

import { useEffect, useState } from "react"
import { logTypes, outcomes, shortDate, type LogType, type Outcome } from "@/lib/log-meta"

type Dot = { slug: string; title: string; date: string; type: LogType; outcome?: Outcome }
type Milestone = { date: string; title: string }

const DAY = 86_400_000
const t = (iso: string) => new Date(`${iso}T12:00:00Z`).getTime()

const tone: Record<Outcome | "none", string> = {
  success: "bg-live",
  failure: "bg-fail",
  mixed: "bg-[#b8a300]",
  open: "bg-paper ring-1 ring-ink",
  none: "bg-ink",
}

/**
 * Cronología: la fase en curso como una pista de días, con los hitos del reto y un punto por
 * entrada del log (color = resultado). «Hoy» se calcula en el navegador.
 */
export function Chronology({ dots, milestones, from, to }: { dots: Dot[]; milestones: Milestone[]; from: string; to: string }) {
  const [today, setToday] = useState<string | null>(null)
  useEffect(() => {
    setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date()))
  }, [])

  const end = today && today > to ? today : to
  const span = (t(end) - t(from)) / DAY
  const pct = (iso: string) => (((t(iso) - t(from)) / DAY) / span) * 100
  const x = (iso: string) => `${pct(iso)}%`
  const days = Array.from({ length: span + 1 }, (_, i) => new Date(t(from) + i * DAY).toISOString().slice(0, 10))

  // apilar las entradas del mismo día
  const stack = new Map<string, number>()
  const placed = [...dots]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => {
      const level = stack.get(d.date) ?? 0
      stack.set(d.date, level + 1)
      return { ...d, level }
    })

  return (
    <figure className="rounded-2xl border border-line bg-paper-2/60 px-4 pb-4 pt-5 sm:px-6">
      <figcaption className="label flex flex-wrap items-center justify-between gap-2 text-muted">
        <span>
          Chronology · {shortDate(from)} → {shortDate(end)}
        </span>
        <span className="flex flex-wrap items-center gap-3">
          {(Object.keys(outcomes) as Outcome[]).map((o) => (
            <span key={o} className="flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${tone[o]}`} />
              {outcomes[o].label}
            </span>
          ))}
          <span className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${tone.none}`} />
            No outcome
          </span>
        </span>
      </figcaption>

      <div className="relative mx-2 mt-14 h-24">
        {/* hitos */}
        {milestones
          .filter((m) => m.date >= from && m.date <= end)
          .map((m) => (
            <span key={m.title} className="absolute bottom-0 top-[-2.6rem] border-l border-dashed border-ink/40" style={{ left: x(m.date) }}>
              <span
                className={`label absolute top-0 whitespace-nowrap text-[0.6rem] text-muted ${pct(m.date) > 80 ? "right-1.5" : "left-1.5"}`}
              >
                {m.title}
              </span>
            </span>
          ))}

        {/* hoy */}
        {today && today >= from && today <= end && (
          <span className="absolute bottom-0 top-[-0.6rem] w-px bg-accent" style={{ left: x(today) }}>
            <span className="label absolute -left-px top-[-1.1rem] -translate-x-1/2 rounded-full bg-accent px-1.5 py-0.5 text-[0.55rem] text-on-accent">
              Today
            </span>
          </span>
        )}

        {/* entradas */}
        {placed.map((d) => (
          <a
            key={d.slug}
            href={`#${d.slug}`}
            title={`${shortDate(d.date)} · ${logTypes[d.type].label} · ${d.title}`}
            className={`absolute size-3 -translate-x-1/2 rounded-full transition-transform before:absolute before:-inset-2 before:content-[''] hover:scale-150 ${tone[d.outcome ?? "none"]}`}
            style={{ left: x(d.date), bottom: `${1.4 + d.level * 1}rem` }}
          >
            <span className="sr-only">{d.title}</span>
          </a>
        ))}

        {/* pista de días */}
        <div className="absolute inset-x-0 bottom-3 h-px bg-ink/50" />
        {days.map((iso) => {
          const monday = new Date(`${iso}T12:00:00Z`).getUTCDay() === 1
          return (
            <span
              key={iso}
              className={`absolute bottom-3 w-px -translate-x-1/2 ${monday ? "h-2.5 bg-ink" : "h-1.5 bg-ink/40"}`}
              style={{ left: x(iso) }}
            >
              {monday && (
                <span className="label absolute left-0 top-3 -translate-x-1/2 whitespace-nowrap text-[0.55rem] text-muted">
                  {shortDate(iso)}
                </span>
              )}
            </span>
          )
        })}
      </div>
    </figure>
  )
}

/** Filtro por tipo: oculta filas y semanas vacías sin volver a pintar la lista. */
export function TypeFilter({ counts }: { counts: Partial<Record<LogType, number>> }) {
  const [active, setActive] = useState<LogType | "all">("all")

  useEffect(() => {
    const list = document.getElementById("log-list")
    if (!list) return
    list.querySelectorAll<HTMLElement>("[data-week]").forEach((week) => {
      let visible = 0
      week.querySelectorAll<HTMLElement>("[data-entry-type]").forEach((row) => {
        const show = active === "all" || row.dataset.entryType === active
        row.hidden = !show
        if (show) visible++
      })
      week.hidden = visible === 0
    })
  }, [active])

  const total = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0)
  const options: { id: LogType | "all"; label: string; n: number }[] = [
    { id: "all", label: "All", n: total },
    ...(Object.keys(logTypes) as LogType[]).map((id) => ({ id, label: logTypes[id].label, n: counts[id] ?? 0 })),
  ]

  return (
    <div role="toolbar" aria-label="Filter by type" className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={active === o.id}
          disabled={o.n === 0}
          onClick={() => setActive(o.id)}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-35 max-sm:disabled:hidden ${
            active === o.id ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"
          }`}
        >
          {o.label} <span className="font-mono text-xs opacity-60">{o.n}</span>
        </button>
      ))}
    </div>
  )
}
