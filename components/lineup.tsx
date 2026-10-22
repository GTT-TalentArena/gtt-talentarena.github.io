"use client"

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type Ref } from "react"
import { squad, type Player } from "@/lib/content"
import { clamp } from "@/lib/pitch-sim"
import { FPS, SquadSim } from "@/lib/squad-sim"
import { Arrow } from "@/components/icons"

// Medio campo en metros (68 × 52,5) con margen para la portería, que sobresale por abajo
const VIEW = { x: -3, y: -3, w: 74, h: 58.5 }
const at = ([x, y]: [number, number]) =>
  ({
    left: `${((x - VIEW.x) / VIEW.w) * 100}%`,
    top: `${((y - VIEW.y) / VIEW.h) * 100}%`,
  }) satisfies CSSProperties

const short: Record<Player["position"], string> = { Goalkeeper: "GK", Defender: "DEF", Forward: "FWD" }

// La ficha flota junto al jugador desde sm; en móvil se acopla abajo. Solo se pinta una de las dos,
// para no cargar dos veces la web del jugador.
const WIDE = "(min-width: 640px)"
function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(WIDE)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(WIDE).matches,
    () => true,
  )
}

/**
 * La plantilla en formación 1-2-2 sobre medio campo, jugando sola un partidillo (lib/squad-sim.ts).
 * Al pasar el ratón, enfocar con el teclado o tocar un jugador se abre su ficha, con su web dentro;
 * ese jugador se queda quieto y los demás siguen. `still`: quietos y sin interacción (imágenes del README).
 */
export function Lineup({ still = false }: { still?: boolean }) {
  const [active, setActive] = useState<string | null>(null)
  const pinned = useRef(false)
  const closing = useRef<ReturnType<typeof setTimeout>>(undefined)
  const root = useRef<HTMLDivElement>(null)
  const tokens = useRef<(HTMLDivElement | null)[]>([])
  const avatar = useRef<HTMLSpanElement>(null)
  const ballEl = useRef<HTMLSpanElement>(null)
  const activeRef = useRef<string | null>(null)
  const card = useRef<HTMLDivElement>(null)
  const [place, setPlace] = useState<CSSProperties>({ visibility: "hidden" })
  const wide = useWide()

  // La ficha, junto al jugador tal como está al abrirla (se queda quieto mientras está abierta):
  // a su lado, hacia el centro del campo, y sin salirse del campo. Si de lado no cabe, encima o debajo.
  useLayoutEffect(() => {
    if (!active || !wide || !card.current) return
    const r = root.current!.getBoundingClientRect()
    const t = tokens.current[squad.findIndex((p) => p.number === active)]!.querySelector("button")!.getBoundingClientRect()
    const w = card.current.offsetWidth
    const h = card.current.offsetHeight
    const gap = 12
    const cx = t.left + t.width / 2 - r.left
    const cy = t.top + t.height / 2 - r.top
    let left = cx < r.width / 2 ? t.right - r.left + gap : t.left - r.left - gap - w
    let top = clamp(cy - h / 2, 0, r.height - h)
    if (left < 0 || left + w > r.width) {
      left = clamp(cx - w / 2, 0, r.width - w)
      top = cy > r.height / 2 ? t.top - r.top - gap - h : t.bottom - r.top + gap
    }
    setPlace({ left, top })
  }, [active, wide])

  useEffect(() => {
    activeRef.current = active
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ((pinned.current = false), setActive(null))
    // en móvil no hay hover: la ficha se queda hasta que se cierra (✕ o tocando otra vez al jugador)
    const onDown = (e: PointerEvent) => {
      if (wide && !root.current?.contains(e.target as Node)) {
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
  }, [active, wide])

  // el partidillo: mueve las fichas y el balón sin pasar por React
  useEffect(() => {
    if (still || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = root.current!
    const ball = ballEl.current!
    const sim = new SquadSim(
      squad.map((p) => p.spot),
      squad.findIndex((p) => p.position === "Goalkeeper"),
    )

    // el balón se controla en el borde de la ficha, que cambia de tamaño con la pantalla
    const measure = () => {
      const a = avatar.current
      if (a && el.clientWidth) sim.reach = (a.offsetWidth / 2 / el.clientWidth) * VIEW.w + 0.6
    }
    const render = () => {
      sim.mates.forEach((m, i) => {
        const t = tokens.current[i]
        if (!t) return
        const p = at([m.x, m.y])
        t.style.left = p.left
        t.style.top = p.top
      })
      const p = at([
        Math.max(VIEW.x + 0.5, Math.min(VIEW.x + VIEW.w - 0.5, sim.ball.x)),
        Math.max(VIEW.y + 0.5, Math.min(VIEW.y + VIEW.h - 0.5, sim.ball.y)),
      ])
      ball.style.left = p.left
      ball.style.top = p.top
      ball.style.opacity = "1"
    }

    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "120px" })
    io.observe(el)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()

    let raf = 0
    let last = performance.now()
    let acc = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      if (!visible || document.hidden) return
      const i = squad.findIndex((p) => p.number === activeRef.current)
      sim.selected = i < 0 ? null : i
      acc += dt
      let stepped = false
      while (acc >= 1 / FPS) {
        sim.step()
        acc -= 1 / FPS
        stepped = true
      }
      if (stepped) render()
    }
    render()
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
    }
  }, [still])

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
      {squad.map((p, i) => {
        const isActive = active === p.number
        return (
          <div
            key={p.number}
            ref={(node) => {
              tokens.current[i] = node
            }}
            className={`absolute -translate-x-1/2 -translate-y-[38%] ${isActive ? "z-20" : "z-10"}`}
            style={at(p.spot)}
            // con el ratón moviéndose de verdad: un jugador que pasa por debajo del ratón quieto no abre su ficha
            onMouseMove={still ? undefined : (e) => (e.movementX || e.movementY) && open(p.number)}
            onMouseLeave={still ? undefined : () => active === p.number && close()}
          >
            <button
              type="button"
              disabled={still}
              aria-expanded={isActive}
              aria-controls={`player-${p.number}`}
              onFocus={() => open(p.number)}
              onBlur={close}
              onClick={() => {
                pinned.current = !(isActive && pinned.current)
                setActive(pinned.current ? p.number : null)
              }}
              className="group flex flex-col items-center outline-none disabled:cursor-default"
            >
              {/* tazo: canto blaugrana por segmentos alrededor de la foto */}
              <span
                ref={i === 0 ? avatar : undefined}
                className={`relative block size-11 rounded-full bg-[repeating-conic-gradient(var(--color-blau)_0_22.5deg,var(--color-grana)_22.5deg_45deg)] p-[3px] ring-2 ring-paper transition-transform duration-500 sm:size-16 sm:p-1 sm:ring-[3px] lg:size-[5.5rem] lg:p-1.5 ${
                  isActive ? "scale-110 shadow-[0_18px_40px_-14px_rgb(11_14_44/0.55)]" : "shadow-[0_10px_24px_-14px_rgb(11_14_44/0.5)]"
                } group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-accent`}
              >
                <span className="block size-full rounded-full ring-[1.5px] ring-paper">
                  <Avatar player={p} />
                </span>
              </span>
              <span className="mt-1 rounded-full bg-paper/85 px-1.5 py-0.5 font-display text-[0.78rem] font-semibold leading-tight tracking-[-0.02em] backdrop-blur sm:mt-2 sm:px-2 sm:text-base">
                {p.name}
              </span>
              <span className="label hidden text-[0.58rem] text-muted sm:block">{short[p.position]}</span>
            </button>

          </div>
        )
      })}

      {active && !still && wide && (
        <Info
          ref={card}
          player={squad.find((p) => p.number === active)!}
          placement="anchored"
          style={place}
          onMouseEnter={() => clearTimeout(closing.current)}
          onMouseLeave={close}
        />
      )}

      {/* el balón: por encima de las fichas y por debajo de la ficha abierta */}
      {!still && (
        <span
          ref={ballEl}
          aria-hidden
          className="pointer-events-none absolute z-[15] size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/70 bg-[radial-gradient(circle,var(--color-ink)_0_26%,#fff_30%)] opacity-0 shadow-[0_2px_5px_rgb(11_14_44/0.4)] sm:size-3.5 lg:size-4"
        />
      )}

      {/* en móvil la ficha no flota junto al jugador (se saldría de la pantalla): se acopla abajo, a todo el ancho */}
      {active && !still && !wide && (
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

function Avatar({ player: p }: { player: Player }) {
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
        className="size-full object-cover"
      />
    </span>
  )
}

// La web del jugador se pinta a 1280 px de ancho y se encoge hasta caber en la ficha
const FRAME = { w: 1280, h: 640 }

/** Vista previa en vivo de la web del jugador, como las tarjetas de un panel: solo para mirar. */
function SitePreview({ href, name, className = "aspect-[2/1]" }: { href: string; name: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const host = new URL(href).hostname.replace(/^www\./, "")

  useEffect(() => {
    const el = box.current!
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / FRAME.w))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      tabIndex={-1}
      aria-hidden
      className={`group/site relative block overflow-hidden border-b border-line bg-paper-2 ${className}`}
    >
      <div ref={box} className="absolute inset-0">
        {scale > 0 && (
          <iframe
            src={href}
            title={`${name}'s website`}
            width={FRAME.w}
            height={FRAME.h}
            tabIndex={-1}
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setLoaded(true)}
            className={`pointer-events-none origin-top-left border-0 bg-paper transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
            style={{ transform: `scale(${scale})` }}
          />
        )}
      </div>
      {!loaded && (
        <span className="label absolute inset-0 grid animate-pulse place-items-center text-[0.62rem] text-muted">{host}</span>
      )}
      <span className="label absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-paper/90 px-2 py-0.5 text-[0.58rem] text-ink/80 shadow-sm backdrop-blur">
        {host}
        <Arrow className="size-2 transition-transform duration-500 group-hover/site:rotate-45" />
      </span>
    </a>
  )
}

function Info({
  ref,
  player: p,
  placement,
  style,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  ref?: Ref<HTMLDivElement>
  player: Player
  placement: "anchored" | "docked"
  style?: CSSProperties
  onClose?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const links = [
    { label: "GitHub", href: p.github && `https://github.com/${p.github}` },
    { label: "Web", href: p.portfolio },
    { label: "LinkedIn", href: p.linkedin },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href))

  // anclada: junto al jugador, donde diga `style`; solo desde sm
  // acoplada: abajo del campo y a todo el ancho; solo en móvil, más baja para caber en el campo
  const docked = placement === "docked"
  const position = docked ? "inset-x-2 bottom-2 z-30" : "z-30 w-72"

  return (
    <div
      ref={ref}
      id={`player-${p.number}`}
      role="dialog"
      aria-label={`${p.name}, ${p.position}`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocus={onMouseEnter}
      onBlur={onMouseLeave}
      className={`absolute ${position} overflow-hidden rounded-2xl border border-line bg-paper text-left shadow-[0_24px_60px_-18px_rgb(11_14_44/0.45)]`}
    >
      {p.portfolio && <SitePreview href={p.portfolio} name={p.name} className={docked ? "aspect-[7/2]" : undefined} />}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full bg-paper/85 text-muted backdrop-blur hover:bg-paper-2 hover:text-ink"
        >
          <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
            <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
      )}
      <div className={docked ? "p-3" : "p-4"}>
        <p className="label text-accent">{p.position}</p>
        <p
          className={`font-display font-semibold leading-none tracking-[-0.03em] ${docked ? "mt-1.5 text-2xl" : "mt-2 text-[1.9rem]"}`}
        >
          {p.name}
        </p>
        <p className="accent mt-1.5 leading-tight [--accent-base:1.25rem]">{p.role || <span className="text-muted">Role pending</span>}</p>
        {!docked && <p className="label mt-3 text-muted">{p.github ? `@${p.github}` : "Signing soon"}</p>}
        {links.length > 0 && (
          <ul className={`flex flex-wrap gap-x-4 gap-y-1 border-t border-line ${docked ? "mt-2.5 pt-2.5" : "mt-3 pt-3"}`}>
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
