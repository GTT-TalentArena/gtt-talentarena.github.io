import { squad, type Position } from "@/lib/content"
import { Reveal } from "@/components/reveal"
import { SectionHead } from "@/components/section-head"
import { Lineup } from "@/components/lineup"

const lines: { position: Position; label: string }[] = [
  { position: "Forward", label: "Up front" },
  { position: "Defender", label: "At the back" },
  { position: "Goalkeeper", label: "In goal" },
]

export function Squad() {
  return (
    <section id="squad" className="grain px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead index="02" label="The squad" aside={`1-2-2 · ${squad.length} players`} title="The" accent="squad." />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal as="p" className="text-balance text-xl leading-snug sm:text-2xl">
              Five players, one shape: a <span className="accent [--accent-base:1.15em]">1-2-2</span> built to keep the
              ball.
            </Reveal>
            <Formation className="mt-8" />
            <Reveal as="p" delay={160} className="label mt-6 text-muted">
              Hover or tap a player for their role and work
            </Reveal>
          </div>

          <Reveal delay={100} className="lg:col-span-8">
            <Lineup />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** La formación en texto: quién juega en cada línea. */
export function Formation({ className = "" }: { className?: string }) {
  return (
    <dl className={`border-t border-line ${className}`}>
      {lines.map((l) => (
        <div key={l.position} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
          <dt className="label text-muted">{l.label}</dt>
          <dd className="font-display text-xl font-semibold tracking-[-0.02em]">
            {squad
              .filter((p) => p.position === l.position)
              .sort((a, b) => a.spot[0] - b.spot[0])
              .map((p) => p.name)
              .join(" · ")}
          </dd>
        </div>
      ))}
    </dl>
  )
}
