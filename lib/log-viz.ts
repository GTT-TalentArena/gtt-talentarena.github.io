/**
 * Figuras para las entradas del log, escritas en el propio Markdown como bloques de código con un
 * lenguaje especial. Se convierten en HTML/SVG al compilar (web estática, sin JavaScript):
 *
 *   ```timeline   tiras de etiquetas H/A/D/X en el tiempo, con spellF1 calculado como el scorer
 *   ```pitch      el campo con jugadores, balón, pases y la etiqueta de ese instante
 *   ```bars       barras horizontales con su valor
 *   ```stats      cifras grandes con una línea de texto
 *   ```roadmap    pasos numerados (P0, P1…) con título y explicación
 *
 * La sintaxis de cada bloque está encima de su función. Todo lo que se dibuja con estos bloques es
 * INVENTADO o sale de documentos públicos: nunca datos del partido (RULES.md del reto).
 */
import { fillAbstentions, macroF1, spellF1, spells, type Label } from "@/lib/possession-score"

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
// texto con `código` y **negrita** mínimos
const inline = (s: string) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")

const pct = (n: number) => `${+n.toFixed(3)}%`

/** Separa las líneas `clave: valor` (opciones, en cualquier sitio y sin «|») de las filas con «|». */
function split(src: string) {
  const opts: Record<string, string> = {}
  const body: string[] = []
  for (const raw of src.split("\n")) {
    const line = raw.trim()
    if (!line || line.startsWith("#")) continue
    const m = line.match(/^([a-z]+):\s*(.*)$/)
    if (m && !line.includes("|")) opts[m[1]] = m[2]
    else body.push(line)
  }
  return { opts, body }
}

export class VizError extends Error {}
const fail = (msg: string): never => {
  throw new VizError(msg)
}

/* ─── timeline ──────────────────────────────────────────────────────────────────────────────────
 *  title: Toy match · invented
 *  cell: 0.2s                 duración de una celda (1s, 0.2s, 5 frames…), para el eje
 *  ticks: 10                  una marca cada 10 celdas
 *  score: spell | both | none spellF1 a la derecha (both = también macroF1); por defecto spell
 *  marks: 3 11 18             marcadores ①②③ sobre la verdad (enlazan con un bloque pitch)
 *  caption: texto bajo la figura
 *  Truth | HHHHHAAAADDDHHH    la primera fila es la verdad (se puede usar como «truth»); espacios ignorados
 *  @raw Nearest player | HH.AH.   @id para usarla luego; «.» = no se ve el balón
 *  Our answer | =viterbi(raw, 2)  transformaciones: hold baseline vote mindur hyst viterbi late fill
 */
const LABEL_SET = new Set(["H", "A", "D", "X", "."])

type Cell = Label | "."

const transforms: Record<string, (r: Cell[], n?: number) => Cell[]> = {
  /** «.» (no se ve el balón) → la última etiqueta conocida: lo mismo que hace X en el scorer. */
  hold: (r) => {
    let last: Cell = r.find((c) => c !== ".") ?? "H"
    return r.map((c) => (c === "." ? last : (last = c)))
  },
  /** El baseline del reto: voto H/A en ±w celdas; si no se ve el balón en toda la ventana, D. */
  baseline: (r, w = 2) =>
    r.map((_, i) => {
      let h = 0
      let a = 0
      for (let j = Math.max(0, i - w); j <= Math.min(r.length - 1, i + w); j++) {
        if (r[j] === "H") h++
        if (r[j] === "A") a++
      }
      return h + a === 0 ? "D" : h >= a ? "H" : "A"
    }),
  /** Voto de mayoría entre H, A y D en ±w celdas; en empate se queda la etiqueta propia. */
  vote: (r, w = 2) =>
    r.map((c, i) => {
      const n: Record<string, number> = { H: 0, A: 0, D: 0 }
      for (let j = Math.max(0, i - w); j <= Math.min(r.length - 1, i + w); j++) if (r[j] in n) n[r[j]]++
      const top = Math.max(n.H, n.A, n.D)
      if (top === 0) return c
      if (c in n && n[c] === top) return c
      return (["H", "A", "D"] as const).find((k) => n[k] === top)!
    }),
  /** Duración mínima: la racha más corta de menos de k celdas se une a su vecina más larga, hasta que no quede ninguna. */
  mindur: (r, k = 5) => {
    const out = [...r]
    for (;;) {
      const runs: { a: number; b: number }[] = []
      for (let i = 0; i < out.length; ) {
        let j = i
        while (j < out.length && out[j] === out[i]) j++
        runs.push({ a: i, b: j })
        i = j
      }
      if (runs.length < 2) return out
      const len = (x: { a: number; b: number }) => x.b - x.a
      const s = runs.reduce((m, x, i) => (len(x) < len(runs[m]) ? i : m), 0)
      if (len(runs[s]) >= k) return out
      const prev = runs[s - 1]
      const next = runs[s + 1]
      const into = !next || (prev && len(prev) >= len(next)) ? prev : next
      for (let t = runs[s].a; t < runs[s].b; t++) out[t] = out[into.a]
    }
  },
  /** Histéresis: se cambia solo si la nueva etiqueta se mantiene k celdas vistas; el cambio se fecha al principio. */
  hyst: (r, k = 2) => {
    let state: Cell = r.find((c) => c !== ".") ?? "H"
    const out: Cell[] = []
    for (let i = 0; i < r.length; i++) {
      const c = r[i]
      if (c !== "." && c !== state) {
        let seen = 0
        for (let j = i; j < r.length && seen < k; j++) {
          if (r[j] === ".") continue
          if (r[j] !== c) break
          seen++
        }
        if (seen >= k) state = c
      }
      out.push(state)
    }
    return out
  },
  /** Viterbi con tres estados: coste 1 por contradecir lo observado y λ por cada cambio de estado. */
  viterbi: (r, lambda = 2) => {
    const S = ["H", "A", "D"] as const
    const cost = (c: Cell, s: string) => (c === "." || c === "X" || c === s ? 0 : 1)
    let dp: number[] = S.map((s) => cost(r[0], s))
    const back: number[][] = []
    for (let t = 1; t < r.length; t++) {
      const prev = dp
      const from: number[] = []
      dp = S.map((s, k) => {
        let best = k
        for (let q = 0; q < S.length; q++) if (prev[q] + (q === k ? 0 : lambda) < prev[best] + (best === k ? 0 : lambda)) best = q
        from.push(best)
        return prev[best] + (best === k ? 0 : lambda) + cost(r[t], s)
      })
      back.push(from)
    }
    let k = dp.indexOf(Math.min(...dp))
    const out: Cell[] = [S[k]]
    for (let t = back.length - 1; t >= 0; t--) out.unshift(S[(k = back[t][k])])
    return out
  },
  /** La misma respuesta n celdas tarde: cada celda toma la etiqueta de n celdas antes. */
  late: (r, n = 1) => r.map((_, t) => r[Math.max(0, t - n)]),
  /** Lo que lee el scorer: las X pasan a ser la etiqueta anterior. */
  fill: (r) => fillAbstentions(r.map((c) => (c === "." ? "X" : c)) as Label[]),
}

function evaluate(expr: string, rows: Map<string, Cell[]>): Cell[] {
  expr = expr.trim()
  const call = expr.match(/^([a-z]+)\((.*)\)$/)
  if (!call) return rows.get(expr) ?? fail(`timeline: no hay ninguna fila «@${expr}»`)
  const fn = transforms[call[1]] ?? fail(`timeline: no existe la transformación «${call[1]}»`)
  // separa argumentos respetando los paréntesis anidados
  const args: string[] = []
  let depth = 0
  let cur = ""
  for (const ch of call[2]) {
    if (ch === "," && depth === 0) {
      args.push(cur)
      cur = ""
      continue
    }
    if (ch === "(") depth++
    if (ch === ")") depth--
    cur += ch
  }
  args.push(cur)
  return fn(evaluate(args[0], rows), args[1] === undefined ? undefined : Number(args[1]))
}

const COLORS: Record<string, string> = { H: "var(--color-blau)", A: "var(--color-grana)", D: "#bdb4a4" }

function strip(cells: Cell[]) {
  const n = cells.length
  const rects: string[] = []
  let i = 0
  while (i < n) {
    let j = i
    while (j < n && cells[j] === cells[i]) j++
    const c = cells[i]
    const x = i + 0.12
    const w = j - i - 0.24
    if (c === ".") rects.push(`<rect x="${x}" y="4.4" width="${w}" height="1.2" class="viz-unseen"/>`)
    else if (c === "X") rects.push(`<rect x="${x}" y="0.5" width="${w}" height="9" class="viz-x" vector-effect="non-scaling-stroke"/>`)
    else rects.push(`<rect x="${x}" y="0" width="${w}" height="10" fill="${COLORS[c]}"/>`)
    i = j
  }
  return `<svg class="viz-tl-bars" viewBox="0 0 ${n} 10" preserveAspectRatio="none" aria-hidden="true">${rects.join("")}</svg>`
}

function parseCell(unit: string | undefined) {
  const m = unit?.match(/^([\d.]+)\s*(s|frames?)$/)
  if (!m) return (k: number) => `${k}`
  const v = Number(m[1])
  return (k: number) => (m[2] === "s" ? `${+(k * v).toFixed(1)} s` : `${k * v} fr`)
}

function timeline(src: string) {
  const { opts, body } = split(src)
  const rows = new Map<string, Cell[]>()
  const list: { label: string; cells: Cell[] }[] = []
  for (const line of body) {
    const bar = line.indexOf("|")
    if (bar < 0) fail(`timeline: falta «|» en «${line}»`)
    let label = line.slice(0, bar).trim()
    const rhs = line.slice(bar + 1).trim()
    let id: string | undefined
    const tag = label.match(/^@([a-z0-9-]+)\s+(.*)$/i)
    if (tag) [, id, label] = tag
    const cells: Cell[] = rhs.startsWith("=")
      ? evaluate(rhs.slice(1), rows)
      : [...rhs.replace(/\s+/g, "")].map((c) => (LABEL_SET.has(c) ? (c as Cell) : fail(`timeline: «${c}» no es H, A, D, X ni «.»`)))
    if (list.length && cells.length !== list[0].cells.length)
      fail(`timeline: «${label}» tiene ${cells.length} celdas y la verdad ${list[0].cells.length}`)
    if (id) rows.set(id, cells)
    if (!list.length) rows.set("truth", cells) // la verdad siempre se puede usar como «truth»
    list.push({ label, cells })
  }
  if (!list.length) fail("timeline: no hay filas")

  const truth = list[0].cells as Label[]
  const n = truth.length
  const score = opts.score ?? "spell"
  const ticks = Number(opts.ticks ?? 0)
  const fmtTick = parseCell(opts.cell)
  const marks = (opts.marks ?? "").split(/\s+/).filter(Boolean).map(Number)

  const truthSpells = spells(truth)
  const rowHtml = list.map(({ label, cells }, r) => {
    const isTruth = r === 0
    const scored = !isTruth && score !== "none" && !cells.includes(".")
    const res = scored ? spellF1(truth, cells as Label[]) : undefined
    const numbers = isTruth
      ? `${
          marks.length
            ? `<div class="viz-tl-marks" aria-hidden="true">${marks
                .map((m, k) => `<span class="viz-mark" style="left:${pct(((m + 0.5) / n) * 100)}">${"①②③④⑤⑥⑦⑧⑨"[k] ?? k + 1}</span>`)
                .join("")}</div>`
            : ""
        }<div class="viz-tl-spells" aria-hidden="true">${truthSpells
          .map((s, k) => `<span style="left:${pct((s.start / n) * 100)};width:${pct(((s.stop - s.start) / n) * 100)}">#${k + 1}</span>`)
          .join("")}</div>`
      : ""
    const hits = res
      ? `<svg class="viz-tl-hits" viewBox="0 0 ${n} 2" preserveAspectRatio="none" aria-hidden="true">${res.predSpells
          .map((s) => `<rect x="${s.start + 0.12}" y="0" width="${s.stop - s.start - 0.24}" height="2" class="${s.hit ? "viz-hit" : "viz-miss"}"/>`)
          .join("")}</svg>`
      : ""
    const right = isTruth
      ? `<span class="viz-tl-n">${truthSpells.length} possessions</span>`
      : res
        ? `<b>${res.mean.toFixed(2)}</b><span>spellF1</span>${
            score === "both" ? `<em>${macroF1(truth, cells as Label[]).toFixed(2)} macroF1</em>` : ""
          }<span class="viz-tl-n">${res.nPred} poss.</span>`
        : ""
    return `<div class="viz-tl-row${isTruth ? ` is-truth${marks.length ? " has-marks" : ""}` : ""}"><div class="viz-tl-label">${inline(label)}</div><div class="viz-tl-track">${numbers}${strip(cells)}${hits}</div><div class="viz-tl-score">${right}</div></div>`
  })

  const axis = ticks
    ? `<div class="viz-tl-row viz-tl-axisrow" aria-hidden="true"><div></div><div class="viz-tl-axis">${Array.from(
        { length: Math.floor(n / ticks) + 1 },
        (_, k) => `<span style="left:${pct(((k * ticks) / n) * 100)}">${fmtTick(k * ticks)}</span>`,
      ).join("")}</div><div></div></div>`
    : ""

  const usesX = list.some((l) => l.cells.includes("X"))
  const usesDot = list.some((l) => l.cells.includes("."))
  const anyScore = list.some((l, r) => r > 0 && score !== "none" && !l.cells.includes("."))
  const legend = [
    `<span><i style="background:${COLORS.H}"></i>H · home in possession</span>`,
    `<span><i style="background:${COLORS.A}"></i>A · away in possession</span>`,
    `<span><i style="background:${COLORS.D}"></i>D · dead ball</span>`,
    usesX ? `<span><i class="viz-x"></i>X · no answer</span>` : "",
    usesDot ? `<span><i class="viz-unseen"></i>ball not seen</span>` : "",
    anyScore ? `<span><i class="viz-hit"></i>possession recovered (IoU ≥ 0.5)</span><span><i class="viz-miss"></i>not recovered</span>` : "",
  ].join("")

  return `<figure class="viz viz-timeline">${opts.title ? `<figcaption class="viz-title">${inline(opts.title)}</figcaption>` : ""}<div class="viz-tl" role="img" aria-label="${esc(
    opts.title ?? "Possession timeline",
  )}">${rowHtml.join("")}${axis}</div><div class="viz-legend">${legend}</div>${
    opts.caption ? `<p class="viz-caption">${inline(opts.caption)}</p>` : ""
  }</figure>`
}

/* ─── pitch ─────────────────────────────────────────────────────────────────────────────────────
 *  Coordenadas en metros: x de 0 a 105 (H ataca hacia la derecha), y de 0 a 68 (0 = banda de arriba).
 *  Varios instantes en un bloque, separados por una línea «---». Por instante:
 *  label: H                    la etiqueta (H/A/D/X) y, opcional, un texto: «label: H Barça keep it»
 *  mark: 1                     número ①… que lo enlaza con un timeline (marks:)
 *  caption: 0:03 · …           pie del instante
 *  home: 50,34 62,22           jugadores locales        away: 58,34 70,28   visitantes
 *  ball: 51,35                 balón                    lost: 60,40         último sitio visto (balón perdido)
 *  holder: 50,34               anillo de control alrededor de un jugador
 *  pass: 50,34 > 62,22         flecha de pase (también varias separadas por «;»)
 *  run: 40,20 > 48,18          carrera, punteada        zone: 50,34 1.5     círculo de radio en metros
 *  nearest                     dibuja la línea del balón al jugador más cercano (lo que ve el baseline)
 *  note: 62,18 texto           nota en esa posición
 *  view: full | left | right   todo el campo, una mitad o un zoom «x,y,ancho,alto» en metros
 *  Para toda la figura: title: …   cols: 2   footer: pie de la figura
 */
type Pt = [number, number]
const pt = (s: string): Pt => {
  const m = s.trim().match(/^(-?[\d.]+)\s*,\s*(-?[\d.]+)$/)
  return m ? [Number(m[1]), Number(m[2])] : fail(`pitch: «${s}» no es una posición x,y`)
}
const pts = (s: string) => s.split(/\s+/).filter(Boolean).map(pt)

const LABEL_TEXT: Record<string, string> = {
  H: "Home in possession",
  A: "Away in possession",
  D: "Dead ball",
  X: "No answer",
}

function pitchLines() {
  const arc = Math.sqrt(9.15 ** 2 - 5.5 ** 2)
  return `<g class="viz-lines" fill="none" vector-effect="non-scaling-stroke">
<rect x="0" y="0" width="105" height="68"/><line x1="52.5" y1="0" x2="52.5" y2="68"/><circle cx="52.5" cy="34" r="9.15"/>
<rect x="0" y="13.84" width="16.5" height="40.32"/><rect x="0" y="24.84" width="5.5" height="18.32"/>
<rect x="88.5" y="13.84" width="16.5" height="40.32"/><rect x="99.5" y="24.84" width="5.5" height="18.32"/>
<path d="M16.5 ${34 - arc}A9.15 9.15 0 0 1 16.5 ${34 + arc}"/><path d="M88.5 ${34 - arc}A9.15 9.15 0 0 0 88.5 ${34 + arc}"/>
<line x1="0" y1="30.34" x2="-1.6" y2="30.34"/><line x1="0" y1="37.66" x2="-1.6" y2="37.66"/><line x1="-1.6" y1="30.34" x2="-1.6" y2="37.66"/>
<line x1="105" y1="30.34" x2="106.6" y2="30.34"/><line x1="105" y1="37.66" x2="106.6" y2="37.66"/><line x1="106.6" y1="30.34" x2="106.6" y2="37.66"/>
</g><g class="viz-spots"><circle cx="52.5" cy="34" r="0.4"/><circle cx="11" cy="34" r="0.4"/><circle cx="94" cy="34" r="0.4"/></g>`
}

function pitchFrame(lines: string[], k: number) {
  const f: Record<string, string> = {}
  const notes: [Pt, string][] = []
  let nearest = false
  for (const line of lines) {
    if (line === "nearest") {
      nearest = true
      continue
    }
    const m = line.match(/^([a-z]+):\s*(.*)$/) ?? fail(`pitch: no entiendo «${line}»`)
    if (m[1] === "note") {
      const n = m[2].match(/^(-?[\d.]+\s*,\s*-?[\d.]+)\s+(.+)$/) ?? fail(`pitch: «note: x,y texto»`)
      notes.push([pt(n[1]), n[2]])
    } else f[m[1]] = m[2]
  }

  const view = f.view ?? "full"
  const zoom = view.match(/^(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)$/)
  const vb = zoom
    ? zoom.slice(1).map(Number)
    : view === "left"
      ? [-3, -3, 58.5, 74]
      : view === "right"
        ? [49.5, -3, 58.5, 74]
        : [-3, -3, 111, 74]
  const toPct = ([x, y]: Pt): [string, string] => [pct(((x - vb[0]) / vb[2]) * 100), pct(((y - vb[1]) / vb[3]) * 100)]

  const home = pts(f.home ?? "")
  const away = pts(f.away ?? "")
  const ball = f.ball ? pt(f.ball) : undefined
  const arrows = (key: string, cls: string) =>
    (f[key] ?? "")
      .split(";")
      .filter((s) => s.trim())
      .map((s) => {
        const [a, b] = s.split(">").map(pt)
        // la flecha termina un poco antes del destino para no tapar al jugador
        const d = Math.hypot(b[0] - a[0], b[1] - a[1])
        const e: Pt = [b[0] - ((b[0] - a[0]) / d) * 2, b[1] - ((b[1] - a[1]) / d) * 2]
        return `<line x1="${a[0]}" y1="${a[1]}" x2="${e[0]}" y2="${e[1]}" class="${cls}" marker-end="url(#viz-arrow)"/>`
      })
      .join("")

  let near = ""
  if (nearest && ball) {
    const all = [...home.map((p) => ({ p, team: "H" })), ...away.map((p) => ({ p, team: "A" }))]
    const best = all.reduce((a, b) => (Math.hypot(b.p[0] - ball[0], b.p[1] - ball[1]) < Math.hypot(a.p[0] - ball[0], a.p[1] - ball[1]) ? b : a))
    near = `<line x1="${ball[0]}" y1="${ball[1]}" x2="${best.p[0]}" y2="${best.p[1]}" class="viz-nearest" stroke="${COLORS[best.team]}"/>`
  }

  const zone = f.zone?.match(/^(-?[\d.]+\s*,\s*-?[\d.]+)\s+([\d.]+)$/)
  const svg = `<svg viewBox="${vb.join(" ")}" aria-hidden="true">
<defs><marker id="viz-arrow" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L6 3L0 6z" class="viz-arrowhead"/></marker></defs>
<rect x="-3" y="-3" width="111" height="74" class="viz-grass"/>
${Array.from({ length: 7 }, (_, i) => (i % 2 ? "" : `<rect x="${i * 15}" y="0" width="15" height="68" class="viz-band"/>`)).join("")}
${pitchLines()}
${zone ? `<circle cx="${pt(zone[1])[0]}" cy="${pt(zone[1])[1]}" r="${zone[2]}" class="viz-zone"/>` : ""}
${near}${arrows("run", "viz-run")}${arrows("pass", "viz-pass")}
${home.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${COLORS.H}" class="viz-player"/>`).join("")}
${away.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.9" fill="${COLORS.A}" class="viz-player"/>`).join("")}
${f.holder ? pts(f.holder).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" class="viz-holder"/>`).join("") : ""}
${f.lost ? `<circle cx="${pt(f.lost)[0]}" cy="${pt(f.lost)[1]}" r="1.1" class="viz-lost"/>` : ""}
${ball ? `<circle cx="${ball[0]}" cy="${ball[1]}" r="1.15" class="viz-ball"/>` : ""}
</svg>`

  const lab = (f.label ?? "").match(/^([HADX])\s*(.*)$/)
  const badge = lab
    ? `<span class="viz-badge viz-badge-${lab[1]}"><b>${lab[1]}</b>${inline(lab[2] || LABEL_TEXT[lab[1]])}</span>`
    : ""
  const mark = f.mark ? `<span class="viz-mark viz-mark-frame">${"①②③④⑤⑥⑦⑧⑨"[Number(f.mark) - 1] ?? f.mark}</span>` : ""
  const overlay = [
    ...notes.map(([p, text]) => {
      const [l, t] = toPct(p)
      return `<span class="viz-note" style="left:${l};top:${t}">${inline(text)}</span>`
    }),
    ...(f.lost ? [(() => {
      const [l, t] = toPct(pt(f.lost))
      return `<span class="viz-q" style="left:${l};top:${t}">?</span>`
    })()] : []),
  ].join("")

  return `<div class="viz-pitch" data-frame="${k}"><div class="viz-pitch-head">${mark}${badge}</div><div class="viz-pitch-field" style="aspect-ratio:${vb[2]} / ${vb[3]}">${svg}${overlay}</div>${
    f.caption ? `<p class="viz-pitch-caption">${inline(f.caption)}</p>` : ""
  }</div>`
}

// opciones de toda la figura (en cualquier instante): title, cols y footer (pie de la figura)
const PITCH_OPTS = /^(title|cols|footer):\s*(.*)$/

function pitch(src: string) {
  const opts: Record<string, string> = {}
  const frames = src.split(/^\s*---\s*$/m).map((b, k) =>
    pitchFrame(
      b
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => {
          const o = l.match(PITCH_OPTS)
          if (o) opts[o[1]] = o[2]
          return l && !l.startsWith("#") && !o
        }),
      k,
    ),
  )
  opts.caption = opts.footer
  const cols = Number(opts.cols ?? Math.min(frames.length, 2))
  return `<figure class="viz viz-pitches">${opts.title ? `<figcaption class="viz-title">${inline(opts.title)}</figcaption>` : ""}<div class="viz-pitch-grid" style="--cols:${cols}">${frames.join("")}</div><div class="viz-legend"><span><i class="viz-dot" style="background:${COLORS.H}"></i>Home (H)</span><span><i class="viz-dot" style="background:${COLORS.A}"></i>Away (A)</span><span><i class="viz-dot viz-dot-ball"></i>Ball</span></div>${
    opts.caption ? `<p class="viz-caption">${inline(opts.caption)}</p>` : ""
  }</figure>`
}

/* ─── bars ──────────────────────────────────────────────────────────────────────────────────────
 *  title: …    max: 1    caption: …
 *  1 frame late | 1.0000            etiqueta | valor (se enseña tal cual)
 *  8 frames late | 0.8933 | bad     tono opcional: good | bad | muted | accent (por defecto azul)
 */
function bars(src: string) {
  const { opts, body } = split(src)
  const rows = body.map((l) => l.split("|").map((s) => s.trim()))
  const values = rows.map((r) => Number(r[1].replace(/[^\d.-]/g, "")))
  const max = Number(opts.max ?? Math.max(...values))
  return `<figure class="viz viz-bars">${opts.title ? `<figcaption class="viz-title">${inline(opts.title)}</figcaption>` : ""}<div class="viz-bars-list">${rows
    .map(
      (r, i) =>
        `<div class="viz-bar"><span class="viz-bar-label">${inline(r[0])}</span><span class="viz-bar-track"><span class="viz-bar-fill viz-tone-${esc(
          r[2] ?? "blau",
        )}" style="width:${pct(Math.max(0, Math.min(1, values[i] / max)) * 100)}"></span></span><span class="viz-bar-value">${esc(r[1])}</span></div>`,
    )
    .join("")}</div>${opts.caption ? `<p class="viz-caption">${inline(opts.caption)}</p>` : ""}</figure>`
}

/* ─── stats ─────────────────────────────────────────────────────────────────────────────────────
 *  41% | of graded frames have no ball
 */
function stats(src: string) {
  const { body } = split(src)
  return `<div class="viz viz-stats">${body
    .map((l) => {
      const [v, t] = l.split("|").map((s) => s.trim())
      return `<div><b>${esc(v)}</b><span>${inline(t ?? "")}</span></div>`
    })
    .join("")}</div>`
}

/* ─── roadmap ───────────────────────────────────────────────────────────────────────────────────
 *  P1 | Unseen is not dead | Explicación en una línea
 */
function roadmap(src: string) {
  const { opts, body } = split(src)
  return `<figure class="viz viz-roadmap">${opts.title ? `<figcaption class="viz-title">${inline(opts.title)}</figcaption>` : ""}<ol>${body
    .map((l) => {
      const [id, title, text] = l.split("|").map((s) => s.trim())
      return `<li><span class="viz-step">${esc(id)}</span><div><b>${inline(title ?? "")}</b><p>${inline(text ?? "")}</p></div></li>`
    })
    .join("")}</ol></figure>`
}

const renderers: Record<string, (src: string) => string> = { timeline, pitch, bars, stats, roadmap }

/** HTML de un bloque de figura, o null si el lenguaje no es de figura (se pinta como código). */
export function renderViz(lang: string | undefined, src: string): string | null {
  const r = lang && renderers[lang.trim()]
  return r ? r(src) : null
}
