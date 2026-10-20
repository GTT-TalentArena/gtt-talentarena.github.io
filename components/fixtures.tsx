import { fixtures, type Fixture } from "@/lib/content"
import { Reveal } from "@/components/reveal"
import { SectionHead } from "@/components/section-head"
import { FixtureStatus } from "@/components/fixture-status"

const fmt = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`)
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" }),
    month: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
    year: d.getUTCFullYear(),
  }
}

export function Fixtures() {
  return (
    <section id="fixtures" className="grain px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead index="04" label="Fixtures" aside="2026 — 2027" title="The" accent="fixtures." />

        <ol className="mt-12 lg:mt-16">
          {fixtures.map((f, i) => (
            <Reveal as="li" key={f.title} delay={i * 70}>
              <FixtureRow fixture={f} />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function FixtureRow({ fixture: f }: { fixture: Fixture }) {
  const start = fmt(f.start)
  const end = f.end ? fmt(f.end) : null
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-3 border-t border-line py-6 sm:grid-cols-[13rem_1fr_9rem_8rem] sm:py-8">
      <p className="flex items-baseline gap-2">
        <span className="font-display-tight text-[clamp(2.6rem,5vw,4.2rem)] tabular-nums">{start.day}</span>
        <span className="label text-muted">
          {start.month} {start.year}
          {end && (
            <>
              <br />→ {end.day} {end.month} {end.year}
            </>
          )}
        </span>
      </p>
      <div className="col-span-2 sm:col-span-1">
        <h3 className="font-display text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{f.title}</h3>
        <p className="mt-1 text-muted">{f.detail}</p>
      </div>
      <p className="label text-muted">{f.who}</p>
      <p className="text-right">
        <FixtureStatus start={f.start} end={f.end} />
      </p>
    </div>
  )
}
