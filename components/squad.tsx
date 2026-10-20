import { squad, type Player } from "@/lib/content"
import { Reveal } from "@/components/reveal"
import { SectionHead } from "@/components/section-head"
import { Arrow } from "@/components/icons"

export function Squad() {
  return (
    <section id="squad" className="grain px-4 py-24 sm:px-6 sm:py-32 lg:px-10">
      <div className="mx-auto max-w-[1440px]">
        <SectionHead index="02" label="The squad" aside={`${squad.length} players · 1 team`} title="The" accent="squad." />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 xl:grid-cols-5">
          {squad.map((p, i) => (
            <Reveal as="li" key={p.number} delay={i * 70}>
              <Card player={p} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

/** `compact`: sin enlaces y con foto cuadrada, para las imágenes del README. */
export function Card({ player: p, compact = false }: { player: Player; compact?: boolean }) {
  const links = [
    { label: "GitHub", href: p.github && `https://github.com/${p.github}` },
    { label: "Web", href: p.portfolio },
    { label: "LinkedIn", href: p.linkedin },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href))

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-line bg-paper-2/60 p-3 transition-colors hover:bg-paper-2">
      <div className={`relative overflow-hidden rounded-xl bg-ink ${compact ? "aspect-square" : "aspect-[4/5]"}`}>
        {p.github ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://avatars.githubusercontent.com/${p.github}?s=400`}
              alt={`${p.name}'s GitHub avatar`}
              width={400}
              height={500}
              loading="lazy"
              className="size-full object-cover grayscale contrast-125 transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0 group-hover:contrast-100"
            />
            {/* duotono blaugrana que se retira al pasar por encima */}
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-blau),var(--color-grana))] mix-blend-multiply transition-opacity duration-700 group-hover:opacity-0"
            />
          </>
        ) : (
          <span
            aria-hidden
            className="grid size-full place-items-center bg-[repeating-linear-gradient(90deg,var(--color-blau)_0_14%,var(--color-grana)_14%_28%)] opacity-90"
          >
            <span className="accent text-[#f7efe9] [--accent-base:6rem]">{p.name[0].toLowerCase()}</span>
          </span>
        )}
        <span className="font-display-tight pointer-events-none absolute bottom-1 right-3 text-[4.5rem] text-[#f7efe9] [text-shadow:0_2px_18px_rgb(0_0_0/0.35)]">
          {p.number}
        </span>
      </div>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <p className="label text-muted">
          <span className="text-accent">{p.number}</span> — {p.github ? `@${p.github}` : "Signing soon"}
        </p>
        <h3 className="mt-2 font-display text-[2rem] font-semibold leading-none tracking-[-0.03em]">{p.name}</h3>
        <p className="mt-2 min-h-[2.6em] accent leading-tight [--accent-base:1.25rem]">
          {p.role || <span className="text-muted">Pending</span>}
        </p>
        {!compact && links.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="label group/link inline-flex items-center gap-1 text-ink/70 transition-colors hover:text-ink"
                >
                  {l.label}
                  <Arrow className="size-2.5 transition-transform duration-500 group-hover/link:rotate-45" />
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
