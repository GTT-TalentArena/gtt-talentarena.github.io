import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getEntries, getEntry, headline, logTypes, modelColors } from "@/lib/log"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Arrow } from "@/components/icons"
import { Authors, MetricPill, ModelTag, OutcomeChip, TypeChip } from "@/components/log/parts"

type Params = Promise<{ slug: string }>

// Static site (GitHub Pages): only the entries present at build time exist
export const dynamicParams = false

export function generateStaticParams() {
  return getEntries().map((e) => ({ slug: e.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const e = getEntry((await params).slug)
  return e ? { title: e.title, description: e.summary } : {}
}

export default async function EntryPage({ params }: { params: Params }) {
  const { slug } = await params
  const entries = getEntries()
  const i = entries.findIndex((e) => e.slug === slug)
  if (i === -1) notFound()
  const e = entries[i]
  const newer = entries[i - 1]
  const older = entries[i + 1]
  // models measured in this entry, in the colour of their line on the /log chart
  const colors = modelColors(entries)
  const models = [...new Map(headline(e).filter((m) => m.model).map((m) => [`${m.model} ${m.version}`, m])).values()]
  const long = new Date(`${e.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })

  return (
    <>
      <Header />
      <main id="content" className="grain px-4 pb-24 pt-24 sm:px-6 sm:pb-32 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="label grid grid-cols-2 gap-y-2 border-b border-line pb-3 text-muted sm:grid-cols-3">
            <Link href="/log" className="-my-3 inline-block self-start py-3 hover:text-ink">
              ← The log
            </Link>
            <span className="text-right sm:text-center">
              Entry {String(entries.length - i).padStart(2, "0")} of {String(entries.length).padStart(2, "0")}
            </span>
            <span className="hidden text-right sm:block">{long}</span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
            <article className="min-w-0 lg:col-span-8 lg:col-start-5">
              <p className="flex flex-wrap items-center gap-2">
                <TypeChip type={e.type} />
                {e.outcome && <OutcomeChip outcome={e.outcome} />}
              </p>
              <h1 className="font-display-tight mt-6 text-balance text-[clamp(2.6rem,calc(6vw*var(--display-scale)),calc(5.6rem*var(--display-scale)))]">
                {e.title}
              </h1>
              <p className="mt-6 text-pretty text-xl leading-snug sm:text-2xl">{e.summary}</p>

              {headline(e).length > 0 && (
                <div className="mt-8 flex flex-wrap gap-3">
                  {headline(e).map((m) => (
                    <MetricPill key={m.name + m.split + m.model + m.version} m={m} big color={m.model && colors[m.model]} />
                  ))}
                </div>
              )}

              <div className="prose-log mt-10 border-t border-line pt-8" dangerouslySetInnerHTML={{ __html: e.html }} />
            </article>

            <aside className="lg:col-span-3 lg:row-start-1">
              <dl className="space-y-5 border-t border-ink pt-4 lg:sticky lg:top-24">
                <div>
                  <dt className="label text-muted">Type</dt>
                  <dd className="mt-1">
                    {logTypes[e.type].label} <span className="text-muted">— {logTypes[e.type].description}</span>
                  </dd>
                </div>
                <div>
                  <dt className="label text-muted">Date</dt>
                  <dd className="mt-1">{long}</dd>
                </div>
                <div>
                  <dt className="label text-muted">By</dt>
                  <dd className="mt-1.5">
                    <Authors handles={e.authors} />
                  </dd>
                </div>
                <div>
                  <dt className="label text-muted">Reading</dt>
                  <dd className="mt-1">{e.minutes} min</dd>
                </div>
                {models.length > 0 && (
                  <div>
                    <dt className="label text-muted">{models.length === 1 ? "Model" : "Models"}</dt>
                    <dd className="mt-1.5 space-y-1 text-sm">
                      {models.map((m) => (
                        <Link key={`${m.model} ${m.version}`} href="/log#results" className="flex hover:text-accent">
                          <ModelTag model={m.model!} version={m.version} color={colors[m.model!]} />
                        </Link>
                      ))}
                    </dd>
                  </div>
                )}
                {e.tags.length > 0 && (
                  <div>
                    <dt className="label text-muted">Tags</dt>
                    <dd className="mt-1.5 flex flex-wrap gap-1.5">
                      {e.tags.map((t) => (
                        <span key={t} className="rounded-full border border-ink/20 px-2.5 py-0.5 font-mono text-xs">
                          {t}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}
                {e.links.length > 0 && (
                  <div>
                    <dt className="label text-muted">Links</dt>
                    <dd className="mt-1.5 space-y-1">
                      {e.links.map((l) => (
                        <a
                          key={l.href}
                          href={l.href}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center gap-1.5 hover:text-accent"
                        >
                          {l.label}
                          <Arrow className="size-2.5 transition-transform duration-500 group-hover:rotate-45" />
                        </a>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </aside>
          </div>

          <nav aria-label="More entries" className="mt-20 grid gap-4 border-t border-ink pt-6 sm:grid-cols-2">
            {older ? (
              <Link href={`/log/${older.slug}`} className="group rounded-2xl border border-line p-5 transition-colors hover:bg-paper-2">
                <span className="label text-muted">← Older</span>
                <span className="mt-2 block font-display text-xl font-semibold leading-tight tracking-[-0.02em]">{older.title}</span>
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link
                href={`/log/${newer.slug}`}
                className="group rounded-2xl border border-line p-5 text-right transition-colors hover:bg-paper-2"
              >
                <span className="label text-muted">Newer →</span>
                <span className="mt-2 block font-display text-xl font-semibold leading-tight tracking-[-0.02em]">{newer.title}</span>
              </Link>
            )}
          </nav>
        </div>
      </main>
      <Footer />
    </>
  )
}
