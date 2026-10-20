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
import { spawn, spawnSync } from "node:child_process"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
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

// Perfil temporal NUEVO en cada llamada: nunca se toca el perfil del navegador de la persona, y si
// se reutiliza uno, Edge le pasa el trabajo a la instancia anterior (aún viva) y sale sin hacer nada.
const profiles: string[] = []
const flags = (w: number, h: number, wait: number) => {
  const dir = mkdtempSync(join(tmpdir(), "gtt-previews-"))
  profiles.push(dir)
  return [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${dir}`,
    `--window-size=${w},${h}`,
    `--virtual-time-budget=${wait}`,
  ]
}

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
  const ball = await readFromPage(`${base}/previews/site/`, "document.body.dataset.ball")
  if (!ball) throw new Error("No encuentro la posición del balón en /previews/site/ (data-ball)")
  writeFileSync(join(cache, "site-ball.json"), JSON.stringify(ball.split(",").map(Number)))
  console.log(`✓ posición del balón en la preview de la web: ${ball}`)
} finally {
  // en Windows, Edge puede tardar en soltar los ficheros: si no se dejan borrar, se quedan en %TEMP%
  for (const dir of profiles) {
    try {
      rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 })
    } catch {}
  }
}

node("readme-svg.ts")

/**
 * Abre `url` en el navegador headless y devuelve el valor de `expression` en cuanto deja de estar
 * vacío. Usa el protocolo DevTools (WebSocket nativo de Node), no --dump-dom: en Edge 155 ese
 * modo dejó de escribir en la salida estándar.
 */
async function readFromPage(url: string, expression: string, timeoutMs = 30_000): Promise<string | undefined> {
  const dir = mkdtempSync(join(tmpdir(), "gtt-previews-"))
  profiles.push(dir)
  const child = spawn(browser!, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--user-data-dir=${dir}`,
    // igual que en las capturas: sin barras de scroll (si no, el iframe pierde ~15 px de ancho
    // y todo lo alineado a la derecha, como el balón, se mide desplazado respecto a la captura)
    "--hide-scrollbars",
    "--remote-debugging-port=0",
    "--window-size=1280,800",
    "about:blank",
  ])
  const deadline = Date.now() + timeoutMs
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
  try {
    // el navegador apunta su puerto de depuración en DevToolsActivePort dentro del perfil
    const portFile = join(dir, "DevToolsActivePort")
    while (!existsSync(portFile) || !readFileSync(portFile, "utf8").includes("\n")) {
      if (Date.now() > deadline) throw new Error("El navegador no abrió el puerto de depuración")
      await wait(100)
    }
    const [port, path] = readFileSync(portFile, "utf8").trim().split("\n")
    const ws = new WebSocket(`ws://127.0.0.1:${port}${path}`)
    await new Promise((ok, ko) => ((ws.onopen = ok), (ws.onerror = ko)))
    let id = 0
    const pending = new Map<number, (r: { result?: Record<string, unknown> }) => void>()
    ws.onmessage = (e) => {
      const msg = JSON.parse(String(e.data))
      pending.get(msg.id)?.(msg)
      pending.delete(msg.id)
    }
    const send = (method: string, params: object = {}, sessionId?: string) =>
      new Promise<{ result?: Record<string, unknown> }>((ok) => {
        pending.set(++id, ok)
        ws.send(JSON.stringify({ id, method, params, sessionId }))
      })

    const target = await send("Target.createTarget", { url })
    const attached = await send("Target.attachToTarget", { targetId: target.result!.targetId, flatten: true })
    const sessionId = attached.result!.sessionId as string
    let value: string | undefined
    while (!value && Date.now() < deadline) {
      await wait(250)
      const r = await send("Runtime.evaluate", { expression, returnByValue: true }, sessionId)
      const v = (r.result?.result as { value?: unknown } | undefined)?.value
      value = typeof v === "string" && v ? v : undefined
    }
    await send("Browser.close").catch(() => {})
    ws.close()
    return value
  } finally {
    child.kill()
  }
}
