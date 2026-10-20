"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { squad, type Player } from "@/lib/content"
import { Arrow } from "@/components/icons"

// Medio campo en metros (68 × 52,5) con margen para la portería, que sobresale por abajo
const VIEW = { x: -3, y: -3, w: 74, h: 58.5 }
const at = ([x, y]: [number, number]): CSSProperties => ({
  left: `${((x - VIEW.x) / VIEW.w) * 100}%`,
  top: `${((y - VIEW.y) / VIEW.h) * 100}%`,
})

const short: Record<Player["position"], string> = { Goalkeeper: "GK", Defender: "DEF", Forward: "FWD" }

/**
 * La plantilla en formación 1-2-2 sobre medio campo. Al pasar el ratón, enfocar con el teclado
 * o tocar un jugador se abre su ficha. `still`: sin interacción (para las imágenes del README).
 */
export function Lineup({ still = false }: { still?: boolean }) {
  const [active, setActive] = useState<string | null>(null)
  const pinned = useRef(false)
  const closing = useRef<ReturnType<typeof setTimeout>>(undefined)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ((pinned.current = false), setActive(null))
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        pinned.current = false
        setActive(null)
      }
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown)
    }
  }, [active])

  const open = (n: string) => {
    clearTimeout(closing.current)
    setActive(n)
  }
  // pequeño margen para poder pasar el ratón del jugador a su ficha sin que se cierre
  const close = () => {
    if (pinned.current) return
    clearTimeout(closing.current)
    closing.current = setTimeout(() => setActive(null), 140)
  }

  return (
    <div ref={root} className="relative w-full select-none" style={{ aspectRatio: `${VIEW.w} / ${VIEW.h}` }}>
      <HalfPitch />
      {squad.map((p) => {
        const isActive = active === p.number
        const [x, y] = p.spot
        return (
          <div
            key={p.number}
            className={`absolute -translate-x-1/2 -translate-y-[38%] ${isActive ? "z-20" : "z-10"}`}
            style={at(p.spot)}
            onMouseEnter={still ? undefined : () => open(p.number)}
            onMouseLeave={still ? undefined : close}
          >
            <button
              type="button"
              disabled={still}
              aria-expanded={isActive}
              aria-controls={`player-${p.number} player-${p.number}-m`}
              onFocus={() => open(p.number)}
              onBlur={close}
              onClick={() => {
                pinned.current = !(isActive && pinned.current)
                setActive(pinned.current ? p.number : null)
              }}
              className="group flex flex-col items-center outline-none disabled:cursor-default"
            >
              <span
                className={`relative block size-11 rounded-full ring-2 ring-paper transition-transform duration-500 sm:size-16 sm:ring-[3px] lg:size-[5.5rem] ${
                  isActive ? "scale-110 shadow-[0_18px_40px_-14px_rgb(11_14_44/0.55)]" : "shadow-[0_10px_24px_-14px_rgb(11_14_44/0.5)]"
                } group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-accent`}
              >
                <Avatar player={p} color={isActive} />
              </span>
              <span className="mt-1 rounded-full bg-paper/85 px-1.5 py-0.5 font-display text-[0.78rem] font-semibold leading-tight tracking-[-0.02em] backdrop-blur sm:mt-2 sm:px-2 sm:text-base">
                {p.name}
              </span>
              <span className="label hidden text-[0.58rem] text-muted sm:block">{short[p.position]}</span>
            </button>

            {isActive && !still && (
              <Info player={p} placement="anchored" above={y > 20} align={x < 30 ? "left" : x > 38 ? "right" : "center"} />
            )}
          </div>
        )
      })}

      {/* en móvil la ficha no flota junto al jugador (se saldría de la pantalla): se acopla abajo, a todo el ancho */}
      {active && !still && (
        <Info
          player={squad.find((p) => p.number === active)!}
          placement="docked"
          onClose={() => {
            pinned.current = false
            setActive(null)
          }}
        />
      )}
    </div>
  )
}

function Avatar({ player: p, color }: { player: Player; color: boolean }) {
  if (!p.github)
    return (
      <span
        aria-hidden
        className="grid size-full place-items-center overflow-hidden rounded-full bg-[repeating-linear-gradient(90deg,var(--color-blau)_0_20%,var(--color-grana)_20%_40%)]"
      >
        <span className="accent text-[#f7efe9] [--accent-base:2.2rem]">{p.name[0].toLowerCase()}</span>
      </span>
    )
  return (
    <span className="relative block size-full overflow-hidden rounded-full bg-ink">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://avatars.githubusercontent.com/${p.github}?s=200`}
        alt=""
        width={200}
        height={200}
        loading="lazy"
        className={`size-full object-cover transition-[filter] duration-500 ${color ? "grayscale-0" : "grayscale contrast-125"}`}
      />
      {/* duotono blaugrana que se retira al abrir la ficha */}
      <span
        aria-hidden
        className={`absolute inset-0 bg-[linear-gradient(160deg,var(--color-blau),var(--color-grana))] mix-blend-multiply transition-opacity duration-500 ${color ? "opacity-0" : "opacity-100"}`}
      />
    </span>
  )
}

function Info({
  player: p,
  placement,
  above = true,
  align = "center",
  onClose,
}: {
  player: Player
  placement: "anchored" | "docked"
  above?: boolean
  align?: "left" | "right" | "center"
  onClose?: () => void
}) {
  const links = [
    { label: "GitHub", href: p.github && `https://github.com/${p.github}` },
    { label: "Web", href: p.portfolio },
    { label: "LinkedIn", href: p.linkedin },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href))

  // anclada: junto al jugador (foto + nombre), encima o debajo sin taparle; solo desde sm
  // acoplada: abajo del campo y a todo el ancho; solo en móvil
  const x = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"
  const y = above ? "bottom-[calc(100%+0.5rem)]" : "top-[calc(100%+0.5rem)]"
  const position =
    placement === "anchored" ? `hidden sm:block ${x} ${y} w-64` : "inset-x-2 bottom-2 z-30 sm:hidden"

  return (
    <div
      id={placement === "anchored" ? `player-${p.number}` : `player-${p.number}-m`}
      role="dialog"
      aria-label={`${p.name}, ${p.position}`}
      className={`absolute ${position} rounded-2xl border border-line bg-paper p-4 text-left shadow-[0_24px_60px_-18px_rgb(11_14_44/0.45)]`}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 grid size-9 place-items-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
        >
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <p className="label text-accent">{p.position}</p>
      <p className="mt-2 font-display text-[1.9rem] font-semibold leading-none tracking-[-0.03em]">{p.name}</p>
      <p className="accent mt-1.5 leading-tight [--accent-base:1.25rem]">{p.role || <span className="text-muted">Role pending</span>}</p>
      <p className="label mt-3 text-muted">{p.github ? `@${p.github}` : "Signing soon"}</p>
      {links.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-line pt-3">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target="_blank"
                rel="noreferrer"
                className="label group/link inline-flex items-center gap-1 text-ink/70 transition-colors hover:text-ink"
              >
                {l.label}
                <Arrow className="size-2.5 transition-transform duration-500 group-hover/link:rotate-45" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Medio campo visto desde arriba: el medio campo arriba, nuestra portería abajo. */
function HalfPitch() {
  const arc = Math.sqrt(9.15 ** 2 - 5.5 ** 2)
  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className="absolute inset-0 size-full overflow-visible rounded-2xl"
      aria-hidden
    >
      <rect x={VIEW.x} y={VIEW.y} width={VIEW.w} height={VIEW.h} rx="2" className="fill-paper-2" />
      {/* franjas de césped */}
      {Array.from({ length: 7 }, (_, i) =>
        i % 2 ? null : <rect key={i} x="0" y={i * 7.5} width="68" height="7.5" className="fill-ink" opacity="0.035" />,
      )}
      <g fill="none" className="stroke-ink" strokeOpacity="0.32" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
        <rect x="0" y="0" width="68" height="52.5" vectorEffect="non-scaling-stroke" />
        <path d="M24.85 0A9.15 9.15 0 0 0 43.15 0" vectorEffect="non-scaling-stroke" />
        <rect x="13.84" y="36" width="40.32" height="16.5" vectorEffect="non-scaling-stroke" />
        <rect x="24.84" y="47" width="18.32" height="5.5" vectorEffect="non-scaling-stroke" />
        <path d={`M${34 - arc} 36A9.15 9.15 0 0 1 ${34 + arc} 36`} vectorEffect="non-scaling-stroke" />
        <rect x="30.34" y="52.5" width="7.32" height="2" vectorEffect="non-scaling-stroke" />
        <path d="M0 51.5A1 1 0 0 1 1 52.5M67 52.5A1 1 0 0 1 68 51.5" vectorEffect="non-scaling-stroke" />
      </g>
      <g className="fill-ink" fillOpacity="0.32">
        <circle cx="34" cy="0" r="0.35" />
        <circle cx="34" cy="41.5" r="0.35" />
      </g>
      <text x="1.2" y="3" className="fill-muted" style={{ font: "500 1.5px var(--font-mono)", letterSpacing: "0.08em" }}>
        1-2-2
      </text>
    </svg>
  )
}
