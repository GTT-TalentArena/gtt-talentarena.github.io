/**
 * spellF1 y macroF1 del reto, portados de evaluation/possession_metrics.py (fork) para los ejemplos
 * de juguete del log. Trabajan sobre etiquetas H/A/D/X, una por celda. Mismas reglas que el scorer:
 * las X de la predicción se rellenan con la etiqueta anterior (o la siguiente al principio), una
 * posesión es una racha máxima de H o de A, y se emparejan una a una por IoU con el mismo equipo.
 */

export type Label = "H" | "A" | "D" | "X"
export type Spell = { start: number; stop: number; label: Label }

export const IOUS = [0.3, 0.4, 0.5, 0.6, 0.7]

/** Tramos donde la verdad no es X (en los ejemplos suele ser todo). */
function validRuns(gt: Label[]) {
  const runs: [number, number][] = []
  let start = -1
  gt.forEach((g, i) => {
    if (g !== "X" && start < 0) start = i
    if (g === "X" && start >= 0) {
      runs.push([start, i])
      start = -1
    }
  })
  if (start >= 0) runs.push([start, gt.length])
  return runs
}

/** Lo que lee el scorer: cada X pasa a ser la etiqueta anterior de su tramo (la siguiente si no hay). */
export function fillAbstentions(pred: Label[], gt?: Label[]) {
  const out = [...pred]
  for (const [a, b] of validRuns(gt ?? pred.map(() => "H"))) {
    const known = out.slice(a, b).findIndex((l) => l !== "X")
    if (known < 0) continue
    let last = out[a + known]
    for (let i = a; i < b; i++) out[i] === "X" ? (out[i] = last) : (last = out[i])
  }
  return out
}

export function spells(codes: Label[], runs = validRuns(codes)): Spell[] {
  const out: Spell[] = []
  for (const [a, b] of runs) {
    let s = a
    for (let i = a + 1; i <= b; i++) {
      if (i === b || codes[i] !== codes[s]) {
        if (codes[s] === "H" || codes[s] === "A") out.push({ start: s, stop: i, label: codes[s] })
        s = i
      }
    }
  }
  return out
}

/** spellF1 medio sobre IoU 0.3–0.7 y, para dibujar, qué posesiones predichas casan a IoU 0.5. */
export function spellF1(gt: Label[], pred: Label[]) {
  const runs = validRuns(gt)
  const G = spells(gt, runs)
  const P = spells(fillAbstentions(pred, gt), runs)
  const pairs: { iou: number; i: number; j: number }[] = []
  G.forEach((g, i) =>
    P.forEach((p, j) => {
      if (p.label !== g.label || p.stop <= g.start || g.stop <= p.start) return
      const inter = Math.min(g.stop, p.stop) - Math.max(g.start, p.start)
      const union = Math.max(g.stop, p.stop) - Math.min(g.start, p.start)
      pairs.push({ iou: inter / union, i, j })
    }),
  )
  pairs.sort((a, b) => b.iou - a.iou || a.i - b.i || a.j - b.j)

  const match = (th: number) => {
    const gi = new Set<number>()
    const pj = new Set<number>()
    for (const { iou, i, j } of pairs) {
      if (iou < th) break
      if (gi.has(i) || pj.has(j)) continue
      gi.add(i)
      pj.add(j)
    }
    return pj
  }
  const f1s = IOUS.map((th) => {
    const tp = match(th).size
    return tp ? (2 * tp) / (G.length + P.length) : 0
  })
  const hit = match(0.5)
  return {
    mean: f1s.reduce((s, f) => s + f, 0) / f1s.length,
    perIou: f1s,
    nTruth: G.length,
    nPred: P.length,
    predSpells: P.map((p, j) => ({ ...p, hit: hit.has(j) })),
  }
}

/** Media sin ponderar del F1 de H, A y D sobre las celdas puntuadas; una X cuenta como fallo. */
export function macroF1(gt: Label[], pred: Label[]) {
  const f1 = (k: Label) => {
    let tp = 0
    let fp = 0
    let fn = 0
    gt.forEach((g, i) => {
      if (g === "X") return
      if (g === k && pred[i] === k) tp++
      else if (pred[i] === k) fp++
      else if (g === k) fn++
    })
    return tp ? (2 * tp) / (2 * tp + fp + fn) : 0
  }
  return (f1("H") + f1("A") + f1("D")) / 3
}
