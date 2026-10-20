import { squad } from "@/lib/content"
import { Card } from "@/components/squad"

/** Las tarjetas de la plantilla para el README (el título lo pone el propio README): 1280×440. */
export default function SquadPreview() {
  return (
    <div className="flex h-[440px] w-[1280px] items-center bg-paper px-12 text-ink">
      <ul className="grid w-full grid-cols-5 gap-3">
        {squad.map((p) => (
          <li key={p.number}>
            <Card player={p} compact />
          </li>
        ))}
      </ul>
    </div>
  )
}
