/**
 * The squad's kickabout: the five players of the 1-2-2 move around our half and pass to each
 * other, like the match in "Who has the ball?" but without opponents.
 *
 * The selected player (hovered, focused or tapped) stands still and doesn't touch the ball: a pass
 * to them runs past. If the ball leaves the half, everything stops until the selection is
 * released, and the game restarts from the goal.
 *
 * Invented, like lib/pitch-sim.ts: it uses no match data. Deterministic by seed.
 */

import { clamp, dist, mulberry32 } from "@/lib/pitch-sim"

/** Half pitch in metres: x from the left touchline, y from the halfway line. */
export const HALF = { w: 68, h: 52.5 } as const
export const FPS = 30
/** Match seconds per real second: at the pace of the match in "Who has the ball?". */
const PACE = 1
/** Ball deceleration in m/s²: an 18 m pass takes one second, as in lib/pitch-sim.ts. */
const ROLL = 9

export type Mate = {
  x: number
  y: number
  vx: number
  vy: number
  anchorX: number
  anchorY: number
  gk: boolean
  phase: [number, number, number]
}

type State =
  | { kind: "held"; carrier: number; until: number }
  | { kind: "pass"; receiver: number; toX: number; toY: number }
  | { kind: "loose" }
  | { kind: "out"; at: number }
  | { kind: "reset"; until: number }

export class SquadSim {
  mates: Mate[]
  ball = { x: 0, y: 0, vx: 0, vy: 0 }
  /** Selected player: still and not touching the ball. */
  selected: number | null = null
  /** Card radius in metres plus the ball: at that distance a player controls the ball. */
  reach = 3
  private state: State
  private frame = 0
  private t = 0
  private rng: () => number
  private gk: number
  /** Who made the last pass: it is passed back to them less often. */
  private from = -1
  /** Where the carrier has the ball (unit vector). */
  private face: [number, number] = [0, -1]

  constructor(spots: [number, number][], gk: number, seed = 5) {
    this.rng = mulberry32(seed)
    this.gk = gk
    this.mates = spots.map(([x, y], i) => ({
      x,
      y,
      vx: 0,
      vy: 0,
      anchorX: x,
      anchorY: y,
      gk: i === gk,
      phase: [this.rng() * 6.28, this.rng() * 6.28, 0.7 + this.rng() * 0.6],
    }))
    this.state = { kind: "held", carrier: gk, until: this.secs(0.8, 1.2) }
    this.placeBall()
  }

  /** Stopped because the ball went out: waits for the selection to be released. */
  get paused() {
    return this.state.kind === "out"
  }

  /** As many frames as those match seconds, from now on. */
  private secs(min: number, max: number) {
    return this.frame + Math.round(((min + this.rng() * (max - min)) * FPS) / PACE)
  }

  private free(i: number) {
    return i !== this.selected
  }

  private nearestFree(x: number, y: number, skipGk = false) {
    let best = -1
    let bd = Infinity
    this.mates.forEach((m, i) => {
      const d = dist(m.x, m.y, x, y)
      if (this.free(i) && !(skipGk && m.gk) && d < bd) {
        bd = d
        best = i
      }
    })
    return best
  }

  private gain(i: number) {
    const m = this.mates[i]
    const d = dist(this.ball.x, this.ball.y, m.x, m.y) || 1
    // the ball stays on the side it came from
    this.face = [(this.ball.x - m.x) / d, (this.ball.y - m.y) / d]
    this.ball.vx = this.ball.vy = 0
    this.state = { kind: "held", carrier: i, until: this.secs(0.5, 1.8) }
  }

  private pass(carrier: number) {
    const c = this.mates[carrier]
    const options = this.mates.flatMap((m, j) => {
      if (j === carrier) return []
      const len = dist(c.x, c.y, m.x, m.y)
      let w = Math.exp(-((len - 18) ** 2) / 320)
      if (m.gk) w *= 0.3
      if (j === this.from) w *= 0.4
      return [{ j, w: Math.max(w, 0.001) }]
    })
    let r = this.rng() * options.reduce((s, o) => s + o.w, 0)
    let receiver = options[0].j
    for (const o of options) {
      r -= o.w
      if (r <= 0) {
        receiver = o.j
        break
      }
    }
    const m = this.mates[receiver]
    const toX = clamp(m.x + m.vx * 0.8, 2, HALF.w - 2)
    const toY = clamp(m.y + m.vy * 0.8, 2, HALF.h - 2)
    const dx = toX - this.ball.x
    const dy = toY - this.ball.y
    const d = Math.hypot(dx, dy) || 1
    // a bit harder than needed: the receiver stops it, and if they don't touch it the ball runs on
    const v0 = Math.sqrt(2 * ROLL * (d * 1.3 + 6))
    this.ball.vx = (dx / d) * v0
    this.ball.vy = (dy / d) * v0
    this.from = carrier
    this.state = { kind: "pass", receiver, toX, toY }
  }

  private reset() {
    const g = this.mates[this.gk]
    this.ball = { x: g.x, y: g.y - this.reach, vx: 0, vy: 0 }
    this.from = -1
    this.state = { kind: "reset", until: this.secs(1.4, 1.4) }
  }

  step() {
    this.frame++
    const dt = PACE / FPS
    this.t += dt
    const s = this.state
    const b = this.ball

    if (s.kind === "out") {
      if (this.selected === null && this.frame - s.at > FPS * 0.7) this.reset()
      return
    }

    if (s.kind === "held") {
      if (this.frame >= s.until) this.pass(s.carrier)
    } else if (s.kind === "pass" || s.kind === "loose") {
      const sp = Math.hypot(b.vx, b.vy)
      if (sp > 0) {
        const k = Math.max(0, sp - ROLL * dt) / sp
        b.vx *= k
        b.vy *= k
      }
      b.x += b.vx * dt
      b.y += b.vy * dt

      if (b.x < 0 || b.x > HALF.w || b.y < 0 || b.y > HALF.h) {
        this.state = { kind: "out", at: this.frame }
        return
      }

      if (s.kind === "pass") {
        const m = this.mates[s.receiver]
        const d = dist(b.x, b.y, m.x, m.y)
        const past = (b.x - m.x) * b.vx + (b.y - m.y) * b.vy > 0
        if (this.free(s.receiver) && d < this.reach) this.gain(s.receiver)
        // the selected player doesn't touch it: it keeps rolling and whoever arrives picks it up
        else if ((past && d > this.reach) || Math.hypot(b.vx, b.vy) < 0.3) this.state = { kind: "loose" }
      } else {
        const i = this.nearestFree(b.x, b.y)
        if (i >= 0 && dist(b.x, b.y, this.mates[i].x, this.mates[i].y) < this.reach) this.gain(i)
      }
    } else if (s.kind === "reset" && this.frame >= s.until) {
      this.gain(this.gk)
      this.face = [0, -1]
    }

    this.move(dt)
    this.placeBall()
  }

  private placeBall() {
    const s = this.state
    if (s.kind === "held") {
      const c = this.mates[s.carrier]
      this.ball.x = c.x + this.face[0] * this.reach * 0.92
      this.ball.y = c.y + this.face[1] * this.reach * 0.92
    } else if (s.kind === "reset") {
      const g = this.mates[this.gk]
      this.ball.x = g.x
      this.ball.y = g.y - this.reach * 0.92
    }
  }

  private move(dt: number) {
    const s = this.state
    const bx = clamp(this.ball.x, 0, HALF.w)
    const by = clamp(this.ball.y, 0, HALF.h)
    // the keeper doesn't leave the box: outside it, a loose ball is chased by an outfield player
    const inBox = bx > 26 && bx < 42 && by > 40
    const chaser = s.kind === "loose" ? this.nearestFree(bx, by, !inBox) : -1
    const gap = this.reach * 2 + 1.2

    this.mates.forEach((m, i) => {
      if (!this.free(i)) {
        m.vx = m.vy = 0
        return
      }
      const [p1, p2, f] = m.phase
      let tx: number
      let ty: number
      let top = 5.6
      if (s.kind === "reset") {
        tx = m.anchorX
        ty = m.anchorY
        top = 7.6
      } else if (m.gk) {
        tx = m.anchorX + (bx - m.anchorX) * 0.12
        ty = m.anchorY + 0.8 * Math.sin(this.t * 0.4 * f + p2)
      } else {
        // each one near their spot, pulled a little by the ball and moving like in a match
        tx = m.anchorX + (bx - HALF.w / 2) * 0.16 + 3.6 * Math.sin(this.t * 0.5 * f + p1)
        ty = m.anchorY + (by - HALF.h / 2) * 0.14 + 3 * Math.sin(this.t * 0.38 * f + p2)
      }
      if (s.kind === "held" && s.carrier === i) top = 4
      if ((s.kind === "pass" && s.receiver === i) || i === chaser) {
        tx = s.kind === "pass" ? s.toX : bx
        ty = s.kind === "pass" ? s.toY : by
        top = 7.6
      }

      let dvx = (tx - m.x) * 0.9
      let dvy = (ty - m.y) * 0.9
      // no overlapping: the cards are big
      this.mates.forEach((o, j) => {
        if (j === i) return
        const d = dist(m.x, m.y, o.x, o.y)
        if (d < gap && d > 0) {
          dvx += ((m.x - o.x) / d) * (gap - d) * 1.6
          dvy += ((m.y - o.y) / d) * (gap - d) * 1.6
        }
      })
      const sp = Math.hypot(dvx, dvy)
      if (sp > top) {
        dvx = (dvx / sp) * top
        dvy = (dvy / sp) * top
      }
      m.vx += (dvx - m.vx) * 0.09
      m.vy += (dvy - m.vy) * 0.09
      m.x = clamp(m.x + m.vx * dt, this.reach, HALF.w - this.reach)
      m.y = clamp(m.y + m.vy * dt, this.reach * 0.8, HALF.h - 1.5)
      if (m.gk) {
        m.x = clamp(m.x, 26, 42)
        m.y = clamp(m.y, 42, HALF.h - 1.5)
      }
    })

    // the carrier gradually turns the ball towards where they're going
    if (s.kind === "held") {
      const c = this.mates[s.carrier]
      const sp = Math.hypot(c.vx, c.vy)
      if (sp > 0.3) {
        const fx = this.face[0] + (c.vx / sp - this.face[0]) * 0.04
        const fy = this.face[1] + (c.vy / sp - this.face[1]) * 0.04
        const n = Math.hypot(fx, fy) || 1
        this.face = [fx / n, fy / n]
      }
    }
  }
}
