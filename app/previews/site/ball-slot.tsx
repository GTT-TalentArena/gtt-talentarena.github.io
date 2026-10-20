"use client"

import { useEffect } from "react"

/** Apunta dónde queda el balón de la portada dentro de la preview (en px de la preview). */
export function BallSlot({ frame, scale }: { frame: string; scale: number }) {
  useEffect(() => {
    const iframe = document.getElementById(frame) as HTMLIFrameElement | null
    if (!iframe) return
    const measure = () => {
      const ball = iframe.contentDocument?.querySelector("svg[data-ball]")
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
