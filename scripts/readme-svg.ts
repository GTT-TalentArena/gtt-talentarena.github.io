/**
 * SVG animados para el README de la organización, con la misma técnica que el header.svg de
 * jimy-k4/jimy-k4: fuentes embebidas (subconjunto de Google Fonts con solo los caracteres que se
 * usan) y animaciones SMIL, que GitHub sí reproduce dentro de una <img>. Respetan «Reducir movimiento».
 *
 *   banner.svg → la cabecera, 100 % vectorial: titular, lema, anillo girando y el balón rodando
 *   site.svg   → la web en una ventana (captura .cache/site-bg.png) con el balón animado encima
 *
 * Lo llama scripts/previews.ts al final (necesita red para pedir las fuentes).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { BALL_START, BALL_TILT, apply, faces, fromSpinTilt } from "../lib/ball.ts"
import { hero, now, site } from "../lib/content.ts"

const root = resolve(import.meta.dirname, "..")
const out = resolve(root, "../.github/profile/assets")
const cache = join(root, ".cache")

const C = {
  paper: "#f3eee6",
  ink: "#0b0e2c",
  muted: "#5f6178",
  line: "rgba(11,14,44,0.14)",
  blau: "#1d3fc9",
  grana: "#a50044",
  live: "#2fbf71",
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

// ─── Fuentes: subconjunto de Google Fonts con los caracteres justos ─────────────────────────
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"

async function font(family: string, text: string) {
  const chars = [...new Set(text)].sort().join("")
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(chars)}`, { headers: { "user-agent": UA } })
  ).text()
  const url = css.match(/src:\s*url\((https:[^)]+)\)\s*format\(['"]woff2['"]\)/)?.[1]
  if (!url) throw new Error(`Google Fonts no devolvió woff2 para ${family}:\n${css.slice(0, 300)}`)
  return Buffer.from(await (await fetch(url)).arrayBuffer()).toString("base64")
}

// ─── El balón en SMIL: una vuelta completa sobre su eje, en bucle sin saltos ────────────────
const STEPS = 36 // fotogramas clave por vuelta; entre ellos el navegador interpola los vértices
const SPIN_S = 24 // segundos por vuelta (como el giro tranquilo de la web)

function ball(id: string, cx: number, cy: number, r: number, animated: boolean) {
  const n = animated ? STEPS : 0
  const frames = Array.from({ length: n + 1 }, (_, k) => apply(fromSpinTilt(BALL_START + (2 * Math.PI * k) / STEPS, BALL_TILT)))
  const f = (v: number) => String(Math.round(v * r * 10) / 10)
  const front = (k: number, i: number) => faces[i].idx.reduce((s, v) => s + frames[k][v][2], 0) > 0
  const dur = `${SPIN_S}s`
  // lineal: n+1 valores (el último = el primero, bucle sin salto); discreta: n valores, mismos tramos
  const anim = (attr: string, values: (string | number)[], discrete = false) =>
    animated
      ? `<animate attributeName="${attr}" dur="${dur}" repeatCount="indefinite"${discrete ? ' calcMode="discrete"' : ""} values="${(discrete ? values.slice(0, -1) : values).join(";")}"/>`
      : ""

  const defs = faces
    .map((face, i) => {
      const ds = frames.map((p) => `M${face.idx.map((v) => `${f(p[v][0])} ${f(p[v][1])}`).join("L")}Z`)
      return `<path id="${id}${i}" d="${ds[0]}">${anim("d", ds)}</path>`
    })
    .join("")
  const layer = (wantFront: boolean, attrs: (i: number) => string) =>
    faces
      .map((_, i) => {
        const vis = frames.map((__, k) => (front(k, i) === wantFront ? 1 : 0))
        return `<use href="#${id}${i}" ${attrs(i)} opacity="${vis[0]}">${anim("opacity", vis, true)}</use>`
      })
      .join("")
  return `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)})">
<defs><marker id="${id}n" viewBox="-1 -1 2 2" markerWidth="${(r * 0.056).toFixed(2)}" markerHeight="${(r * 0.056).toFixed(2)}" markerUnits="userSpaceOnUse"><circle r="1" fill="${C.ink}"/></marker>${defs}</defs>
<circle r="${r}" fill="none" stroke="${C.ink}" stroke-opacity="0.14"/>
<g fill="none" stroke="${C.ink}" stroke-opacity="0.22" stroke-dasharray="2 3">${layer(false, () => "")}</g>
<g stroke="${C.ink}" stroke-width="1.3" stroke-linejoin="round" marker-start="url(#${id}n)" marker-mid="url(#${id}n)">${layer(true, (i) =>
    `fill="${faces[i].kind === "hex" ? "none" : faces[i].tone ? C.grana : C.blau}"`,
  )}</g>
</g>`
}

// ─── Anillo de instrumento alrededor del balón (texto en mono + 60 marcas) ──────────────────
const RING = "More than a Hack 2027 · Talent Arena · Barcelona · 41.35°N 2.13°E · Frame by frame · ".toUpperCase()

function ring(id: string, cx: number, cy: number, size: number, animated: boolean) {
  const s = size / 200
  const R = 87 * s
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const a = (i / 60) * Math.PI * 2
    const r1 = (i % 5 ? 73 : 69) * s
    const r2 = 76 * s
    const p = (r: number) => `${(cx + Math.cos(a) * r).toFixed(2)} ${(cy + Math.sin(a) * r).toFixed(2)}`
    return `<path d="M${p(r1)}L${p(r2)}" stroke-opacity="${i % 5 ? 0.35 : 0.8}"/>`
  }).join("")
  const spin = animated
    ? `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="40s" repeatCount="indefinite"/>`
    : ""
  return `<g>${spin}
<path id="${id}" d="M${(cx - R).toFixed(2)},${cy} a${R.toFixed(2)},${R.toFixed(2)} 0 1,1 ${(2 * R).toFixed(2)},0 a${R.toFixed(2)},${R.toFixed(2)} 0 1,1 -${(2 * R).toFixed(2)},0" fill="none"/>
<text class="ring" style="font-size:${(9.6 * s).toFixed(2)}px"><textPath href="#${id}" textLength="${(540 * s).toFixed(1)}" lengthAdjust="spacing">${esc(RING)}</textPath></text>
<g stroke="${C.ink}" stroke-width="1">${ticks}</g>
</g>`
}

const motionCss = `.static{display:none}
@media (prefers-reduced-motion: reduce){.anim{display:none}.static{display:inline}}`

// ─── banner.svg ────────────────────────────────────────────────────────────────────────────
async function banner() {
  const W = 1280
  const H = 400
  const meta = [`${site.short} ©${site.since} — More than a Hack`, `${site.location} · Talent Arena`, hero.kicker].map((t) => t.toUpperCase())
  const gloss = `(${hero.mottoGloss})`.toUpperCase()
  const status = `${now.status} · ${now.title}`.toUpperCase()
  const lead = `${hero.motto.lead} `
  const intro = `${hero.intro.before} `

  const [B, I, G, GM] = await Promise.all([
    font("Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,200..800", `GTT${lead}`),
    font("Instrument+Serif:ital@1", `${hero.motto.accent}${hero.intro.accent}`),
    font("Geist:wght@100..900", intro),
    font("Geist+Mono:wght@100..900", [...meta, gloss, status, RING].join("")),
  ])

  // badge: mismo tamaño y sitio que en la cabecera de la web (app/previews/banner)
  const bx = 1137
  const by = 149
  const size = 190
  const r = (size * 0.58) / 2 / 1.12

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t d">
<title id="t">GTT — Més que dades</title>
<desc id="d">GTT, football analytics team at More than a Hack 2027, Talent Arena, Barcelona. A football drawn as a data mesh spins on the right.</desc>
<style>
@font-face{font-family:"B";src:url(data:font/woff2;base64,${B}) format("woff2");font-weight:200 800;font-stretch:75% 100%}
@font-face{font-family:"I";src:url(data:font/woff2;base64,${I}) format("woff2");font-style:italic}
@font-face{font-family:"G";src:url(data:font/woff2;base64,${G}) format("woff2");font-weight:100 900}
@font-face{font-family:"GM";src:url(data:font/woff2;base64,${GM}) format("woff2");font-weight:100 900}
.label{font:400 11.52px "GM",ui-monospace,monospace;letter-spacing:.08em;fill:${C.muted}}
.ring{font-family:"GM",ui-monospace,monospace;letter-spacing:.04em;fill:${C.ink}}
.gtt{font:650 216px "B",system-ui,sans-serif;font-stretch:88%;font-variation-settings:"wdth" 88,"opsz" 96;letter-spacing:-.02em;fill:${C.ink}}
.motto{font:650 86.4px "B",system-ui,sans-serif;font-stretch:88%;font-variation-settings:"wdth" 88,"opsz" 96;letter-spacing:-.045em;fill:${C.ink}}
.accent{font-family:"I",Georgia,serif;font-style:italic;font-weight:400;letter-spacing:-.02em}
.intro{font:400 20px "G",system-ui,sans-serif;fill:${C.ink}}
${motionCss}
</style>
<defs><clipPath id="card"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>
<g clip-path="url(#card)">
<rect width="${W}" height="${H}" fill="${C.paper}"/>
<text class="label" x="48" y="44">${esc(meta[0])}</text>
<text class="label" x="640" y="44" text-anchor="middle">${esc(meta[1])}</text>
<text class="label" x="1232" y="44" text-anchor="end">${esc(meta[2])}</text>
<path d="M48 62.5H1232" stroke="${C.line}"/>
<text class="gtt" x="44" y="281">GTT</text>
<text class="motto" x="378" y="253">${esc(lead)}<tspan class="accent">${esc(hero.motto.accent)}</tspan></text>
<text class="label" x="378" y="286">${esc(gloss)}</text>
<g class="anim">${ring("ra", bx, by, size, true)}${ball("ba", bx, by, r, true)}</g>
<g class="static">${ring("rs", bx, by, size, false)}${ball("bs", bx, by, r, false)}</g>
<path d="M48 323.5H1232" stroke="${C.ink}"/>
<text class="intro" x="48" y="363">${esc(intro)}<tspan class="accent" style="font-size:23px">${esc(hero.intro.accent)}</tspan></text>
<g class="anim"><circle cx="970" cy="356" r="4" fill="${C.live}" opacity=".5"><animate attributeName="r" values="4;12;12" keyTimes="0;.7;1" dur="2.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".55;0;0" keyTimes="0;.7;1" dur="2.2s" repeatCount="indefinite"/></circle></g>
<circle cx="970" cy="356" r="4" fill="${C.live}"/>
<text class="label" x="1232" y="360" text-anchor="end">${esc(status)}</text>
</g>
</svg>
`
  writeFileSync(join(out, "banner.svg"), svg)
  console.log(`✓ banner.svg (${Math.round(svg.length / 1024)} KB)`)
}

// ─── site.svg ──────────────────────────────────────────────────────────────────────────────
function siteSvg() {
  const bg = join(cache, "site-bg.png")
  const pos = join(cache, "site-ball.json")
  if (!existsSync(bg) || !existsSync(pos)) throw new Error("Falta .cache/site-bg.png o site-ball.json: ejecuta scripts/previews.ts")
  const [x, y, w, h] = JSON.parse(readFileSync(pos, "utf8")) as number[]
  const cx = x + w / 2
  const cy = y + h / 2
  const r = w / 2 / 1.12
  const png = readFileSync(bg).toString("base64")
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800" role="img" aria-labelledby="t d">
<title id="t">The GTT website</title>
<desc id="d">Preview of gtt-talentarena.github.io: the GTT headline, the motto Més que dades and the football spinning on the right.</desc>
<style>${motionCss}</style>
<image href="data:image/png;base64,${png}" width="1280" height="800"/>
<g class="anim">${ball("ba", cx, cy, r, true)}</g>
<g class="static">${ball("bs", cx, cy, r, false)}</g>
</svg>
`
  writeFileSync(join(out, "site.svg"), svg)
  console.log(`✓ site.svg (${Math.round(svg.length / 1024)} KB)`)
}

await banner()
siteSvg()
