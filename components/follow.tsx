import { follow, site } from "@/lib/content"
import { Reveal } from "@/components/reveal"
import { Arrow } from "@/components/icons"

export function Follow() {
  return (
    <section id="follow" className="grain on-accent px-4 pb-10 pt-24 sm:px-6 sm:pt-32 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <div className="label flex items-center justify-between border-t border-ink pt-3">
          <span>05 — Follow</span>
          <span>{site.location}</span>
        </div>

        <Reveal
          as="h2"
          className="font-display-tight mt-8 text-[clamp(3.2rem,calc(15vw*var(--display-scale)),calc(15rem*var(--display-scale)))]"
        >
          {follow.title} <span className="accent">{follow.accent}</span>
        </Reveal>

        <div className="mt-10 grid gap-8 md:grid-cols-12 md:items-end">
          <Reveal as="p" className="text-balance text-xl leading-snug sm:text-2xl md:col-span-5">
            {follow.text}
          </Reveal>

          <div className="md:col-span-6 md:col-start-7">
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center justify-between gap-4 border-b-2 border-ink pb-3 font-display text-[clamp(1.5rem,3.4vw,3rem)] font-semibold tracking-[-0.03em]"
            >
              <span className="break-all">github.com/GTT-TalentArena</span>
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink text-paper transition-transform duration-500 group-hover:rotate-45">
                <Arrow className="size-4" />
              </span>
            </a>

            <ul className="mt-5 flex flex-wrap gap-2">
              {follow.links.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 rounded-full border border-ink/30 px-4 py-2 text-sm transition-colors hover:bg-ink hover:text-paper"
                  >
                    {l.label} <Arrow className="size-3 transition-transform duration-500 group-hover:rotate-45" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
