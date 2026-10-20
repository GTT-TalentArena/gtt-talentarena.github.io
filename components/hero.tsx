import { hero, now, site } from "@/lib/content"
import { Clock } from "@/components/clock"
import { Countdown } from "@/components/countdown"
import { BallBadge } from "@/components/ball-badge"
import { ButtonGhost, ButtonPrimary } from "@/components/buttons"

export function Hero() {
  return (
    <section id="content" className="grain relative flex min-h-[100svh] flex-col px-4 pb-8 pt-24 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
        <MetaRow />

        {/* name + motto */}
        <div className="relative flex flex-1 flex-col justify-center py-8 sm:py-10">
          <Lockup />
          <BallBadge className="absolute right-0 top-[40%] hidden size-56 -translate-y-1/2 lg:block xl:size-64" />
        </div>

        {/* bottom row */}
        <div className="grid gap-8 border-t border-ink pt-6 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-6 lg:col-span-5">
            <Intro />
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonPrimary href="#squad" down>
                Meet the squad
              </ButtonPrimary>
              <ButtonGhost href={site.github} external>
                Follow on GitHub
              </ButtonGhost>
            </div>
          </div>

          <div className="md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
            <NowCard />
          </div>
        </div>
      </div>
    </section>
  )
}

export function MetaRow() {
  return (
    <div className="label grid grid-cols-2 gap-y-2 border-b border-line pb-3 text-muted sm:grid-cols-3">
      <span>
        {site.short} ©{site.since} — More than a Hack
      </span>
      <span className="text-right sm:text-center">
        {site.location} · <Clock timeZone={site.timezone} />
      </span>
      <span className="hidden text-right sm:block">{hero.kicker}</span>
    </div>
  )
}

/** «GTT» gigante + «Més que dades.». `as="div"` cuando no es el título de la página. */
export function Lockup({ as: Tag = "h1" }: { as?: "h1" | "div" }) {
  return (
    <>
      <Tag className="font-display-tight [letter-spacing:max(var(--display-tracking),-0.02em)] text-[calc(40vw*var(--display-scale)*var(--lockup,1))] sm:text-[clamp(5rem,calc(25vw*var(--display-scale)*var(--lockup,1)),calc(22rem*var(--display-scale)*var(--lockup,1)))]">
        <span className="block overflow-hidden pb-[0.04em]">
          <span className="rise" style={{ ["--d" as string]: "80ms" }}>
            GTT
          </span>
        </span>
      </Tag>
      <p className="font-display-tight mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-2 text-[calc(13vw*var(--display-scale)*var(--lockup,1))] sm:text-[clamp(2.2rem,calc(8.6vw*var(--display-scale)*var(--lockup,1)),calc(8.2rem*var(--display-scale)*var(--lockup,1)))]">
        <span className="block overflow-hidden pb-[0.1em]">
          <span className="rise" style={{ ["--d" as string]: "220ms" }}>
            {hero.motto.lead} <span className="accent">{hero.motto.accent}</span>
          </span>
        </span>
        <span className="label font-sans text-muted normal-case" lang="en">
          ({hero.mottoGloss})
        </span>
      </p>
    </>
  )
}

export function Intro() {
  return (
    <p className="text-balance text-xl leading-snug sm:text-2xl">
      {hero.intro.before} <span className="accent [--accent-base:1.15em]">{hero.intro.accent}</span> {hero.intro.after}
    </p>
  )
}

export function NowCard() {
  return (
    <div className="rounded-2xl border border-line bg-paper-2/70 p-5">
      <p className="label flex items-center gap-2 text-muted">
        <span className="size-2 animate-pulse-dot rounded-full bg-live" />
        {now.status}
      </p>
      <p className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">{now.title}</p>
      <p className="mt-1 text-muted">{now.detail}</p>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-3">
        <div>
          <dt className="label text-muted">{now.target.label}</dt>
          <dd className="mt-1 font-mono text-xl tabular-nums">{now.target.value}</dd>
        </div>
        <div>
          <dt className="label text-muted">Deadline in</dt>
          <dd className="mt-1 font-mono text-xl tabular-nums">
            <Countdown to={now.deadline} />
          </dd>
        </div>
      </dl>
      <p className="label mt-4 flex justify-between border-t border-line pt-3 text-muted">
        <span>{site.location}</span>
        <span>{now.window}</span>
      </p>
    </div>
  )
}
