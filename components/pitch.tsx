"use client"

import { useEffect, useRef, useState } from "react"
import { FPS, PITCH, PitchSim, type Label } from "@/lib/pitch-sim"

const MARGIN = 3
const VIEW = { w: PITCH.w + MARGIN * 2, h: PITCH.h + MARGIN * 2 }
const TRAIL = 16
const STRIP_FRAMES = FPS * 40

const labelText: Record<Label, string> = {
  H: "Home in possession",
  A: "Away in possession",
  D: "Dead ball",
}

type Colors = { ink: string; home: string; away: string; ball: string }
type Spell = { label: Label; start: number; end: number }

function readColors(el: HTMLElement): Colors {
  const s = getComputedStyle(el)
  const v = (n: string) => s.getPropertyValue(n).trim()
  return { ink: v("--color-ink"), home: v("--color-home"), away: v("--color-away"), ball: v("--color-ball") }
}

function drawPitch(ctx: CanvasRenderingContext2D, k: number, c: Colors) {
  const W = VIEW.w * k
  const H = VIEW.h * k
  ctx.clearRect(0, 0, W, H)
  ctx.save()
  ctx.translate(MARGIN * k, MARGIN * k)

  // franjas de corte de césped, verticales como una camiseta a rayas
  const bands = 14
  for (let i = 0; i < bands; i++) {
    if (i % 2) continue
    ctx.fillStyle = c.ink
    ctx.globalAlpha = 0.025
    ctx.fillRect((PITCH.w / bands) * i * k, 0, (PITCH.w / bands) * k, PITCH.h * k)
  }
  ctx.globalAlpha = 0.26
  ctx.strokeStyle = c.ink
  ctx.lineWidth = Math.max(1, k * 0.16)

  const rect = (x: number, y: number, w: number, h: number) => ctx.strokeRect(x * k, y * k, w * k, h * k)
  const circle = (x: number, y: number, r: number, a0 = 0, a1 = Math.PI * 2) => {
    ctx.beginPath()
    ctx.arc(x * k, y * k, r * k, a0, a1)
    ctx.stroke()
  }
  const spot = (x: number, y: number) => {
    ctx.beginPath()
    ctx.arc(x * k, y * k, 0.35 * k, 0, Math.PI * 2)
    ctx.fillStyle = c.ink
    ctx.fill()
  }

  rect(0, 0, PITCH.w, PITCH.h)
  ctx.beginPath()
  ctx.moveTo((PITCH.w / 2) * k, 0)
  ctx.lineTo((PITCH.w / 2) * k, PITCH.h * k)
  ctx.stroke()
  circle(PITCH.w / 2, PITCH.h / 2, 9.15)
  spot(PITCH.w / 2, PITCH.h / 2)

  for (const side of [0, 1]) {
    const x0 = side ? PITCH.w : 0
    const s = side ? -1 : 1
    const box = (depth: number, width: number) => {
      const y = (PITCH.h - width) / 2
      rect(side ? x0 - depth : x0, y, depth, width)
    }
    box(16.5, 40.32)
    box(5.5, 18.32)
    spot(x0 + s * 11, PITCH.h / 2)
    const arc = Math.acos(5.5 / 9.15)
    circle(x0 + s * 11, PITCH.h / 2, 9.15, side ? Math.PI - arc : -arc, side ? Math.PI + arc : arc)
    rect(side ? x0 : x0 - 1.8, (PITCH.h - 7.32) / 2, 1.8, 7.32)
  }
  ctx.restore()
  ctx.globalAlpha = 1
}

export function Pitch() {
  const wrap = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLCanvasElement>(null)
  const lines = useRef<HTMLCanvasElement>(null)
  const strip = useRef<HTMLCanvasElement>(null)
  const frameEl = useRef<HTMLSpanElement>(null)
  const chipDot = useRef<HTMLSpanElement>(null)
  const chipText = useRef<HTMLSpanElement>(null)
  const homeBar = useRef<HTMLSpanElement>(null)
  const homePct = useRef<HTMLSpanElement>(null)
  const awayPct = useRef<HTMLSpanElement>(null)
  const lostEl = useRef<HTMLSpanElement>(null)
  const logEl = useRef<HTMLOListElement>(null)
  const [playing, setPlaying] = useState(true)
  const playingRef = useRef(true)

  useEffect(() => {
    playingRef.current = playing
  }, [playing])

  useEffect(() => {
    const root = wrap.current!
    const fc = field.current!
    const lc = lines.current!
    const sc = strip.current!
    const ctx = fc.getContext("2d")!
    const lctx = lc.getContext("2d")!
    const sctx = sc.getContext("2d")!

    const sim = new PitchSim(7)
    const trails = sim.agents.map(() => [] as [number, number][])
    const ballTrail: [number, number][] = []
    const history: Label[] = []
    const spells: Spell[] = []
    const alive = { H: 0, A: 0 }
    const colors = readColors(root)
    let k = 1
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = root.clientWidth
      k = (w / VIEW.w) * dpr
      for (const c of [fc, lc]) {
        c.width = Math.round(VIEW.w * k)
        c.height = Math.round(VIEW.h * k)
      }
      sc.width = Math.round(sc.clientWidth * dpr)
      sc.height = Math.round(sc.clientHeight * dpr)
      drawPitch(lctx, k, colors)
      render()
    }

    const advance = () => {
      sim.step()
      sim.agents.forEach((a, i) => {
        const t = trails[i]
        t.push([a.x, a.y])
        if (t.length > TRAIL) t.shift()
      })
      ballTrail.push([sim.ball.x, sim.ball.y])
      if (ballTrail.length > 8) ballTrail.shift()
      history.push(sim.label)
      if (history.length > STRIP_FRAMES) history.shift()
      if (sim.label !== "D") alive[sim.label]++
      const last = spells[spells.length - 1]
      if (last && last.label === sim.label) last.end = sim.frame
      else {
        spells.push({ label: sim.label, start: sim.frame, end: sim.frame })
        if (spells.length > 6) spells.shift()
        renderLog()
      }
    }

    const colorOf = (l: Label) => (l === "H" ? colors.home : l === "A" ? colors.away : colors.ink)

    const renderLog = () => {
      const ol = logEl.current
      if (!ol) return
      const done = spells.slice(0, -1).slice(-3).reverse()
      ol.innerHTML = done
        .map((s) => {
          const secs = ((s.end - s.start + 1) / FPS).toFixed(1)
          return `<li class="flex items-center gap-2"><span class="inline-block size-2 rounded-[2px]" style="background:${colorOf(s.label)};opacity:${s.label === "D" ? 0.45 : 1}"></span><span class="w-3">${s.label}</span><span class="text-ink/50">${String(s.start).padStart(6, "0")}→${String(s.end).padStart(6, "0")}</span><span class="ml-auto tabular-nums">${secs}s</span></li>`
        })
        .join("")
    }

    const render = () => {
      const W = fc.width
      const H = fc.height
      ctx.clearRect(0, 0, W, H)
      ctx.save()
      ctx.translate(MARGIN * k, MARGIN * k)
      const P = (v: number) => v * k

      // estelas: lo que ve un sistema de tracking
      sim.agents.forEach((a, i) => {
        const t = trails[i]
        ctx.strokeStyle = a.team === "H" ? colors.home : colors.away
        ctx.lineWidth = P(0.28)
        ctx.lineCap = "round"
        for (let j = 1; j < t.length; j++) {
          ctx.globalAlpha = (j / t.length) * 0.35
          ctx.beginPath()
          ctx.moveTo(P(t[j - 1][0]), P(t[j - 1][1]))
          ctx.lineTo(P(t[j][0]), P(t[j][1]))
          ctx.stroke()
        }
      })
      ctx.globalAlpha = 1

      // jugador más cercano al balón: la idea del baseline
      const n = sim.agents[sim.nearest()]
      ctx.setLineDash([P(0.7), P(0.7)])
      ctx.strokeStyle = colors.ink
      ctx.globalAlpha = 0.55
      ctx.lineWidth = P(0.16)
      ctx.beginPath()
      ctx.moveTo(P(sim.ball.x), P(sim.ball.y))
      ctx.lineTo(P(n.x), P(n.y))
      ctx.stroke()
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // jugadores
      sim.agents.forEach((a) => {
        ctx.beginPath()
        ctx.arc(P(a.x), P(a.y), P(0.95), 0, Math.PI * 2)
        ctx.fillStyle = a.team === "H" ? colors.home : colors.away
        ctx.fill()
        if (a.gk) {
          ctx.lineWidth = P(0.25)
          ctx.strokeStyle = colors.ink
          ctx.stroke()
        }
      })

      // balón
      if (sim.ball.seen) {
        for (let j = 1; j < ballTrail.length; j++) {
          ctx.globalAlpha = (j / ballTrail.length) * 0.5
          ctx.strokeStyle = colors.ball
          ctx.lineWidth = P(0.3)
          ctx.beginPath()
          ctx.moveTo(P(ballTrail[j - 1][0]), P(ballTrail[j - 1][1]))
          ctx.lineTo(P(ballTrail[j][0]), P(ballTrail[j][1]))
          ctx.stroke()
        }
        ctx.globalAlpha = 1
        ctx.shadowColor = colors.ball
        ctx.shadowBlur = P(1.6)
        ctx.beginPath()
        ctx.arc(P(sim.ball.x), P(sim.ball.y), P(0.62), 0, Math.PI * 2)
        ctx.fillStyle = colors.ball
        ctx.fill()
        ctx.shadowBlur = 0
      } else {
        ctx.setLineDash([P(0.5), P(0.5)])
        ctx.strokeStyle = colors.ball
        ctx.globalAlpha = 0.7
        ctx.lineWidth = P(0.2)
        ctx.beginPath()
        ctx.arc(P(sim.ball.x), P(sim.ball.y), P(1.6), 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }
      ctx.restore()

      // tira de posesiones (últimos 40 s)
      const sw = sc.width
      const sh = sc.height
      sctx.clearRect(0, 0, sw, sh)
      const cw = sw / STRIP_FRAMES
      const offset = STRIP_FRAMES - history.length
      let runStart = 0
      for (let j = 1; j <= history.length; j++) {
        if (j === history.length || history[j] !== history[runStart]) {
          const l = history[runStart]
          sctx.fillStyle = colorOf(l)
          sctx.globalAlpha = l === "D" ? 0.35 : 1
          sctx.fillRect((offset + runStart) * cw, 0, (j - runStart) * cw + 0.5, sh)
          runStart = j
        }
      }
      sctx.globalAlpha = 1

      // HUD
      if (frameEl.current) frameEl.current.textContent = String(sim.frame).padStart(6, "0")
      if (chipText.current) chipText.current.textContent = `${sim.label} — ${labelText[sim.label]}`
      if (chipDot.current) {
        chipDot.current.style.background = colorOf(sim.label)
        chipDot.current.style.opacity = sim.label === "D" ? "0.5" : "1"
      }
      const total = alive.H + alive.A || 1
      const h = Math.round((alive.H / total) * 100)
      if (homeBar.current) homeBar.current.style.width = `${h}%`
      if (homePct.current) homePct.current.textContent = `${h}%`
      if (awayPct.current) awayPct.current.textContent = `${100 - h}%`
      if (lostEl.current) lostEl.current.style.opacity = sim.ball.seen ? "0" : "1"
    }

    // calienta la simulación para que la tira no empiece vacía
    for (let i = 0; i < STRIP_FRAMES; i++) advance()

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (reduce.matches) {
      playingRef.current = false
      setPlaying(false)
    }

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "120px" })
    io.observe(root)

    const ro = new ResizeObserver(resize)
    ro.observe(root)

    let raf = 0
    let lastT = performance.now()
    let acc = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.1, (now - lastT) / 1000)
      lastT = now
      if (!playingRef.current || !visible || document.hidden) return
      acc += dt
      let stepped = false
      while (acc >= 1 / FPS) {
        advance()
        acc -= 1 / FPS
        stepped = true
      }
      if (stepped) render()
    }
    resize()
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [])

  return (
    <figure className="rounded-2xl border border-line bg-ink/[0.03] p-3 sm:p-4">
      <div className="label flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 pb-3">
        <span className="tabular-nums">
          Frame <span ref={frameEl}>011185</span> <span className="text-muted">· {FPS} fps</span>
        </span>
        <span className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-2.5 py-1">
            <span ref={chipDot} className="size-2 rounded-[2px] bg-current" />
            <span ref={chipText} aria-live="off">
              H — {labelText.H}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="grid size-7 place-items-center rounded-full border border-line transition-colors hover:bg-ink hover:text-paper"
            aria-label={playing ? "Pause simulation" : "Play simulation"}
          >
            {playing ? (
              <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                <path d="M3.5 2.5v7M8.5 2.5v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
                <path d="M3.5 2.2v7.6L9.8 6Z" fill="currentColor" />
              </svg>
            )}
          </button>
        </span>
      </div>

      <div ref={wrap} className="relative w-full" style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}>
        <canvas ref={lines} className="absolute inset-0 size-full" aria-hidden />
        <canvas
          ref={field}
          className="absolute inset-0 size-full"
          role="img"
          aria-label="Simulated football tracking: 22 players and the ball moving on a pitch, with a dashed line to the player nearest the ball."
        />
        <span
          ref={lostEl}
          className="label pointer-events-none absolute left-3 top-3 rounded-full bg-paper/80 px-2.5 py-1 text-[0.62rem] text-ball opacity-0 transition-opacity duration-300"
        >
          Ball not tracked
        </span>
      </div>

      <div className="mt-3 px-1">
        <canvas ref={strip} className="h-3 w-full rounded-[3px] bg-ink/[0.06]" aria-hidden />
        <div className="label mt-1.5 flex justify-between text-[0.62rem] text-muted">
          <span>−40 s</span>
          <span>Possession spells</span>
          <span>Now</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 border-t border-line px-1 pt-3 sm:grid-cols-2">
        <div>
          <p className="label flex justify-between text-[0.62rem] text-muted">
            <span>
              Home <span ref={homePct} className="text-ink tabular-nums">50%</span>
            </span>
            <span>
              <span ref={awayPct} className="text-ink tabular-nums">50%</span> Away
            </span>
          </p>
          <span className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-away">
            <span ref={homeBar} className="h-full bg-home transition-[width] duration-500" style={{ width: "50%" }} />
          </span>
        </div>
        <ol ref={logEl} className="label space-y-1 text-[0.62rem]" aria-label="Last possession spells" />
      </div>

      <figcaption className="label mt-4 px-1 text-[0.62rem] leading-relaxed text-muted">
        Simulated players — not match data. Dashed line: nearest player to the ball, the official baseline&apos;s idea.
        Dashed ring: the ball the tracking lost.
      </figcaption>
    </figure>
  )
}
