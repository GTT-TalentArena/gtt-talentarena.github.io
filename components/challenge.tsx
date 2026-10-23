import { challenge, site } from "@/lib/content"
import { Reveal } from "@/components/reveal"
import { SectionHead } from "@/components/section-head"
import { Pitch } from "@/components/pitch"
import { ButtonGhost } from "@/components/buttons"

const swatch: Record<string, string> = {
  H: "bg-home",
  A: "bg-away",
  D: "bg-ink/45",
  X: "border border-dashed border-ink/60",
}

export function Challenge() {
  return (
    <section id="challenge" className="stadium grain px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead index="01" label="The challenge" aside="Phase 1 · online" title="Who has" accent="the ball?" />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal as="p" className="text-balance text-xl leading-snug sm:text-2xl">
              {challenge.intro}
            </Reveal>
            <Reveal as="p" delay={80} className="mt-5 text-pretty leading-relaxed text-muted">
              {challenge.note}
            </Reveal>
            <Reveal delay={140}>
              <Labels />
            </Reveal>
            <Reveal delay={200} className="mt-8">
              <ButtonGhost href={site.repo} external>
                Our fork of the challenge
              </ButtonGhost>
            </Reveal>
          </div>

          <Reveal delay={120} className="lg:col-span-8">
            <Pitch />
          </Reveal>
        </div>

        <StatsRow className="mt-16" />
      </div>
    </section>
  )
}

/** The challenge's four labels (H/A/D/X). */
export function Labels() {
  return (
    <ul className="mt-8 space-y-2 border-t border-line pt-4">
      {challenge.labels.map((l) => (
        <li key={l.id} className="flex items-center gap-3">
          <span className={`grid size-6 place-items-center rounded-md font-mono text-xs text-paper ${swatch[l.id]}`}>
            <span className={l.id === "X" ? "text-ink" : ""}>{l.id}</span>
          </span>
          <span className="text-sm">{l.text}</span>
        </li>
      ))}
    </ul>
  )
}

/** The challenge's numbers, large. */
export function StatsRow({ className = "" }: { className?: string }) {
  return (
    <dl className={`grid grid-cols-2 lg:grid-cols-4 ${className}`}>
      {challenge.stats.map((s, i) => (
        <Reveal
          key={s.label}
          delay={i * 70}
          className={`flex flex-col border-t border-line py-6 pr-4 ${i % 2 ? "border-l pl-4 sm:pl-6" : ""} ${i === 2 ? "lg:border-l lg:pl-6" : ""}`}
        >
          <dt className="label mt-2 text-muted">{s.label}</dt>
          <dd className="order-first font-display-tight text-[clamp(2.4rem,5.5vw,4.6rem)] tabular-nums">{s.value}</dd>
        </Reveal>
      ))}
    </dl>
  )
}
