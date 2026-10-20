/** Tipos y etiquetas del log, sin acceso a disco (se pueden usar en el navegador). Ver lib/log.ts. */

export const logTypes = {
  study: { label: "Study", description: "Reading, research, notes" },
  code: { label: "Code", description: "Tools, infrastructure, refactors" },
  experiment: { label: "Experiment", description: "A hypothesis, tested" },
  iteration: { label: "Iteration", description: "A new version of the model" },
  data: { label: "Data", description: "Exploring the tracking" },
  decision: { label: "Decision", description: "What we chose, and why" },
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
