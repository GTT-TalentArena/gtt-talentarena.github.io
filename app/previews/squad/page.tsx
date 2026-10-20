import { Lineup } from "@/components/lineup"
import { Formation } from "@/components/squad"

/** La plantilla en 1-2-2 para el README (el título lo pone el propio README): 1280×640. */
export default function SquadPreview() {
  return (
    <div className="grid h-[640px] w-[1280px] grid-cols-[1fr_760px] items-center gap-12 bg-paper px-12 text-ink">
      <div>
        <p className="font-display-tight text-[7rem]" style={{ letterSpacing: "-0.01em" }}>
          1-2-2<span className="accent">.</span>
        </p>
        <Formation className="mt-8" />
        <p className="label mt-6 text-muted">Roles still being decided</p>
      </div>
      <Lineup still />
    </div>
  )
}
