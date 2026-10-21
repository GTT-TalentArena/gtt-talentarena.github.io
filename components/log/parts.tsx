import { squad } from "@/lib/content"
import { logTypes, outcomes, type LogType, type Metric, type Outcome } from "@/lib/log-meta"

export const outcomeTone: Record<Outcome, string> = {
  success: "bg-live/15 text-ink border-transparent",
  failure: "bg-fail/12 text-fail border-transparent",
  mixed: "bg-ball/40 text-ink border-transparent",
  open: "border-line text-muted",
}

export const outcomeDot: Record<Outcome, string> = {
  success: "var(--color-live)",
  failure: "var(--color-fail)",
  mixed: "#b8a300",
  open: "var(--color-ink)",
}

export function TypeChip({ type }: { type: LogType }) {
  return (
    <span className="label inline-flex items-center rounded-full border border-ink/25 px-2.5 py-1 text-[0.62rem]">
      {logTypes[type].label}
    </span>
  )
}

export function OutcomeChip({ outcome }: { outcome: Outcome }) {
  const o = outcomes[outcome]
  return (
    <span className={`label inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.62rem] ${outcomeTone[outcome]}`}>
      <span aria-hidden>{o.symbol}</span>
      {o.label}
    </span>
  )
}

/** El modelo y la versión de una métrica, con el mismo color que su línea en la gráfica de resultados. */
export function ModelTag({ model, version, color }: { model: string; version?: string; color?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono normal-case tracking-normal">
      <span aria-hidden className="inline-block h-0.5 w-3.5 rounded-full bg-ink" style={color ? { background: color } : undefined} />
      {model}
      {version && <span className="text-muted">{version}</span>}
    </span>
  )
}

/** «0.2433 → 0.3120 ▲ +0.0687», en verde si mejora y en naranja si empeora. */
export function MetricPill({ m, big = false, color }: { m: Metric; big?: boolean; color?: string }) {
  const delta = m.before === undefined ? undefined : m.value - m.before
  const better = delta === undefined ? undefined : m.better === "higher" ? delta > 0 : delta < 0
  const fmt = (n: number) => (Math.abs(n) >= 100 ? n.toFixed(0) : Math.abs(n) >= 10 ? n.toFixed(2) : n.toFixed(4))
  return (
    <span
      className={`inline-flex flex-wrap items-baseline gap-x-2 rounded-xl border border-line font-mono tabular-nums ${big ? "flex-col gap-y-1 p-4" : "px-3 py-1.5 text-xs"}`}
    >
      {m.model && (
        <span className={big ? "text-sm" : ""}>
          <ModelTag model={m.model} version={m.version} color={color} />
        </span>
      )}
      <span className="label text-muted">
        {m.name}
        {m.split && <span className="normal-case tracking-normal"> · {m.split}</span>}
      </span>
      <span className={big ? "font-display-tight text-[clamp(2.4rem,5vw,3.6rem)]" : "text-sm"}>{fmt(m.value)}</span>
      {big && m.low !== undefined && (
        <span className="text-xs text-muted">
          bootstrap {fmt(m.low)}–{fmt(m.high!)}
        </span>
      )}
      {delta !== undefined && (
        <span className={better ? "text-[#1f8a52]" : delta === 0 ? "text-muted" : "text-fail"}>
          {delta > 0 ? "▲ +" : delta < 0 ? "▼ " : "= "}
          {fmt(delta)} <span className="text-muted">vs {fmt(m.before!)}</span>
        </span>
      )}
    </span>
  )
}

const byHandle = new Map(squad.filter((p) => p.github).map((p) => [p.github!, p]))

export function Authors({ handles, withNames = true }: { handles: string[]; withNames?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex -space-x-1.5">
        {handles.map((h) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={h}
            src={`https://avatars.githubusercontent.com/${h}?s=64`}
            alt=""
            width={22}
            height={22}
            loading="lazy"
            className="size-[22px] rounded-full bg-paper-3 object-cover ring-2 ring-paper grayscale"
          />
        ))}
      </span>
      {withNames && <span className="text-sm text-muted">{handles.map((h) => byHandle.get(h)?.name ?? h).join(", ")}</span>}
    </span>
  )
}
