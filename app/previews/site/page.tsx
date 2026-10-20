import { site } from "@/lib/content"
import { BallSlot } from "./ball-slot"

const SCALE = 1180 / 1440

/**
 * La web dentro de una ventana de navegador, para el README: 1280×800.
 * La portada se carga sin balón (?noball): scripts/readme-svg.ts lo dibuja encima, animado,
 * en la posición que BallSlot deja apuntada en <body data-ball="x,y,ancho,alto">.
 */
export default function SitePreview() {
  return (
    <div className="grid h-[800px] w-[1280px] place-items-center bg-paper-2">
      <div className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_40px_80px_-30px_rgb(0_0_0/0.35)]">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="flex gap-1.5">
            <span className="size-3 rounded-full bg-ink/15" />
            <span className="size-3 rounded-full bg-ink/15" />
            <span className="size-3 rounded-full bg-ink/15" />
          </span>
          <span className="label mx-auto rounded-full border border-line px-4 py-1 normal-case tracking-normal text-muted">
            {site.url.replace("https://", "")}
          </span>
          <span className="w-12" />
        </div>
        <div style={{ width: 1440 * SCALE, height: 860 * SCALE }} className="overflow-hidden">
          <iframe
            id="site-frame"
            src="/?still&noball"
            title="GTT website"
            width={1440}
            height={860}
            style={{ transform: `scale(${SCALE})`, transformOrigin: "0 0", border: 0 }}
          />
        </div>
      </div>
      <BallSlot frame="site-frame" scale={SCALE} />
    </div>
  )
}
