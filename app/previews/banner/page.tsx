import { hero, now, site } from "@/lib/content"
import { BallBadge } from "@/components/ball-badge"

/** Cabecera del README de la organización: 1280×400. */
export default function Banner() {
  return (
    <div className="flex h-[400px] w-[1280px] flex-col bg-paper px-12 pb-7 pt-8 text-ink">
      <div className="label grid grid-cols-3 border-b border-line pb-3 text-muted">
        <span>
          {site.short} ©{site.since} — More than a Hack
        </span>
        <span className="text-center">{site.location} · Talent Arena</span>
        <span className="text-right">{hero.kicker}</span>
      </div>

      <div className="relative flex flex-1 items-end gap-10 pb-5">
        <h1 className="font-display-tight text-[calc(13.5rem*var(--display-scale))] [letter-spacing:max(var(--display-tracking),-0.02em)]">
          GTT
        </h1>
        <div className="pb-3">
          <p className="font-display-tight text-[calc(5.4rem*var(--display-scale))]">
            {hero.motto.lead} <span className="accent">{hero.motto.accent}</span>
          </p>
          <p className="label mt-3 text-muted">({hero.mottoGloss})</p>
        </div>
        <BallBadge still className="absolute right-0 top-1 size-[190px]" />
      </div>

      <div className="flex items-center justify-between border-t border-ink pt-4">
        <p className="text-xl">
          {hero.intro.before} <span className="accent [--accent-base:1.15em]">{hero.intro.accent}</span>
        </p>
        <p className="label flex items-center gap-2 text-muted">
          <span className="size-2 rounded-full bg-live" />
          {now.status} · {now.title}
        </p>
      </div>
    </div>
  )
}
