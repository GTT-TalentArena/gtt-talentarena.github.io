"use client"

import { useEffect } from "react"

/** Records where the home page ball sits inside the preview (in preview px). */
export function BallSlot({ frame, scale }: { frame: string; scale: number }) {
  useEffect(() => {
    const iframe = document.getElementById(frame) as HTMLIFrameElement | null
    if (!iframe) return
    const measure = () => {
      // the visible one: on desktop, the one in the ring (the mobile one is hidden)
      const ball = [...(iframe.contentDocument?.querySelectorAll("svg[data-ball]") ?? [])].find(
        (b) => b.getBoundingClientRect().width > 0,
      )
      if (!ball) return false
      const f = iframe.getBoundingClientRect()
      const b = ball.getBoundingClientRect()
      const rect = [f.left + b.left * scale, f.top + b.top * scale, b.width * scale, b.height * scale]
      document.body.dataset.ball = rect.map((n) => n.toFixed(2)).join(",")
      return true
    }
    const id = setInterval(() => measure() && clearInterval(id), 100)
    return () => clearInterval(id)
  }, [frame, scale])
  return null
}
