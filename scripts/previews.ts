/**
 * Captura las rutas /previews/* con Edge (o Chrome) headless y guarda los PNG:
 *   - ../.github/profile/assets/  → imágenes del README de la organización
 *   - ../.github/brand/           → avatar y social previews (se suben a mano en GitHub)
 *   - app/opengraph-image.png     → imagen al compartir la web
 *
 * Uso: npm run build && npm run serve   (en otra terminal)
 *      npm run previews -- http://localhost:4173
 */
import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"

const base = (process.argv[2] ?? "http://localhost:4173").replace(/\/$/, "")
const root = resolve(import.meta.dirname, "..")
const dotgithub = resolve(root, "../.github")

const browsers = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
]
const browser = process.env.BROWSER_BIN ?? browsers.find((b) => existsSync(b))
if (!browser) throw new Error("No encuentro Edge ni Chrome. Define BROWSER_BIN con la ruta del ejecutable.")

type Shot = { route: string; w: number; h: number; out: string; scale?: number; wait?: number }

const profile = join(dotgithub, "profile/assets")
const brand = join(dotgithub, "brand")

const shots: Shot[] = [
  { route: "/previews/banner/", w: 1280, h: 400, out: join(profile, "banner.png") },
  { route: "/previews/squad/", w: 1280, h: 440, out: join(profile, "squad.png") },
  { route: "/previews/site/", w: 1280, h: 800, out: join(profile, "site.png"), wait: 9000 },
  { route: "/previews/avatar/", w: 500, h: 500, out: join(brand, "avatar.png"), scale: 1 },
  { route: "/previews/social/org/", w: 1280, h: 640, out: join(brand, "social-org.png"), scale: 1 },
  { route: "/previews/social/web/", w: 1280, h: 640, out: join(brand, "social-web.png"), scale: 1 },
  { route: "/previews/social/challenge/", w: 1280, h: 640, out: join(brand, "social-challenge.png"), scale: 1, wait: 9000 },
  { route: "/previews/social/web/", w: 1280, h: 640, out: join(root, "app/opengraph-image.png"), scale: 1 },
]

// perfil temporal: nunca se toca el perfil del navegador de la persona
const userDataDir = mkdtempSync(join(tmpdir(), "gtt-previews-"))

try {
  for (const s of shots) {
    mkdirSync(dirname(s.out), { recursive: true })
    const r = spawnSync(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--no-first-run",
        "--no-default-browser-check",
        `--user-data-dir=${userDataDir}`,
        `--force-device-scale-factor=${s.scale ?? 2}`,
        `--window-size=${s.w},${s.h}`,
        `--virtual-time-budget=${s.wait ?? 5000}`,
        `--screenshot=${s.out}`,
        `${base}${s.route}`,
      ],
      { encoding: "utf8", timeout: 60_000 },
    )
    if (r.status !== 0 || !existsSync(s.out)) {
      console.error(r.stderr)
      throw new Error(`Falló la captura de ${s.route}`)
    }
    const kb = Math.round(statSync(s.out).size / 1024)
    console.log(`✓ ${s.route.padEnd(30)} → ${s.out.replace(resolve(root, ".."), "..")} (${kb} KB)`)
  }
} finally {
  rmSync(userDataDir, { recursive: true, force: true })
}
