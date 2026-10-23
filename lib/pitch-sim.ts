/**
 * Tracking simulation for the landing page: 22 players and a ball that move like in a
 * match, with the challenge's possession label (H / A / D) on every frame.
 *
 * It is invented from start to finish: it neither uses nor reconstructs match data (see the challenge's RULES.md).
 * It is deterministic by seed, so the landing page and the README SVG tell the same play.
 */

export type Team = "H" | "A"
export type Label = "H" | "A" | "D"

export const PITCH = { w: 105, h: 68 } as const
export const FPS = 25

export type Agent = {
  team: Team
  gk: boolean
  x: number
  y: number
  vx: number
  vy: number
  anchorX: number
  anchorY: number
  phase: [number, number, number]
}

type BallState =
  | { kind: "held"; carrier: number; until: number }
  | {
      kind: "pass"
      fromX: number
      fromY: number
      toX: number
      toY: number
      t: number
      dur: number
      receiver: number
      /** whether the pass ends outside the pitch */
      out: boolean
    }
  | { kind: "dead"; until: number; restart: Team; taker: number }

// 4-3-3 for the team attacking to the right
const FORMATION: [number, number][] = [
  [5, 34],
  [22, 10],
  [19, 26],
  [19, 42],
  [22, 58],
  [40, 16],
  [36, 34],
  [40, 52],
  [58, 12],
  [61, 34],
  [58, 56],
]

export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
export const dist = (ax: number, ay: number, bx: number, by: number) => Math.hypot(ax - bx, ay - by)

export class PitchSim {
  frame: number
  agents: Agent[] = []
  ball = { x: PITCH.w / 2, y: PITCH.h / 2, seen: true }
  label: Label = "H"
  possession: Team = "H"
  private state: BallState
  private rng: () => number
  private seenUntil: number
  private t = 0

  constructor(seed = 7, startFrame = 11185) {
    this.rng = mulberry32(seed)
    this.frame = startFrame
    for (const team of ["H", "A"] as Team[]) {
      FORMATION.forEach(([fx, fy], i) => {
        const anchorX = team === "H" ? fx * 0.5 : PITCH.w - fx * 0.5
        const anchorY = team === "H" ? fy : PITCH.h - fy
        this.agents.push({
          team,
          gk: i === 0,
          x: anchorX,
          y: anchorY,
          vx: 0,
          vy: 0,
          anchorX: team === "H" ? fx : PITCH.w - fx,
          anchorY,
          phase: [this.rng() * 6.28, this.rng() * 6.28, 0.6 + this.rng() * 0.8],
        })
      })
    }
    // saque inicial: el mediocentro local
    const kicker = 6
    this.agents[kicker].x = PITCH.w / 2 - 0.8
    this.agents[kicker].y = PITCH.h / 2
    this.state = { kind: "held", carrier: kicker, until: this.frame + 20 }
    this.seenUntil = this.frame + this.span(4, 8)
  }

  private span(minS: number, maxS: number) {
    return Math.round((minS + this.rng() * (maxS - minS)) * FPS)
  }

  private dir(team: Team) {
    return team === "H" ? 1 : -1
  }

  private teammates(i: number) {
    const team = this.agents[i].team
    return this.agents.map((a, j) => ({ a, j })).filter(({ a, j }) => a.team === team && j !== i)
  }

  /** Player nearest the ball: the official baseline's idea. */
  nearest(): number {
    let best = 0
    let bd = Infinity
    this.agents.forEach((a, i) => {
      const d = dist(a.x, a.y, this.ball.x, this.ball.y)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    return best
  }

  private nearestOf(team: Team, x: number, y: number, skipGk = true) {
    let best = -1
    let bd = Infinity
    this.agents.forEach((a, i) => {
      if (a.team !== team || (skipGk && a.gk)) return
      const d = dist(a.x, a.y, x, y)
      if (d < bd) {
        bd = d
        best = i
      }
    })
    return best
  }

  private startPass(carrier: number) {
    const c = this.agents[carrier]
    const d = this.dir(c.team)
    const options = this.teammates(carrier).map(({ a, j }) => {
      const len = dist(c.x, c.y, a.x, a.y)
      const forward = (a.x - c.x) * d
      const open = Math.min(
        ...this.agents.filter((o) => o.team !== c.team).map((o) => dist(o.x, o.y, a.x, a.y)),
      )
      let w = Math.exp(-((len - 18) ** 2) / 260) * (1 + clamp(forward, -10, 25) / 18) * clamp(open / 6, 0.15, 1.4)
      if (a.gk) w *= 0.15
      return { j, w: Math.max(w, 0.001) }
    })
    const total = options.reduce((s, o) => s + o.w, 0)
    let r = this.rng() * total
    let receiver = options[0].j
    for (const o of options) {
      r -= o.w
      if (r <= 0) {
        receiver = o.j
        break
      }
    }
    const rec = this.agents[receiver]
    // aim slightly ahead of the receiver
    let toX = clamp(rec.x + rec.vx * 0.5 + d * 1.5, 1, PITCH.w - 1)
    let toY = clamp(rec.y + rec.vy * 0.5, 1, PITCH.h - 1)
    let out = false
    if ((toY < 6 || toY > PITCH.h - 6) && this.rng() < 0.3) {
      out = true
      toY = toY < PITCH.h / 2 ? -1.5 : PITCH.h + 1.5
      toX = clamp(toX + d * 6, 2, PITCH.w - 2)
    }
    const len = dist(c.x, c.y, toX, toY)
    this.state = {
      kind: "pass",
      fromX: this.ball.x,
      fromY: this.ball.y,
      toX,
      toY,
      t: 0,
      dur: Math.max(10, Math.round((len / 17) * FPS)),
      receiver,
      out,
    }
  }

  private startShot(carrier: number) {
    const c = this.agents[carrier]
    const goalX = c.team === "H" ? PITCH.w + 0.5 : -0.5
    const toY = PITCH.h / 2 + (this.rng() - 0.5) * 9
    const keeper = this.agents.findIndex((a) => a.gk && a.team !== c.team)
    const saved = this.rng() < 0.5
    this.state = {
      kind: "pass",
      fromX: this.ball.x,
      fromY: this.ball.y,
      toX: saved ? this.agents[keeper].x : goalX,
      toY: saved ? this.agents[keeper].y : toY,
      t: 0,
      dur: Math.round((dist(c.x, c.y, goalX, toY) / 26) * FPS),
      receiver: keeper,
      out: !saved,
    }
  }

  private gain(i: number) {
    this.possession = this.agents[i].team
    this.state = { kind: "held", carrier: i, until: this.frame + this.span(0.5, 1.8) }
  }

  step() {
    this.frame++
    this.t += 1 / FPS
    const s = this.state

    // ── ball ──
    if (s.kind === "held") {
      const c = this.agents[s.carrier]
      const d = this.dir(c.team)
      this.ball.x = c.x + d * 0.7
      this.ball.y = c.y + 0.2
      if (this.frame >= s.until) {
        const attackingThird = (c.team === "H" ? c.x : PITCH.w - c.x) > 84
        if (!c.gk && this.rng() < 0.07) {
          // foul on the carrier: dead ball and their team restarts
          this.state = { kind: "dead", until: this.frame + this.span(2, 3.5), restart: c.team, taker: s.carrier }
        } else if (attackingThird && !c.gk && this.rng() < 0.4) this.startShot(s.carrier)
        else this.startPass(s.carrier)
      }
    } else if (s.kind === "pass") {
      s.t++
      const k = 1 - (1 - Math.min(1, s.t / s.dur)) ** 1.6
      this.ball.x = s.fromX + (s.toX - s.fromX) * k
      this.ball.y = s.fromY + (s.toY - s.fromY) * k
      // interception: an opponent who steps into the passing lane
      if (!s.out && s.t > 4 && s.t < s.dur - 2) {
        const passer = this.possession
        const rival = this.nearestOf(passer === "H" ? "A" : "H", this.ball.x, this.ball.y)
        if (rival >= 0) {
          const r = this.agents[rival]
          if (dist(r.x, r.y, this.ball.x, this.ball.y) < 1.4 && this.rng() < 0.35) {
            this.gain(rival)
            return this.tickAgents()
          }
        }
      }
      if (s.t >= s.dur) {
        if (s.out) {
          const restart: Team = this.possession === "H" ? "A" : "H"
          const taker = this.nearestOf(restart, this.ball.x, this.ball.y)
          this.state = { kind: "dead", until: this.frame + this.span(2, 3.5), restart, taker }
        } else {
          // a poor first touch also gives the ball away
          const rec = s.receiver
          const rival = this.nearestOf(this.agents[rec].team === "H" ? "A" : "H", this.ball.x, this.ball.y)
          if (rival >= 0 && this.rng() < 0.1) this.gain(rival)
          else this.gain(rec)
        }
      }
    } else if (s.kind === "dead") {
      if (this.frame >= s.until) {
        const k = this.agents[s.taker]
        this.ball.x = clamp(this.ball.x, 0.3, PITCH.w - 0.3)
        this.ball.y = clamp(this.ball.y, 0.3, PITCH.h - 0.3)
        k.x = this.ball.x
        k.y = this.ball.y
        this.gain(s.taker)
      }
    }

    this.tickAgents()
  }

  private tickAgents() {
    const s = this.state
    this.label = s.kind === "dead" ? "D" : this.possession

    // ball visibility: the tracking loses it at times
    if (this.frame >= this.seenUntil) {
      this.ball.seen = !this.ball.seen
      this.seenUntil = this.frame + (this.ball.seen ? this.span(3, 7) : this.span(1.5, 4.5))
    }

    const bx = clamp(this.ball.x, 0, PITCH.w)
    const by = clamp(this.ball.y, 0, PITCH.h)
    const defending: Team = this.possession === "H" ? "A" : "H"
    const presser = s.kind === "dead" ? -1 : this.nearestOf(defending, bx, by)

    this.agents.forEach((a, i) => {
      const d = this.dir(a.team)
      const inPoss = a.team === this.possession && s.kind !== "dead"
      let tx: number
      let ty: number
      if (a.gk) {
        const goalX = a.team === "H" ? 4 : PITCH.w - 4
        tx = goalX + (bx - goalX) * 0.08
        ty = PITCH.h / 2 + (by - PITCH.h / 2) * 0.18
      } else {
        const push = inPoss ? 9 : -5
        tx = a.anchorX * 0.62 + bx * 0.38 + d * push - d * 6
        ty = a.anchorY + (by - PITCH.h / 2) * 0.32
        const [p1, p2, f] = a.phase
        tx += 2.2 * Math.sin(this.t * 0.6 * f + p1)
        ty += 2.6 * Math.sin(this.t * 0.45 * f + p2)
      }
      if (s.kind === "held" && s.carrier === i) {
        tx = a.x + d * 7
        ty = a.y + Math.sin(this.t * 0.8 + a.phase[0]) * 4
      }
      if (s.kind === "pass" && s.receiver === i && !s.out) {
        tx = s.toX
        ty = s.toY
      }
      if (s.kind === "dead" && s.taker === i) {
        tx = bx
        ty = by
      }
      if (i === presser) {
        tx = bx
        ty = by
      }
      tx = clamp(tx, 1, PITCH.w - 1)
      ty = clamp(ty, 1, PITCH.h - 1)

      const sprint = i === presser || (s.kind === "pass" && s.receiver === i) ? 7.6 : 5.6
      let dvx = (tx - a.x) * 0.9
      let dvy = (ty - a.y) * 0.9
      const sp = Math.hypot(dvx, dvy)
      if (sp > sprint) {
        dvx = (dvx / sp) * sprint
        dvy = (dvy / sp) * sprint
      }
      a.vx += (dvx - a.vx) * 0.09
      a.vy += (dvy - a.vy) * 0.09
      a.x += a.vx / FPS
      a.y += a.vy / FPS
    })
  }
}
