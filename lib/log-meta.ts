/** Tipos y etiquetas del log del modelo de posesión, sin acceso a disco (se pueden usar en el navegador). Ver lib/log.ts. */

export const logTypes = {
  study: { label: "Study", description: "Papers, state of the art, the challenge itself" },
  code: { label: "Code", description: "Pipeline and tooling in the challenge repo" },
  experiment: { label: "Experiment", description: "A hypothesis about the model, tested" },
  iteration: { label: "Iteration", description: "A new version of the possession model" },
  data: { label: "Data", description: "Exploring the tracking" },
  decision: { label: "Decision", description: "What we chose for the model, and why" },
  // la genera sola el workflow publish-pr-log.yml del fork por cada PR fusionado en main
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
  /** Modelo y versión medidos: cada métrica con modelo es un punto de la gráfica de resultados. */
  model?: string
  version?: string
  /** Intervalo de bootstrap (p. ej. run_evaluation.py --bootstrap 1000), si se calculó. */
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
 * Líneas de referencia de la gráfica de resultados, publicadas por el reto (EVALUATION.md del fork).
 * Solo se comparan puntos de la misma métrica y el mismo split: la ventana pública y el partido
 * completo dan números distintos para el mismo modelo.
 */
export const references: { metric: string; split: string; value: number; label: string }[] = [
  { metric: "spellF1", split: "public-5min", value: 0.3256, label: "baseline_smooth50" },
  { metric: "spellF1", split: "full-match", value: 0.2433, label: "Published floor · baseline_smooth50" },
  { metric: "macroF1", split: "full-match", value: 0.6724, label: "baseline_smooth50" },
]

/** Un punto de la gráfica de resultados: una métrica de un modelo y versión, medida en una entrada. */
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

// spellf1, SpellF1… cuentan como la misma métrica
const canonical: Record<string, string> = { spellf1: "spellF1", macrof1: "macroF1" }
export const metricName = (name: string) => canonical[name.toLowerCase()] ?? name

/** Todas las métricas con modelo, de la más antigua a la más reciente. */
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

/** Split que se enseña por defecto para una métrica: la ventana pública si existe; si no, el más usado. */
export function defaultSplit(points: ResultPoint[], metric: string) {
  const counts = new Map<string, number>()
  for (const p of points) if (p.metric === metric) counts.set(p.split, (counts.get(p.split) ?? 0) + 1)
  if (counts.has("public-5min") || counts.size === 0) return "public-5min"
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0]
}

/** Colores de los modelos, en orden fijo (validado contra el papel; ver results-chart.tsx). */
export const modelPalette = ["#1d3fc9", "#a50044", "#0b8fa8", "#9a6a00", "#e87ba4", "#7a3fbf"] as const
export const otherModelColor = "#8f8b9c"

/**
 * Color de cada modelo según el orden en que aparece por primera vez en el log. Así un modelo
 * conserva su color aunque se filtre la gráfica o se añadan modelos nuevos. Del 7.º en adelante, gris.
 */
export function modelColors(entries: LogEntry[]) {
  const order: string[] = []
  for (const e of [...entries].sort((a, b) => a.date.localeCompare(b.date) || a.slug.localeCompare(b.slug)))
    for (const m of e.metrics) if (m.model && !order.includes(m.model)) order.push(m.model)
  return Object.fromEntries(order.map((model, i) => [model, modelPalette[i] ?? otherModelColor])) as Record<string, string>
}

/** Formato corto de fecha: «24 Oct». */
export function shortDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })
}

/** Lunes de la semana de una fecha AAAA-MM-DD (en UTC). */
export function weekStart(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}
