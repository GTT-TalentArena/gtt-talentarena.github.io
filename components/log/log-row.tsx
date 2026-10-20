import Link from "next/link"
import type { LogEntry } from "@/lib/log-meta"
import { Arrow } from "@/components/icons"
import { Authors, MetricPill, OutcomeChip, TypeChip } from "@/components/log/parts"

/** Una entrada del log en la lista: fecha, chips, título, resumen y métricas. */
export function LogRow({ entry: e, anchor = false }: { entry: LogEntry; anchor?: boolean }) {
  const d = new Date(`${e.date}T12:00:00Z`)
  return (
    <Link
      href={`/log/${e.slug}`}
      id={anchor ? e.slug : undefined}
      className="group grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 border-t border-line py-6 transition-colors sm:grid-cols-[7.5rem_1fr_auto] sm:py-8"
    >
      <p className="flex items-baseline gap-2 sm:block">
        <span className="font-display-tight text-[clamp(2.6rem,5vw,3.8rem)] tabular-nums">
          {d.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" })}
        </span>
        <span className="label text-muted sm:mt-1 sm:block">
          {d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })} {d.getUTCFullYear()}
        </span>
      </p>
      <span className="col-span-2 row-start-2 min-w-0 sm:col-span-1 sm:col-start-2 sm:row-start-1">
        <span className="flex flex-wrap items-center gap-2">
          <TypeChip type={e.type} />
          {e.outcome && <OutcomeChip outcome={e.outcome} />}
          <span className="label text-muted">· {e.minutes} min</span>
        </span>
        <span className="mt-3 block font-display text-2xl font-semibold leading-tight tracking-[-0.02em] decoration-accent decoration-2 underline-offset-4 group-hover:underline sm:text-3xl">
          {e.title}
        </span>
        <span className="mt-2 block max-w-3xl text-pretty leading-relaxed text-muted">{e.summary}</span>
        {e.metrics.length > 0 && (
          <span className="mt-4 flex flex-wrap gap-2">
            {e.metrics.map((m) => (
              <MetricPill key={m.name + m.split} m={m} />
            ))}
          </span>
        )}
        <span className="mt-4 block">
          <Authors handles={e.authors} />
        </span>
      </span>
      <span className="grid size-10 place-items-center self-start rounded-full border border-line transition-colors group-hover:bg-ink group-hover:text-paper">
        <Arrow className="size-3 transition-transform duration-500 group-hover:rotate-45" />
      </span>
    </Link>
  )
}
