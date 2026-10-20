/**
 * Genera todas las imágenes del perfil de GitHub de la organización y la de Open Graph:
 *   1. pitch.svg                      → animación del campo (scripts/pitch-svg.ts)
 *   2. capturas PNG de /previews/*    → plantilla, avatar, social previews y Open Graph
 *   3. banner.svg y site.svg          → SVG animados con el balón (scripts/readme-svg.ts)
 * Destinos: ../.github/profile/assets (README), ../.github/brand (subida a mano) y app/.
 *
 * Uso: npm run build && npm run serve   (en otra terminal)
 *      npm run previews -- http://localhost:4173
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"

const base = (process.argv[2] ?? "http://localhost:4173").replace(/\/$/, "")
const root = resolve(import.meta.dirname, "..")
const dotgithub = resolve(root, "../.github")
const cache = join(root, ".cache")

const browsers = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
]
const browser = process.env.BROWSER_BIN ?? browsers.find((b) => existsSync(b))
if (!browser) throw new Error("No encuentro Edge ni Chrome. Define BROWSER_BIN con la ruta del ejecutable.")

const node = (script: string) => {
  const r = spawnSync(process.execPath, [join(root, "scripts", script)], { stdio: "inherit" })
  if (r.status !== 0) throw new Error(`Falló ${script}`)
}

type Shot = { route: string; w: number; h: number; out: string; scale?: number; wait?: number }

const profile = join(dotgithub, "profile/assets")
const brand = join(dotgithub, "brand")

const shots: Shot[] = [
  { route: "/previews/squad/", w: 1280, h: 640, out: join(profile, "squad.png") },
  { route: "/previews/site/", w: 1280, h: 800, out: join(cache, "site-bg.png"), scale: 1.5, wait: 9000 },
  { route: "/previews/avatar/", w: 500, h: 500, out: join(brand, "avatar.png"), scale: 1 },
  { route: "/previews/social/org/", w: 1280, h: 640, out: join(brand, "social-org.png"), scale: 1 },
  { route: "/previews/social/web/", w: 1280, h: 640, out: join(brand, "social-web.png"), scale: 1 },
  { route: "/previews/social/challenge/", w: 1280, h: 640, out: join(brand, "social-challenge.png"), scale: 1, wait: 9000 },
  { route: "/previews/social/web/", w: 1280, h: 640, out: join(root, "app/opengraph-image.png"), scale: 1 },
]

node("pitch-svg.ts")

// perfil temporal: nunca se toca el perfil del navegador de la persona
const userDataDir = mkdtempSync(join(tmpdir(), "gtt-previews-"))
const flags = (w: number, h: number, wait: number) => [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  `--user-data-dir=${userDataDir}`,
  `--window-size=${w},${h}`,
  `--virtual-time-budget=${wait}`,
]

try {
  mkdirSync(cache, { recursive: true })
  for (const s of shots) {
    mkdirSync(dirname(s.out), { recursive: true })
    const r = spawnSync(
      browser,
      [...flags(s.w, s.h, s.wait ?? 5000), `--force-device-scale-factor=${s.scale ?? 2}`, `--screenshot=${s.out}`, `${base}${s.route}`],
      { encoding: "utf8", timeout: 60_000 },
    )
    if (r.status !== 0 || !existsSync(s.out)) {
      console.error(r.stderr)
      throw new Error(`Falló la captura de ${s.route}`)
    }
    const kb = Math.round(statSync(s.out).size / 1024)
    console.log(`✓ ${s.route.padEnd(30)} → ${s.out.replace(resolve(root, ".."), "..")} (${kb} KB)`)
  }

  // dónde queda el balón en la preview de la web (lo apunta app/previews/site/ball-slot.tsx)
  const dom = spawnSync(browser, [...flags(1280, 800, 9000), "--dump-dom", `${base}/previews/site/`], {
    encoding: "utf8",
    timeout: 60_000,
    maxBuffer: 64 * 1024 * 1024,
  })
  const ball = dom.stdout.match(/data-ball="([\d.,]+)"/)?.[1]
  if (!ball) throw new Error("No encuentro la posición del balón en /previews/site/ (data-ball)")
  writeFileSync(join(cache, "site-ball.json"), JSON.stringify(ball.split(",").map(Number)))
  console.log(`✓ posición del balón en la preview de la web: ${ball}`)
} finally {
  rmSync(userDataDir, { recursive: true, force: true })
}

node("readme-svg.ts")
