import { DataBall } from "@/components/data-ball"

const RING = "More than a Hack 2027 · Talent Arena · Barcelona · 41.35°N 2.13°E · Frame by frame · "

/** The ball inside an instrument ring: mono text and 60 ticks, like a stopwatch. */
export function BallBadge({ className = "", still = false }: { className?: string; still?: boolean }) {
  return (
    <div className={`group pointer-events-auto ${className}`}>
      <svg aria-hidden viewBox="0 0 200 200" className={`absolute inset-0 size-full ${still ? "" : "animate-spin-slow"}`}>
        <defs>
          <path id="ball-ring" d="M100,100 m-87,0 a87,87 0 1,1 174,0 a87,87 0 1,1 -174,0" />
        </defs>
        <text className="fill-ink" style={{ fontFamily: "var(--font-mono)", fontSize: 9.6, letterSpacing: "0.04em" }}>
          <textPath href="#ball-ring" textLength="540" lengthAdjust="spacing">
            {RING.toUpperCase()}
          </textPath>
        </text>
        <g className="stroke-ink" strokeWidth="1">
          {Array.from({ length: 60 }, (_, i) => {
            const a = (i / 60) * Math.PI * 2
            const r1 = i % 5 ? 73 : 69
            const c = Math.cos(a)
            const s = Math.sin(a)
            return (
              <line
                key={i}
                x1={(100 + c * r1).toFixed(2)}
                y1={(100 + s * r1).toFixed(2)}
                x2={(100 + c * 76).toFixed(2)}
                y2={(100 + s * 76).toFixed(2)}
                strokeOpacity={i % 5 ? 0.35 : 0.8}
              />
            )
          })}
        </g>
      </svg>
      <DataBall still={still} className="absolute inset-[21%] size-[58%] text-ink" />
      {!still && (
        <span className="label pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[0.6rem] text-muted opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          Drag or click to kick
        </span>
      )}
    </div>
  )
}
