import type { Metadata } from "next"
import { getEntries } from "@/lib/log"
import { typesets } from "@/lib/typesets"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Specimen } from "@/components/specimen"

export const metadata: Metadata = {
  title: "Typefaces",
  description: "Ten typeface candidates for GTT, each set on real components of the site.",
  robots: { index: false, follow: false },
}

/**
 * Laboratorio tipográfico: las diez candidatas (y la actual como referencia) sobre componentes
 * reales. Cuando el equipo elija, esta vista se puede borrar junto con las fuentes que sobren.
 */
export default function TypePage() {
  const entry = getEntries()[0]
  return (
    <>
      <Header />
      <main id="content">
        <section className="grain px-4 pb-16 pt-24 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-[1440px]">
            <div className="label grid grid-cols-2 gap-y-2 border-b border-line pb-3 text-muted sm:grid-cols-3">
              <span>GTT ©2026 — Type lab</span>
              <span className="text-right sm:text-center">10 candidates + the current set</span>
              <span className="hidden text-right sm:block">One typeface, every view</span>
            </div>
            <h1 className="font-display-tight mt-10 text-[clamp(3.6rem,calc(14vw*var(--display-scale)),calc(13rem*var(--display-scale)))]">
              Pick a <span className="accent">typeface.</span>
            </h1>
            <div className="mt-8 grid gap-8 border-t border-ink pt-6 md:grid-cols-12 md:gap-6">
              <p className="text-balance text-xl leading-snug sm:text-2xl md:col-span-6">
                Ten new combinations — display, accent, text and labels — each set on{" "}
                <span className="accent [--accent-base:1.15em]">the real components</span> of the site. The one we pick
                becomes the only typeface on the website, the log and the GitHub images.
              </p>
              <p className="text-pretty leading-relaxed text-muted md:col-span-5 md:col-start-8">
                Use <strong className="font-semibold text-ink">“Try it on the whole site”</strong> or the switcher at the
                bottom right to browse every page in one of them. Decided? Note the number.
              </p>
            </div>

            <nav aria-label="Candidates" className="mt-12">
              <ol className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {typesets.map((t, i) => (
                  <li key={t.id} className="bg-paper">
                    <a href={`#type-${t.id}`} className="group flex h-full items-baseline gap-3 p-4 transition-colors hover:bg-paper-2">
                      <span className="label text-accent">{String(i).padStart(2, "0")}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-3xl leading-tight" style={{ fontFamily: t.display }}>
                          {t.name}
                        </span>
                        <span className="mt-1 block truncate text-xs text-muted">
                          {t.fonts.display} · {t.fonts.accent}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
                <li className="flex items-center bg-paper-2 p-4 text-sm leading-snug text-muted">
                  Decided? Note the number — it becomes the only typeface everywhere.
                </li>
              </ol>
            </nav>
          </div>
        </section>

        {typesets.map((t, i) => (
          <Specimen key={t.id} t={t} index={i} entry={entry} />
        ))}
      </main>
      <Footer />
    </>
  )
}
