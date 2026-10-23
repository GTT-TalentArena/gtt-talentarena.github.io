/**
 * The challenge's spellF1 and macroF1, ported from evaluation/possession_metrics.py (fork) for the
 * log's toy examples. They work on H/A/D/X labels, one per cell. Same rules as the scorer:
 * the prediction's X are filled with the previous label (or the next one at the start), a
 * possession is a maximal run of H or of A, and they are matched one to one by IoU with the same team.
 */

export type Label = "H" | "A" | "D" | "X"
export type Spell = { start: number; stop: number; label: Label }

export const IOUS = [0.3, 0.4, 0.5, 0.6, 0.7]

/** Stretches where the truth isn't X (in the examples it's usually everything). */
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

/** What the scorer reads: each X becomes the previous label in its stretch (the next one if there is none). */
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

/** Mean spellF1 over IoU 0.3–0.7 and, for drawing, which predicted possessions match at IoU 0.5. */
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

/** Unweighted mean of the F1 of H, A and D over the scored cells; an X counts as a miss. */
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
