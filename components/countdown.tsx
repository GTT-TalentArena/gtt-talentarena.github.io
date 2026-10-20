"use client"

import { useEffect, useState } from "react"

/** «27d 08h» hasta `to`; «Closed» cuando ya ha pasado. */
export function Countdown({ to }: { to: string }) {
  const [left, setLeft] = useState<string | null>(null)

  useEffect(() => {
    const end = new Date(to).getTime()
    const tick = () => {
      const ms = end - Date.now()
      if (ms <= 0) return setLeft("Closed")
      const d = Math.floor(ms / 86_400_000)
      const h = Math.floor((ms % 86_400_000) / 3_600_000)
      const m = Math.floor((ms % 3_600_000) / 60_000)
      setLeft(d > 0 ? `${d}d ${String(h).padStart(2, "0")}h` : `${h}h ${String(m).padStart(2, "0")}m`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [to])

  return <span suppressHydrationWarning>{left ?? "--d --h"}</span>
}
