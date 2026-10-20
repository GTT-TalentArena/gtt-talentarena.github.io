import { hero, site } from "@/lib/content"
import { BallBadge } from "@/components/ball-badge"
import { Pitch } from "@/components/pitch"

const variants = {
  org: { label: "github.com/GTT-TalentArena", line: "Football analytics team · More than a Hack 2027" },
  web: { label: "gtt-talentarena.github.io", line: "Football analytics team · More than a Hack 2027" },
  challenge: { label: "more-than-a-hack-2027", line: "Our fork of the Phase 1 challenge" },
} as const

type V = keyof typeof variants

export const dynamicParams = false

export function generateStaticParams() {
  return (Object.keys(variants) as V[]).map((v) => ({ v }))
}

/** Social preview de repositorio / Open Graph: 1280×640. */
export default async function Social({ params }: { params: Promise<{ v: V }> }) {
  const { v } = await params
  if (v === "challenge") return <Challenge />

  const { label, line } = variants[v]
  return (
    <div className="flex h-[640px] w-[1280px] flex-col bg-paper px-14 pb-10 pt-10 text-ink">
      <div className="label grid grid-cols-3 border-b border-line pb-3 text-muted">
        <span>
          {site.short} ©{site.since} — More than a Hack
        </span>
        <span className="text-center">{site.location} · Talent Arena</span>
        <span className="text-right">{hero.kicker}</span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center">
        <h1 className="font-display-tight text-[calc(17rem*var(--display-scale))] [letter-spacing:max(var(--display-tracking),-0.02em)]">
          GTT
        </h1>
        <p className="font-display-tight mt-1 text-[calc(6.4rem*var(--display-scale))]">
          {hero.motto.lead} <span className="accent">{hero.motto.accent}</span>
        </p>
        <BallBadge still className="absolute right-0 top-6 size-[250px]" />
      </div>

      <div className="flex items-center justify-between border-t border-ink pt-5 text-2xl">
        <span>{line}</span>
        <span className="label flex items-center gap-2 text-base normal-case tracking-normal">
          <span aria-hidden className="blaugrana inline-block size-3 rounded-full" />
          {label}
        </span>
      </div>
    </div>
  )
}

function Challenge() {
  return (
    <div className="stadium grid h-[640px] w-[1280px] grid-cols-[1fr_1.35fr] items-center gap-10 px-14">
      <div>
        <p className="label flex items-center gap-2 border-t border-ink pt-3">
          <span className="text-accent">01</span> — The challenge
        </p>
        <h1 className="font-display-tight mt-6 text-[calc(6.6rem*var(--display-scale))]">
          Who has <span className="accent">the ball?</span>
        </h1>
        <p className="mt-6 text-2xl leading-snug">
          GTT&apos;s fork of <span className="accent">More than a Hack 2027</span> — frame-by-frame possession from tracking
          data.
        </p>
        <p className="label mt-8 flex items-center gap-2 text-muted">
          <span aria-hidden className="blaugrana inline-block size-2.5 rounded-full" />
          github.com/GTT-TalentArena
        </p>
      </div>
      <div className="[&_figcaption]:hidden">
        <Pitch />
      </div>
    </div>
  )
}
