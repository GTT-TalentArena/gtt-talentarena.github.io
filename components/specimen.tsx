import { fixtures, squad } from "@/lib/content"
import type { LogEntry } from "@/lib/log-meta"
import type { typesets } from "@/lib/typesets"
import { Intro, Lockup, MetaRow, NowCard } from "@/components/hero"
import { ButtonGhost, ButtonPrimary } from "@/components/buttons"
import { SectionHead } from "@/components/section-head"
import { Labels, StatsRow } from "@/components/challenge"
import { Card } from "@/components/squad"
import { FixtureRow } from "@/components/fixtures"
import { LogRow } from "@/components/log/log-row"
import { Marquee } from "@/components/marquee"
import { disciplines } from "@/lib/content"

type Typeset = (typeof typesets)[number]

/**
 * Una combinación tipográfica aplicada a componentes reales de la web. `data-type` hace que
 * sus cuatro fuentes valgan solo dentro de esta sección (ver app/globals.css).
 */
export function Specimen({ t, index, entry }: { t: Typeset; index: number; entry?: LogEntry }) {
  const n = String(index).padStart(2, "0")
  const roles = [
    { role: "Display", font: t.fonts.display, className: "font-display-tight text-2xl" },
    { role: "Accent", font: t.fonts.accent, className: "accent [--accent-base:1.4rem]" },
    { role: "Text", font: t.fonts.sans, className: "font-sans text-lg" },
    { role: "Labels & data", font: t.fonts.mono, className: "font-mono text-sm" },
  ]
  return (
    <section id={`type-${t.id}`} data-type={t.id} className={`grain scroll-mt-16 ${index % 2 ? "bg-paper-2" : "bg-paper"}`}>
      {/* ficha de la combinación */}
      <div className="mx-auto max-w-[1440px] px-4 pt-16 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6 border-t-2 border-ink pt-5">
          <div>
            <p className="label text-muted">
              <span className="text-accent">{n}</span> — {index === 0 ? "Reference" : "Candidate"}
            </p>
            <h2 className="font-display-tight mt-3 text-[clamp(3rem,calc(9vw*var(--display-scale)),calc(8rem*var(--display-scale)))]">
              {t.name}
            </h2>
            <p className="accent mt-3 max-w-2xl text-balance leading-snug [--accent-base:1.5rem]">{t.idea}</p>
          </div>
          <a
            href={`/?type=${t.id}`}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-accent hover:text-on-accent"
          >
            Try {t.name} on the whole site
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-0.5">
              →
            </span>
          </a>
        </div>
        <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((r) => (
            <div key={r.role} className="bg-paper p-4">
              <dt className="label text-muted">{r.role}</dt>
              <dd className={`mt-2 truncate ${r.className}`}>{r.font}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* caso de uso real: la portada */}
      <div className="mx-auto max-w-[1440px] px-4 pt-12 sm:px-6 lg:px-10 [--lockup:0.62]">
        <MetaRow />
        <div className="py-8">
          <Lockup as="div" />
        </div>
        <div className="grid gap-8 border-t border-ink pt-6 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-6 lg:col-span-5">
            <Intro />
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonPrimary href="#squad" down>
                Meet the squad
              </ButtonPrimary>
              <ButtonGhost href="#" external>
                Follow on GitHub
              </ButtonGhost>
            </div>
          </div>
          <div className="md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
            <NowCard />
          </div>
        </div>
      </div>

      <Marquee items={disciplines} className="mt-14" />

      {/* el reto en el estadio */}
      <div className="stadium px-4 py-14 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <SectionHead index="01" label="The challenge" aside="Phase 1 · online" title="Who has" accent="the ball?" />
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Labels />
            </div>
            <StatsRow className="mt-8 lg:col-span-8" />
          </div>
        </div>
      </div>

      {/* plantilla, calendario y log */}
      <div className="mx-auto grid max-w-[1440px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-10">
        <div className="sm:max-w-xs lg:col-span-3 lg:max-w-none">
          <Card player={squad[0]} />
        </div>
        <div className="lg:col-span-9">
          <SectionHead index="04" label="Fixtures" aside="2026 — 2027" title="The" accent="fixtures." />
          <div className="mt-6">
            <FixtureRow fixture={fixtures[1]} />
            {entry && <LogRow entry={entry} />}
          </div>
        </div>
      </div>
    </section>
  )
}
