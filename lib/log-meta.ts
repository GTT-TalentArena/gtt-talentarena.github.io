/** Types and labels of the possession model log, without disk access (usable in the browser). See lib/log.ts. */

export const logTypes = {
  study: { label: "Study", description: "Papers, state of the art, the challenge itself" },
  code: { label: "Code", description: "Pipeline and tooling in the challenge repo" },
  experiment: { label: "Experiment", description: "A hypothesis about the model, tested" },
  iteration: { label: "Iteration", description: "A new version of the possession model" },
  data: { label: "Data", description: "Exploring the tracking" },
  decision: { label: "Decision", description: "What we chose for the model, and why" },
  // generated automatically by the fork's publish-pr-log.yml workflow for each PR merged into main
  change: { label: "Change", description: "A pull request merged in the challenge repo" },
} as const

export type LogType = keyof typeof logTypes

export const outcomes = {
  success: { label: "Success", symbol: "✓" },
  failure: { label: "Failed", symbol: "✕" },
  mixed: { label: "Mixed", symbol: "±" },
  open: { label: "Open", symbol: "…" },
} as const

export type Outcome = keyof typeof outcomes

export type Metric = {
  name: string
  value: number
  before?: number
  split?: string
  better: "higher" | "lower"
  /** Model and version measured: each metric with a model is a point on the results chart. */
  model?: string
  version?: string
  /** Bootstrap interval (e.g. run_evaluation.py --bootstrap 1000), if computed. */
  low?: number
  high?: number
}

export type LogEntry = {
  slug: string
  title: string
  date: string
  type: LogType
  outcome?: Outcome
  authors: string[]
  summary: string
  metrics: Metric[]
  tags: string[]
  links: { label: string; href: string }[]
  html: string
  minutes: number
}

/**
 * Reference lines on the results chart, published by the challenge (the fork's EVALUATION.md).
 * Only points with the same metric and split are compared: the public window and the full
 * match give different numbers for the same model.
 */
export const references: { metric: string; split: string; value: number; label: string }[] = [
  { metric: "spellF1", split: "public-5min", value: 0.3256, label: "baseline_smooth50" },
  { metric: "spellF1", split: "full-match", value: 0.2433, label: "Published floor · baseline_smooth50" },
  { metric: "macroF1", split: "full-match", value: 0.6724, label: "baseline_smooth50" },
]

/** A point on the results chart: a metric of a model and version, measured in an entry. */
export type ResultPoint = {
  slug: string
  title: string
  date: string
  outcome?: Outcome
  metric: string
  split: string
  value: number
  low?: number
  high?: number
  model: string
  version: string
  better: "higher" | "lower"
}

export const NO_SPLIT = "unspecified"

// spellf1, SpellF1… count as the same metric
const canonical: Record<string, string> = { spellf1: "spellF1", macrof1: "macroF1" }
export const metricName = (name: string) => canonical[name.toLowerCase()] ?? name

/** All metrics with a model, oldest first. */
export function resultPoints(entries: LogEntry[]): ResultPoint[] {
  return entries
    .flatMap((e) =>
      e.metrics
        .filter((m) => m.model && m.version)
        .map((m) => ({
          slug: e.slug,
          title: e.title,
          date: e.date,
          outcome: e.outcome,
          metric: metricName(m.name),
          split: m.split ?? NO_SPLIT,
          value: m.value,
          low: m.low,
          high: m.high,
          model: m.model!,
          version: m.version!,
          better: m.better,
        })),
    )
    .sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug))
}

/** Split shown by default for a metric: the public window if it exists; otherwise the most used. */
export function defaultSplit(points: ResultPoint[], metric: string) {
  const counts = new Map<string, number>()
  for (const p of points) if (p.metric === metric) counts.set(p.split, (counts.get(p.split) ?? 0) + 1)
  if (counts.has("public-5min") || counts.size === 0) return "public-5min"
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

/** Model colours, in a fixed order (validated against the paper; see results-chart.tsx). */
export const modelPalette = ["#1d3fc9", "#a50044", "#0b8fa8", "#9a6a00", "#e87ba4", "#7a3fbf"] as const
export const otherModelColor = "#8f8b9c"

/**
 * Each model's colour, by the order in which it first appears in the log. That way a model
 * keeps its colour even if the chart is filtered or new models are added. From the 7th on, grey.
 */
export function modelColors(entries: LogEntry[]) {
  const order: string[] = []
  for (const e of [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)))
    for (const m of e.metrics) if (m.model && !order.includes(m.model)) order.push(m.model)
  return Object.fromEntries(order.map((model, i) => [model, modelPalette[i] ?? otherModelColor])) as Record<string, string>
}

/** Short date format: "24 Oct". */
export function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })
}

/** Monday of the week of a YYYY-MM-DD date (in UTC). */
export function weekStart(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
