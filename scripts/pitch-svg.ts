/**
 * Exports the pitch simulation as an animated SVG (SMIL) for the GitHub READMEs,
 * which don't run JavaScript but do animate SVG. Uses the same simulation as the site.
 *
 * Usage: node scripts/pitch-svg.ts [output.svg]
 */
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { FPS, PITCH, PitchSim, type Label } from "../lib/pitch-sim.ts"

const out = resolve(process.argv[2] ?? resolve(import.meta.dirname, "../../.github/profile/assets/pitch.svg"))

const LOOP_S = 20
const KPS = 10 // fotogramas clave por segundo
const SCAN_S = 400

const C = {
  bg: "#0b0e2c",
  ink: "#f3eee6",
  muted: "#8e90a8",
  home: "#6b8cff",
  away: "#ff4f8a",
  ball: "#e8ff2e",
}

// 1) Simulate and keep a window that has everything: H, A, D and a possession change.
type Snap = { agents: [number, number][]; ball: [number, number]; seen: boolean; label: Label; nearest: number }
const sim = new PitchSim(7)
for (let i = 0; i < FPS * 40; i++) sim.step()
const snaps: Snap[] = []
for (let i = 0; i < FPS * SCAN_S; i++) {
  sim.step()
  if (i % (FPS / KPS) === 0)
    snaps.push({
      agents: sim.agents.map((a) => [a.x, a.y]),
      ball: [sim.ball.x, sim.ball.y],
      seen: sim.ball.seen,
      label: sim.label,
      nearest: sim.nearest(),
    })
}
const N = LOOP_S * KPS
let best = 0
let bestScore = -1
for (let s = 0; s + N < snaps.length; s += KPS) {
  const w = snaps.slice(s, s + N)
  const has = (l: Label) => w.filter((x) => x.label === l).length
  const changes = w.filter((x, i) => i > 0 && x.label !== w[i - 1].label).length
  const unseen = w.filter((x) => !x.seen).length
  const score =
    (has("H") > 30 ? 1 : 0) + (has("A") > 30 ? 1 : 0) + (has("D") > 10 ? 1 : 0) + Math.min(changes, 4) * 0.5 + (unseen > 20 ? 1 : 0)
  if (score > bestScore) {
    bestScore = score
    best = s
  }
}
const win = snaps.slice(best, best + N)
win.push(win[0]) // cierra el bucle

// 2) Geometry
const S = 10
const OX = 75
const OY = 104
const W = 1200
const H = 900
const px = (m: number) => Math.round(OX + m * S)
const py = (m: number) => Math.round(OY + m * S)
const dur = `${LOOP_S}s`
const anim = (attr: string, values: (number | string)[], discrete = false) =>
  `<animate attributeName="${attr}" dur="${dur}" repeatCount="indefinite"${discrete ? ' calcMode="discrete"' : ""} values="${values.join(";")}"/>`

// fade when closing the loop so the jump isn't noticeable
const fade = `<animate attributeName="opacity" dur="${dur}" repeatCount="indefinite" values="0;1;1;0" keyTimes="0;0.02;0.98;1"/>`

const lines: string[] = []
const L = (s: string) => lines.push(s)

L(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Simulated football tracking: 22 players and the ball, with the possession label changing between home, away and dead ball.">`)
L(`<title>GTT — who has the ball? (simulated tracking)</title>`)
L(`<style>text{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;letter-spacing:.08em;text-transform:uppercase}</style>`)
L(`<rect width="${W}" height="${H}" rx="28" fill="${C.bg}"/>`)

// cabecera
L(`<text x="${OX}" y="58" font-size="15" fill="${C.ink}">Who has the ball? <tspan fill="${C.muted}">· simulated tracking · ${FPS} fps</tspan></text>`)
const chip = (label: Label, text: string, color: string) => {
  const on = win.map((s) => (s.label === label ? 1 : 0))
  L(`<g opacity="0">${anim("opacity", on, true)}`)
  L(`<rect x="${W - OX - 330}" y="34" width="330" height="36" rx="18" fill="none" stroke="${C.ink}" stroke-opacity=".18"/>`)
  L(`<rect x="${W - OX - 312}" y="46" width="12" height="12" rx="2" fill="${color}"/>`)
  L(`<text x="${W - OX - 290}" y="57.5" font-size="14" fill="${C.ink}">${label} — ${text}</text>`)
  L(`</g>`)
}
chip("H", "home in possession", C.home)
chip("A", "away in possession", C.away)
chip("D", "dead ball", C.muted)

// campo
L(`<g fill="none" stroke="${C.ink}" stroke-opacity=".26" stroke-width="1.6">`)
for (let i = 0; i < 14; i += 2)
  L(`<rect x="${px((PITCH.w / 14) * i)}" y="${py(0)}" width="${(PITCH.w / 14) * S}" height="${PITCH.h * S}" fill="${C.ink}" fill-opacity=".025" stroke="none"/>`)
L(`<rect x="${px(0)}" y="${py(0)}" width="${PITCH.w * S}" height="${PITCH.h * S}"/>`)
L(`<line x1="${px(PITCH.w / 2)}" y1="${py(0)}" x2="${px(PITCH.w / 2)}" y2="${py(PITCH.h)}"/>`)
L(`<circle cx="${px(PITCH.w / 2)}" cy="${py(PITCH.h / 2)}" r="${9.15 * S}"/>`)
for (const side of [0, 1]) {
  const x0 = side ? PITCH.w : 0
  const box = (d: number, w: number) =>
    L(`<rect x="${px(side ? x0 - d : x0)}" y="${py((PITCH.h - w) / 2)}" width="${d * S}" height="${w * S}"/>`)
  box(16.5, 40.32)
  box(5.5, 18.32)
  L(`<rect x="${px(side ? x0 : x0 - 1.8)}" y="${py((PITCH.h - 7.32) / 2)}" width="${1.8 * S}" height="${7.32 * S}"/>`)
}
L(`</g>`)

L(`<g>${fade}`)
// line to the nearest player (the baseline's idea)
L(`<line stroke="${C.ink}" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="7 7">`)
L(anim("x1", win.map((s) => px(s.ball[0]))))
L(anim("y1", win.map((s) => py(s.ball[1]))))
L(anim("x2", win.map((s) => px(s.agents[s.nearest][0]))))
L(anim("y2", win.map((s) => py(s.agents[s.nearest][1]))))
L(`</line>`)

// jugadores
sim.agents.forEach((a, i) => {
  const color = a.team === "H" ? C.home : C.away
  const stroke = a.gk ? ` stroke="${C.ink}" stroke-width="2.5"` : ""
  L(`<circle r="9.5" fill="${color}"${stroke}>`)
  L(anim("cx", win.map((s) => px(s.agents[i][0]))))
  L(anim("cy", win.map((s) => py(s.agents[i][1]))))
  L(`</circle>`)
})

// visible ball / ball lost by the tracking
L(`<circle r="6.2" fill="${C.ball}">`)
L(anim("cx", win.map((s) => px(s.ball[0]))))
L(anim("cy", win.map((s) => py(s.ball[1]))))
L(anim("opacity", win.map((s) => (s.seen ? 1 : 0)), true))
L(`</circle>`)
L(`<circle r="16" fill="none" stroke="${C.ball}" stroke-width="2" stroke-dasharray="5 5" opacity="0">`)
L(anim("cx", win.map((s) => px(s.ball[0]))))
L(anim("cy", win.map((s) => py(s.ball[1]))))
L(anim("opacity", win.map((s) => (s.seen ? 0 : 0.8)), true))
L(`</circle>`)
L(`</g>`)

// possession strip of the loop, with a playhead
const SY = OY + PITCH.h * S + 34
const SW = PITCH.w * S
const cw = SW / N
let run = 0
for (let i = 1; i <= N; i++) {
  if (i === N || win[i].label !== win[run].label) {
    const l = win[run].label
    const color = l === "H" ? C.home : l === "A" ? C.away : C.muted
    L(`<rect x="${(OX + run * cw).toFixed(1)}" y="${SY}" width="${((i - run) * cw + 0.5).toFixed(1)}" height="14" fill="${color}" fill-opacity="${l === "D" ? 0.5 : 1}"/>`)
    run = i
  }
}
L(`<rect y="${SY - 1}" height="16" fill="${C.bg}" fill-opacity=".72">`)
L(`<animate attributeName="x" dur="${dur}" repeatCount="indefinite" from="${OX}" to="${OX + SW}"/>`)
L(`<animate attributeName="width" dur="${dur}" repeatCount="indefinite" from="${SW}" to="0"/>`)
L(`</rect>`)
L(`<rect y="${SY - 6}" width="2" height="26" fill="${C.ink}">`)
L(`<animate attributeName="x" dur="${dur}" repeatCount="indefinite" from="${OX}" to="${OX + SW}"/>`)
L(`</rect>`)
L(`<text x="${OX}" y="${SY + 44}" font-size="13" fill="${C.muted}">Possession spells · ${LOOP_S} s loop</text>`)
L(`<text x="${OX + SW}" y="${SY + 44}" font-size="13" fill="${C.muted}" text-anchor="end">Simulated players — not match data</text>`)
L(`</svg>`)

writeFileSync(out, lines.join("\n"))
const counts = win.slice(0, N).reduce<Record<string, number>>((m, s) => ((m[s.label] = (m[s.label] ?? 0) + 1), m), {})
console.log(`✓ ${out} (${Math.round(lines.join("\n").length / 1024)} KB) · window ${best / KPS}s · labels`, counts)
