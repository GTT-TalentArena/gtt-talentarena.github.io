"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { defaultSplit, NO_SPLIT, outcomes, shortDate, type ResultPoint } from "@/lib/log-meta"

type Reference = { metric: string; split: string; value: number; label: string }
type Milestone = { date: string; title: string }

const DAY = 86_400_000
const t = (iso: string) => Date.parse(`${iso}T12:00:00Z`)
// card background (paper-2 at 60% over paper): the points' ring uses this colour
const SURFACE = "#ece6dc"

/** "Round" steps for the Y axis: the finest that leaves at most 6 intervals. */
function niceTicks(lo: number, hi: number) {
  const mag = 10 ** Math.floor(Math.log10((hi - lo) / 6))
  const steps = [1, 2, 2.5, 5, 10, 20].map((k) => k * mag)
  const step = steps.find((s) => Math.ceil(hi / s) - Math.floor(lo / s) <= 6) ?? steps.at(-1)!
  const start = Math.floor(lo / step) * step
  const end = Math.ceil(hi / step) * step
  const ticks: number[] = []
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Number(v.toFixed(10)))
  const decimals = Math.max(0, -Math.floor(Math.log10(step)) + (Math.round((step / 10 ** Math.floor(Math.log10(step))) * 10) % 10 ? 1 : 0))
  return { ticks, lo: start, hi: end, decimals }
}

const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(2) : v.toFixed(4))

/**
 * The log's results chart: one line per model joining its versions over time, for the chosen
 * metric and split. Each point links to the entry that measured it. In the background, the
 * challenge milestones and "today"; the dashed lines are the published references (lib/log-meta.ts).
 *
 * Model colours validated with the palette validator (6 slots on the paper, adjacent pairs and
 * the first 3 in all pairs). The pink falls below 3:1: that's why there are direct labels and a
 * table view.
 */
export function ResultsChart({
  points,
  references,
  colors,
  milestones,
  from,
  to,
}: {
  points: ResultPoint[]
  references: Reference[]
  colors: Record<string, string>
  milestones: Milestone[]
  from: string
  to: string
}) {
  const metrics = useMemo(() => {
    const names = [...new Set(points.map((p) => p.metric))]
    const rank = (n: string) => (n === "spellF1" ? 0 : n === "macroF1" ? 1 : 2)
    names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
    return names.length ? names : ["spellF1"]
  }, [points])

  const [metric, setMetric] = useState(metrics[0])
  const [split, setSplit] = useState(() => defaultSplit(points, metrics[0]))
  const splits = useMemo(() => {
    const s = [...new Set(points.filter((p) => p.metric === metric).map((p) => p.split))]
    return s.length ? s : [split]
  }, [points, metric, split])

  const chooseMetric = (m: string) => {
    setMetric(m)
    setSplit(defaultSplit(points, m))
  }

  const slice = points.filter((p) => p.metric === metric && p.split === split)
  const refs = references.filter((r) => r.metric === metric && r.split === split)
  const by = new Map<string, ResultPoint[]>()
  for (const p of slice) by.set(p.model, [...(by.get(p.model) ?? []), p])
  const series = [...by.entries()].map(([model, list]) => ({ model, color: colors[model], list }))

  const better = slice[0]?.better ?? "higher"
  const best = slice.length
    ? slice.reduce((a, b) => ((better === "higher" ? b.value > a.value : b.value < a.value) ? b : a))
    : undefined

  // real container size: the SVG is drawn at 1:1 so the text isn't distorted
  const box = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [today, setToday] = useState<string | null>(null)
  const [hover, setHover] = useState<ResultPoint | null>(null)
  useEffect(() => {
    setToday(new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date()))
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const narrow = (width ?? 1000) < 560
  const height = narrow ? 300 : 380
  const m = { top: 34, right: narrow ? 14 : 20, bottom: 30, left: 46 }
  const W = width ?? 1000
  const plotW = W - m.left - m.right
  const plotH = height - m.top - m.bottom

  // X axis: the whole phase (from kick-off to submission), extended if there are points or "today" after it
  const last = [to, ...slice.map((p) => p.date), today ?? to].sort().at(-1)!
  const x0 = t(from)
  const x1 = Math.max(t(last), x0 + 7 * DAY)
  const x = (iso: string) => m.left + ((t(iso) - x0) / (x1 - x0)) * plotW

  // versions of one model measured on the same day are spread out within that day instead of stacking
  const dayW = (plotW * DAY) / (x1 - x0)
  const shift = new Map<ResultPoint, number>()
  for (const s of series) {
    const byDay = new Map<string, ResultPoint[]>()
    for (const p of s.list) byDay.set(p.date, [...(byDay.get(p.date) ?? []), p])
    for (const list of byDay.values()) {
      const step = Math.min((dayW * 0.8) / Math.max(list.length - 1, 1), 16)
      list.forEach((p, i) => shift.set(p, (i - (list.length - 1) / 2) * step))
    }
  }
  const px = (p: ResultPoint) => x(p.date) + (shift.get(p) ?? 0)

  // Y axis: values, intervals and references, with margin; within [0, 1] if the metric is
  const ys = [...slice.flatMap((p) => [p.value, p.low ?? p.value, p.high ?? p.value]), ...refs.map((r) => r.value)]
  const unit = ys.every((v) => v >= 0 && v <= 1)
  let lo = ys.length ? Math.min(...ys) : 0
  let hi = ys.length ? Math.max(...ys) : 1
  const pad = Math.max((hi - lo) * 0.18, 0.03)
  lo -= pad
  hi += pad
  if (unit) [lo, hi] = [Math.max(0, lo), Math.min(1, hi)]
  const yAxis = niceTicks(lo, hi)
  const y = (v: number) => m.top + (1 - (v - yAxis.lo) / (yAxis.hi - yAxis.lo)) * plotH

  const mondays: string[] = []
  for (let d = x0; d <= x1; d += DAY) if (new Date(d).getUTCDay() === 1) mondays.push(new Date(d).toISOString().slice(0, 10))

  // direct label at the end of each line; if two collide, the top one stays and the other goes to the legend
  const ends = series
    .map((s) => ({ s, p: s.list.at(-1)! }))
    .map((e) => ({ ...e, yy: y(e.p.value), xx: px(e.p) }))
    .sort((a, b) => a.yy - b.yy)
  const shown: typeof ends = []
  for (const e of ends) if (!shown.some((k) => Math.abs(k.yy - e.yy) < 15 && Math.abs(k.xx - e.xx) < 140)) shown.push(e)

  const splitLabel = (s: string) => (s === NO_SPLIT ? "no split" : s)

  return (
    <figure className="rounded-2xl border border-line bg-paper-2/60 p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-5">
        <div>
          <p className="label text-muted">Results · one line per model, one point per version</p>
          <h2 className="font-display mt-2 text-[clamp(2rem,4.5vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.035em]">
            Model results <span className="accent">over time.</span>
          </h2>
        </div>
        <div className="min-w-48 rounded-xl border border-line bg-paper px-4 py-3">
          <p className="label text-muted">
            Best {metric} · {splitLabel(split)}
          </p>
          {best ? (
            <>
              <p className="mt-1 text-4xl font-semibold tracking-[-0.03em]">{fmt(best.value)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <span aria-hidden className="inline-block h-0.5 w-3.5 rounded-full" style={{ background: colors[best.model] }} />
                {best.model} · {best.version} · {shortDate(best.date)}
              </p>
            </>
          ) : (
            <p className="mt-1 text-4xl font-semibold tracking-[-0.03em] text-muted">—</p>
          )}
        </div>
      </div>

      {/* filters: one row, above everything they affect */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Choice label="Metric" options={metrics} value={metric} onChange={chooseMetric} />
        <Choice label="Split" options={splits} value={split} onChange={setSplit} format={splitLabel} />
      </div>

      <div ref={box} className="relative mt-4" style={{ height }}>
        {width !== null && (
          <svg width={W} height={height} className="block overflow-visible" role="img" aria-label={`${metric} on ${splitLabel(split)} by model and date`}>
            {/* rejilla */}
            {yAxis.ticks.map((v) => (
              <g key={v}>
                <line x1={m.left} x2={W - m.right} y1={y(v)} y2={y(v)} className="stroke-ink" strokeOpacity={0.1} />
                <text x={m.left - 10} y={y(v)} dy="0.32em" textAnchor="end" className="fill-muted font-mono text-[11px] tabular-nums">
                  {v.toFixed(yAxis.decimals)}
                </text>
              </g>
            ))}
            {mondays.map((d) => (
              <g key={d}>
                <line x1={x(d)} x2={x(d)} y1={m.top + plotH} y2={m.top + plotH + 5} className="stroke-ink" strokeOpacity={0.4} />
                <text x={x(d)} y={m.top + plotH + 19} textAnchor="middle" className="fill-muted font-mono text-[10.5px] uppercase tracking-[0.06em]">
                  {shortDate(d)}
                </text>
              </g>
            ))}
            <line x1={m.left} x2={W - m.right} y1={m.top + plotH} y2={m.top + plotH} className="stroke-ink" strokeOpacity={0.45} />

            {/* challenge milestones, in the background */}
            {milestones
              .filter((k) => t(k.date) >= x0 && t(k.date) <= x1)
              .map((k) => {
                const right = x(k.date) > W - 140
                return (
                  <g key={k.title}>
                    <line x1={x(k.date)} x2={x(k.date)} y1={m.top - 14} y2={m.top + plotH} className="stroke-ink" strokeOpacity={0.3} strokeDasharray="3 4" />
                    <text
                      x={x(k.date) + (right ? -6 : 6)}
                      y={m.top - 18}
                      textAnchor={right ? "end" : "start"}
                      className="fill-muted font-mono text-[10px] uppercase tracking-[0.08em]"
                    >
                      {k.title}
                    </text>
                  </g>
                )
              })}
            {today && t(today) >= x0 && t(today) <= x1 && (
              <g>
                <line x1={x(today)} x2={x(today)} y1={m.top - 4} y2={m.top + plotH} className="stroke-accent" strokeOpacity={0.35} />
                <text x={x(today) + 5} y={m.top - 5} className="fill-accent font-mono text-[10px] uppercase tracking-[0.08em]">
                  Today
                </text>
              </g>
            )}

            {/* referencias publicadas */}
            {refs.map((r) => (
              <g key={r.label}>
                <line x1={m.left} x2={W - m.right} y1={y(r.value)} y2={y(r.value)} className="stroke-ink" strokeOpacity={0.55} strokeDasharray="6 5" />
                <text x={W - m.right - 4} y={y(r.value) - 7} textAnchor="end" className="fill-ink-2 font-mono text-[10.5px]">
                  {r.label} · {fmt(r.value)}
                </text>
              </g>
            ))}

            {/* intervalos de bootstrap */}
            {slice
              .filter((p) => p.low !== undefined)
              .map((p) => (
                <g key={`ci-${p.slug}-${p.model}-${p.version}`} stroke={colors[p.model]} strokeOpacity={0.5} strokeWidth={1.5}>
                  <line x1={px(p)} x2={px(p)} y1={y(p.low!)} y2={y(p.high!)} />
                  <line x1={px(p) - 4} x2={px(p) + 4} y1={y(p.low!)} y2={y(p.low!)} />
                  <line x1={px(p) - 4} x2={px(p) + 4} y1={y(p.high!)} y2={y(p.high!)} />
                </g>
              ))}

            {/* one line per model */}
            {series.map((s) => (
              <polyline
                key={s.model}
                points={s.list.map((p) => `${px(p)},${y(p.value)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ))}

            {/* the best result, with a ring */}
            {best && <circle cx={px(best)} cy={y(best.value)} r={9.5} fill="none" className="stroke-ink" strokeWidth={1.5} />}

            {/* points: each one is a link to its entry */}
            {slice.map((p) => (
              <a
                key={`${p.slug}-${p.model}-${p.version}`}
                href={`/log/${p.slug}/`}
                aria-label={`${p.model} ${p.version}: ${p.metric} ${fmt(p.value)} on ${shortDate(p.date)}. ${p.title}`}
                onMouseEnter={() => setHover(p)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(p)}
                onBlur={() => setHover(null)}
                className="outline-none"
              >
                <circle cx={px(p)} cy={y(p.value)} r={14} fill="transparent" />
                <circle
                  cx={px(p)}
                  cy={y(p.value)}
                  r={hover === p ? 6 : 4.5}
                  fill={colors[p.model]}
                  stroke={SURFACE}
                  strokeWidth={2}
                />
              </a>
            ))}

            {/* etiquetas directas */}
            {!narrow &&
              shown.map(({ s, p, xx, yy }) => {
                const left = xx > W - 150
                return (
                  <text
                    key={s.model}
                    x={xx + (left ? -12 : 12)}
                    y={yy}
                    dy="0.32em"
                    textAnchor={left ? "end" : "start"}
                    className="pointer-events-none fill-ink-2 text-[12.5px] font-medium"
                    paintOrder="stroke"
                    stroke={SURFACE}
                    strokeWidth={4}
                    strokeLinejoin="round"
                  >
                    {s.model} {p.version}
                  </text>
                )
              })}
          </svg>
        )}

        {width !== null && slice.length === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center" style={{ paddingLeft: m.left }}>
            <div className="max-w-sm rounded-xl bg-paper/80 px-5 py-4 backdrop-blur-sm">
              <p className="font-display text-xl font-semibold tracking-[-0.02em]">No model results yet</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Every experiment or iteration that reports a model, its version and a {metric} adds a point here.
              </p>
            </div>
          </div>
        )}

        {width !== null && hover && <Tooltip p={hover} color={colors[hover.model]} left={px(hover)} top={y(hover.value)} width={W} />}
      </div>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-t border-line pt-4">
        {series.length >= 2 ? (
          <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Models">
            {series.map((s) => (
              <li key={s.model} className="flex items-center gap-2 text-sm">
                <span aria-hidden className="inline-block h-0.5 w-4 rounded-full" style={{ background: s.color }} />
                {s.model}
                <span className="font-mono text-xs text-muted">
                  {s.list.length} {s.list.length === 1 ? "version" : "versions"}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="label text-muted">
            {refs.length > 0 ? "Dashed line · published baseline for this split" : "Points only compare within one metric and one split"}
          </p>
        )}
        <Table slice={slice} metric={metric} colors={colors} />
      </div>
    </figure>
  )
}

function Choice({
  label,
  options,
  value,
  onChange,
  format = (s) => s,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
  format?: (s: string) => string
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="label mr-1 text-muted">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
            o === value ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink"
          }`}
        >
          {format(o)}
        </button>
      ))}
    </div>
  )
}

function Tooltip({ p, color, left, top, width }: { p: ResultPoint; color: string; left: number; top: number; width: number }) {
  const flip = left > width - 260
  const below = top < 150
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-10 w-60 rounded-xl border border-line bg-paper p-3.5 shadow-[0_18px_40px_-18px_rgb(11_14_44/0.45)]"
      style={{
        left: flip ? left - 252 : left + 14,
        top: below ? top + 14 : top - 14,
        transform: below ? undefined : "translateY(-100%)",
      }}
    >
      <p className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-[-0.02em]">{fmt(p.value)}</span>
        {p.low !== undefined && (
          <span className="font-mono text-xs text-muted">
            {fmt(p.low)}–{fmt(p.high!)}
          </span>
        )}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm">
        <span aria-hidden className="inline-block h-0.5 w-3.5 rounded-full" style={{ background: color }} />
        {p.model} · {p.version}
      </p>
      <p className="label mt-2 text-muted">
        {p.metric} · {p.split === NO_SPLIT ? "no split" : p.split} · {shortDate(p.date)}
        {p.outcome && <> · {outcomes[p.outcome].symbol} {outcomes[p.outcome].label}</>}
      </p>
      <p className="mt-2 line-clamp-2 border-t border-line pt-2 text-sm leading-snug">{p.title}</p>
      <p className="label mt-1.5 text-accent">Open the entry →</p>
    </div>
  )
}

/** The same information without the chart (accessible and not mouse-dependent). */
function Table({ slice, metric, colors }: { slice: ResultPoint[]; metric: string; colors: Record<string, string> }) {
  if (!slice.length) return null
  return (
    <details className="group w-full">
      <summary className="label cursor-pointer list-none text-muted hover:text-ink">
        <span className="group-open:hidden">Show as table ↓</span>
        <span className="hidden group-open:inline">Hide table ↑</span>
      </summary>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="label text-muted">
            <tr className="border-b border-line">
              <th className="py-2 pr-4 font-normal">Date</th>
              <th className="py-2 pr-4 font-normal">Model</th>
              <th className="py-2 pr-4 font-normal">Version</th>
              <th className="py-2 pr-4 text-right font-normal">{metric}</th>
              <th className="py-2 pr-4 text-right font-normal">Interval</th>
              <th className="py-2 font-normal">Entry</th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {[...slice].reverse().map((p) => (
              <tr key={`${p.slug}-${p.model}-${p.version}`} className="border-b border-line/60">
                <td className="py-2 pr-4">{shortDate(p.date)}</td>
                <td className="py-2 pr-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span aria-hidden className="inline-block h-0.5 w-3 rounded-full" style={{ background: colors[p.model] }} />
                    {p.model}
                  </span>
                </td>
                <td className="py-2 pr-4">{p.version}</td>
                <td className="py-2 pr-4 text-right">{fmt(p.value)}</td>
                <td className="py-2 pr-4 text-right text-muted">{p.low !== undefined ? `${fmt(p.low)}–${fmt(p.high!)}` : "—"}</td>
                <td className="py-2 font-sans">
                  <a href={`/log/${p.slug}/`} className="underline decoration-accent decoration-2 underline-offset-4 hover:text-accent">
                    {p.title}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
