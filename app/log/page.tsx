import type { Metadata } from "next"
import { fixtures, now, site } from "@/lib/content"
import {
  defaultSplit,
  getEntries,
  logTypes,
  modelColors,
  references,
  resultPoints,
  shortDate,
  weekStart,
  type LogEntry,
  type LogType,
} from "@/lib/log"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Reveal } from "@/components/reveal"
import { LogRow } from "@/components/log/log-row"
import { Chronology, TypeFilter } from "@/components/log/chronology"
import { ResultsChart } from "@/components/log/results-chart"

export const metadata: Metadata = {
  title: "Log",
  description:
    "GTT's log of the work on the possession model: what we study, the improvements we find and the tests we run in our fork of the challenge — the ones that worked and the ones that didn't.",
}

const KICKOFF = fixtures[0].start

export default function LogPage() {
  const entries = getEntries()
  const counts: Partial<Record<LogType, number>> = {}
  for (const e of entries) counts[e.type] = (counts[e.type] ?? 0) + 1

  const tested = entries.filter((e) => e.type === "experiment" || e.type === "iteration")
  const ok = tested.filter((e) => e.outcome === "success").length
  const ko = tested.filter((e) => e.outcome === "failure").length
  // resultados de los modelos: la gráfica y el «mejor» solo comparan dentro de un mismo split
  const points = resultPoints(entries)
  const colors = modelColors(entries)
  const bestSplit = defaultSplit(points, "spellF1")
  const spell = points.filter((p) => p.metric === "spellF1" && p.split === bestSplit).map((p) => p.value)
  const best = spell.length ? Math.max(...spell) : undefined

  // semanas de partido desde el arranque
  const weeks = new Map<string, LogEntry[]>()
  for (const e of entries) {
    const w = weekStart(e.date)
    weeks.set(w, [...(weeks.get(w) ?? []), e])
  }
  const matchweek = (w: string) => Math.floor((Date.parse(w) - Date.parse(weekStart(KICKOFF))) / (7 * 86_400_000)) + 1

  const last = entries[0]?.date
  const to = [fixtures[1].start, last ?? KICKOFF].sort().at(-1)!

  return (
    <>
      <Header />
      <main id="content">
        <section className="grain px-4 pb-12 pt-24 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="label grid grid-cols-2 gap-y-2 border-b border-line pb-3 text-muted sm:grid-cols-3">
              <span>GTT ©2026 — The log</span>
              <span className="text-right sm:text-center">
                {entries.length} {entries.length === 1 ? "entry" : "entries"}
                {last && <> · updated {shortDate(last)}</>}
              </span>
              <span className="hidden text-right sm:block">The possession model</span>
            </div>

            <h1 className="font-display-tight mt-10 text-[clamp(4.5rem,calc(19vw*var(--display-scale)),calc(17rem*var(--display-scale)))]">
              The <span className="accent">log.</span>
            </h1>

            <div className="mt-8 grid gap-8 border-t border-ink pt-6 md:grid-cols-12 md:gap-6">
              <div className="md:col-span-6 lg:col-span-5">
                <p className="text-balance text-xl leading-snug sm:text-2xl">
                  What we study, the improvements we find and the tests we run on the possession model —{" "}
                  <span className="accent [--accent-base:1.15em]">the ones that worked and the ones that didn&apos;t.</span>
                </p>
                <p className="mt-5 text-pretty leading-relaxed text-muted">
                  The work itself happens in{" "}
                  <a
                    href={site.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-ink underline decoration-accent decoration-2 underline-offset-4"
                  >
                    our fork of the challenge
                  </a>
                  : rules, possession changes, temporal continuity, hysteresis, minimum duration and smoothing.
                </p>
              </div>
              <dl className="grid grid-cols-3 gap-4 rounded-2xl border border-line bg-paper-2/70 p-5 md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
                <div className="flex flex-col justify-between gap-1">
                  <dt className="label text-muted">Entries</dt>
                  <dd className="mt-1 font-mono text-2xl tabular-nums">{entries.length}</dd>
                </div>
                <div className="flex flex-col justify-between gap-1">
                  <dt className="label text-muted">Tests ✓ / ✕</dt>
                  <dd className="mt-1 font-mono text-2xl tabular-nums">
                    {ok} / {ko}
                  </dd>
                </div>
                <div className="flex flex-col justify-between gap-1">
                  <dt className="label text-muted">
                    Best spellF1 <span className="normal-case tracking-normal">· {bestSplit}</span>
                  </dt>
                  <dd className="mt-1 font-mono text-2xl tabular-nums">{best !== undefined ? best.toFixed(4) : "—"}</dd>
                </div>
                <p className="label col-span-3 border-t border-line pt-3 text-muted">
                  Baseline to beat · {now.target.value}
                </p>
              </dl>
            </div>
          </div>
        </section>

        {/* primer plano: los resultados de los modelos */}
        <section id="results" aria-label="Model results" className="px-4 pb-12 sm:px-6 lg:px-10">
          <Reveal className="mx-auto max-w-[1440px]">
            <ResultsChart
              points={points}
              references={references}
              colors={colors}
              milestones={fixtures.map((f) => ({ date: f.start, title: f.title }))}
              from={KICKOFF}
              to={fixtures[1].start}
            />
          </Reveal>
        </section>

        <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            {/* segundo plano: la cronología de entradas, encima de la lista a la que enlaza */}
            <Chronology
              from={KICKOFF}
              to={to}
              milestones={fixtures.map((f) => ({ date: f.start, title: f.title }))}
              dots={entries.map(({ slug, title, date, type, outcome }) => ({ slug, title, date, type, outcome }))}
            />

            <div className="mt-10">
              <TypeFilter counts={counts} />
            </div>

            {entries.length === 0 ? (
              <p className="mt-10 border-t border-line pt-6 text-muted">
                No entries yet. The first one goes in <code className="font-mono">content/log/</code> — see{" "}
                <code className="font-mono">lib/log.ts</code>.
              </p>
            ) : (
              <div id="log-list" className="mt-8">
                {[...weeks.entries()].map(([w, list]) => (
                  <div key={w} data-week={w} className="mt-10 first:mt-0">
                    <p className="label flex items-center justify-between border-t border-ink pt-3">
                      <span className="flex items-center gap-2">
                        <span aria-hidden className="blaugrana -mt-[13px] mr-1 h-[3px] w-8 self-start" />
                        <span className="text-accent">MW{String(matchweek(w)).padStart(2, "0")}</span> — Matchweek{" "}
                        {matchweek(w)}
                      </span>
                      <span className="text-muted">Week of {shortDate(w)}</span>
                    </p>
                    {list.map((e) => (
                      <div key={e.slug} data-entry-type={e.type} title={logTypes[e.type].description}>
                        <LogRow entry={e} anchor colors={colors} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
