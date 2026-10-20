"use client"

import { useEffect, useRef } from "react"
import { BALL_START, BALL_TILT, apply, facePaths, faces, fromSpinTilt, mul, orthonormalize, rotation, vertices, type M } from "@/lib/ball"

type V = [number, number, number]

/** Giro tranquilo cuando nadie lo toca (rad/s, ejes de pantalla). */
const IDLE: V = [0, 0.32, 0]
const MAX_SPIN = 28
const KICK_SPIN = 11
const KICK_PUSH = 460

/**
 * El balón de GTT: un icosaedro truncado dibujado como una malla de datos. Pentágonos en
 * blaugrana, hexágonos abiertos, nodos en cada vértice y la cara oculta en rayos X.
 *
 * Se puede chutar: al arrastrarlo gira con el puntero y al soltarlo sale con la velocidad del
 * gesto; un clic sin arrastrar es un toque en ese punto (gira y se aparta del golpe). Después
 * frena hasta volver a su giro tranquilo. Quieto con `still`; sin giro propio con «Reducir movimiento».
 */
export function DataBall({ className = "", still = false }: { className?: string; still?: boolean }) {
  const svg = useRef<SVGSVGElement>(null)
  const back = useRef<(SVGPathElement | null)[]>([])
  const front = useRef<(SVGPathElement | null)[]>([])
  const nodes = useRef<(SVGCircleElement | null)[]>([])

  const initial = fromSpinTilt(BALL_START, BALL_TILT)
  const points = apply(initial)
  const paths = facePaths(points)

  useEffect(() => {
    if (still) return
    const el = svg.current!
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const idle: V = reduce ? [0, 0, 0] : IDLE

    let R: M = initial
    let w: V = [...idle]
    const off = { x: 0, y: 0, vx: 0, vy: 0 }
    let drag: { x: number; y: number; t: number; sx: number; sy: number; moved: boolean } | null = null
    let visible = true
    let raf = 0
    let last = performance.now()
    let frames = 0

    const draw = () => {
      const p = apply(R)
      facePaths(p).forEach(({ d, front: isFront }, i) => {
        back.current[i]?.setAttribute("d", isFront ? "" : d)
        front.current[i]?.setAttribute("d", isFront ? d : "")
      })
      p.forEach(([x, y, z], i) => {
        const n = nodes.current[i]
        if (!n) return
        n.setAttribute("cx", x.toFixed(3))
        n.setAttribute("cy", y.toFixed(3))
        n.setAttribute("opacity", z > 0 ? "1" : "0")
      })
      el.style.transform = `translate(${off.x.toFixed(1)}px, ${off.y.toFixed(1)}px)`
    }

    const turn = (axis: V, angle: number) => {
      if (angle > 1e-5) R = mul(rotation(axis, angle), R)
      if (++frames % 90 === 0) R = orthonormalize(R)
    }

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!visible || document.hidden) return
      if (!drag) {
        // rozamiento: vuelve poco a poco al giro tranquilo
        const f = 1 - Math.exp(-dt * 0.9)
        w = [w[0] + (idle[0] - w[0]) * f, w[1] + (idle[1] - w[1]) * f, w[2] + (idle[2] - w[2]) * f]
        const speed = Math.hypot(...w)
        turn(w, speed * dt)
      }
      // muelle que devuelve el balón a su sitio tras el golpe
      const ax = -90 * off.x - 11 * off.vx
      const ay = -90 * off.y - 11 * off.vy
      off.vx += ax * dt
      off.vy += ay * dt
      off.x += off.vx * dt
      off.y += off.vy * dt
      draw()
    }

    const local = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2, size: r.width }
    }

    const onDown = (e: PointerEvent) => {
      try {
        el.setPointerCapture(e.pointerId)
      } catch {}
      const p = local(e)
      drag = { x: e.clientX, y: e.clientY, t: performance.now(), sx: p.x, sy: p.y, moved: false }
      w = [0, 0, 0]
      el.style.cursor = "grabbing"
    }

    const onMove = (e: PointerEvent) => {
      if (!drag) return
      const now = performance.now()
      const dx = e.clientX - drag.x
      const dy = e.clientY - drag.y
      const dt = Math.max(0.008, (now - drag.t) / 1000)
      const k = Math.PI / el.getBoundingClientRect().width
      // arrastrar a la derecha gira la cara visible hacia la derecha (eje vertical), y así con todo
      turn([-dy, dx, 0], Math.hypot(dx, dy) * k)
      const inst: V = [(-dy * k) / dt, (dx * k) / dt, 0]
      w = [w[0] * 0.5 + inst[0] * 0.5, w[1] * 0.5 + inst[1] * 0.5, 0]
      const p = local(e)
      if (Math.hypot(p.x - drag.sx, p.y - drag.sy) > 4) drag.moved = true
      drag.x = e.clientX
      drag.y = e.clientY
      drag.t = now
    }

    const onUp = (e: PointerEvent) => {
      if (!drag) return
      const p = local(e)
      if (drag.moved) {
        // chute: sale con la velocidad del gesto (si el puntero se paró antes de soltar, no hay chute)
        if (performance.now() - drag.t > 90) w = [0, 0, 0]
        const s = Math.hypot(...w)
        if (s > MAX_SPIN) w = [(w[0] / s) * MAX_SPIN, (w[1] / s) * MAX_SPIN, 0]
        const k = Math.PI / p.size
        off.vx += Math.max(-600, Math.min(600, (w[1] / k) * 0.12))
        off.vy += Math.max(-600, Math.min(600, (-w[0] / k) * 0.12))
      } else {
        // toque: el balón se aparta del punto de contacto y rueda en esa dirección
        let px = -p.x
        let py = -p.y
        const n = Math.hypot(px, py)
        if (n < 3) {
          const a = Math.random() * Math.PI * 2
          px = Math.cos(a)
          py = Math.sin(a)
        } else {
          px /= n
          py /= n
        }
        w = [-py * KICK_SPIN, px * KICK_SPIN, 0]
        off.vx += px * KICK_PUSH
        off.vy += py * KICK_PUSH
      }
      drag = null
      el.style.cursor = ""
      try {
        if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId)
      } catch {}
    }

    // si el navegador se queda el gesto (el dedo hace scroll), se suelta el balón sin chutarlo
    const onCancel = () => {
      drag = null
      w = [...idle]
      el.style.cursor = ""
    }

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)
    el.addEventListener("pointerdown", onDown)
    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerup", onUp)
    el.addEventListener("pointercancel", onCancel)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      el.removeEventListener("pointerdown", onDown)
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerup", onUp)
      el.removeEventListener("pointercancel", onCancel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still])

  return (
    <svg
      ref={svg}
      data-ball
      viewBox="-1.12 -1.12 2.24 2.24"
      className={`${still ? "" : "cursor-grab touch-pan-y select-none"} ${className}`}
      role={still ? undefined : "img"}
      aria-hidden={still || undefined}
      aria-label={still ? undefined : "The GTT ball. Drag it or click it to kick it."}
    >
      <circle r="1" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <g fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="2 3">
        {paths.map((p, i) => (
          <path
            key={i}
            ref={(el) => {
              back.current[i] = el
            }}
            d={p.front ? "" : p.d}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
        {paths.map((p, i) => {
          const f = faces[i]
          const fill = f.kind === "hex" ? "transparent" : f.tone ? "var(--color-grana)" : "var(--color-blau)"
          return (
            <path
              key={i}
              ref={(el) => {
                front.current[i] = el
              }}
              d={p.front ? p.d : ""}
              fill={fill}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
      </g>
      <g fill="currentColor">
        {vertices.map((_, i) => {
          const [x, y, z] = points[i]
          return (
            <circle
              key={i}
              ref={(el) => {
                nodes.current[i] = el
              }}
              cx={x.toFixed(3)}
              cy={y.toFixed(3)}
              r="0.028"
              opacity={z > 0 ? 1 : 0}
            />
          )
        })}
      </g>
    </svg>
  )
}
