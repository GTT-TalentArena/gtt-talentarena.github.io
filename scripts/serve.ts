/**
 * Serves ./out (the built site) locally, as GitHub Pages will.
 * Usage: npm run build && npm run serve   →   http://localhost:4173
 */
import { createReadStream, existsSync, statSync } from "node:fs"
import { createServer } from "node:http"
import { extname, join, normalize, resolve } from "node:path"

const root = resolve(import.meta.dirname, "../out")
const port = Number(process.env.PORT ?? 4173)
const types: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".ico": "image/x-icon",
}

createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? "/").split("?")[0])
  let file = normalize(join(root, url))
  if (!file.startsWith(root)) return res.writeHead(403).end()
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html")
  if (!existsSync(file)) file = join(root, "404.html")
  res.writeHead(file.endsWith("404.html") && !url.endsWith("404.html") ? 404 : 200, {
    "content-type": types[extname(file)] ?? "application/octet-stream",
  })
  createReadStream(file).pipe(res)
}).listen(port, () => console.log(`out/ en http://localhost:${port}`))
