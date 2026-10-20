import { approach } from "@/lib/content"
import { Reveal } from "@/components/reveal"
import { SectionHead } from "@/components/section-head"

export function Approach() {
  return (
    <section id="approach" className="grain bg-paper-2 px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead index="03" label="Approach" aside="How we work" title="How we" accent="play." />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Reveal as="p" className="text-balance text-xl leading-snug sm:text-2xl">
              {approach.intro}
            </Reveal>
            <Reveal as="ul" delay={100} className="mt-8 flex flex-wrap gap-2">
              {approach.pillars.map((p) => (
                <li key={p} className="rounded-full border border-ink/20 px-3.5 py-1.5 text-sm">
                  {p}
                </li>
              ))}
            </Reveal>
          </div>

          <ol className="lg:col-span-7 lg:col-start-6">
            {approach.principles.map((p, i) => (
              <Reveal
                as="li"
                key={p.title}
                delay={i * 80}
                className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-line py-6 sm:grid-cols-[4.5rem_1fr] sm:py-8"
              >
                <span className="label pt-2 text-accent sm:pt-3">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display-tight text-[clamp(2rem,4.2vw,3.6rem)]">
                    {p.title} <span className="accent">{p.accent}</span>
                  </h3>
                  <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
