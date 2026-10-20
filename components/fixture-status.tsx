"use client"

import { useEffect, useState } from "react"

type Status = "played" | "live" | "next" | "upcoming"

const style: Record<Status, string> = {
  played: "border-line text-muted",
  live: "border-transparent bg-live/15 text-ink",
  next: "border-ink text-ink",
  upcoming: "border-line text-muted",
}
const text: Record<Status, string> = { played: "Played", live: "Live", next: "Next", upcoming: "Upcoming" }

/** Estado de cada fecha según el día de hoy en Barcelona; se calcula en el navegador. */
export function FixtureStatus({ start, end }: { start: string; end?: string }) {
  const [status, setStatus] = useState<Status | null>(null)

  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date())
    const last = end ?? start
    if (today > last) setStatus("played")
    else if (today >= start && today <= last && end) setStatus("live")
    else if (today === start) setStatus("live")
    else {
      // «Next» solo para la primera fecha futura
      const items = [...document.querySelectorAll<HTMLElement>("[data-fixture-start]")].map((n) => n.dataset.fixtureStart!)
      const firstFuture = items.find((d) => d > today)
      setStatus(firstFuture === start ? "next" : "upcoming")
    }
  }, [start, end])

  return (
    <span
      data-fixture-start={start}
      className={`label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] ${status ? style[status] : "border-line text-transparent"}`}
    >
      {status === "live" && <span className="size-1.5 animate-pulse-dot rounded-full bg-live" />}
      {status ? text[status] : "—"}
    </span>
  )
}
