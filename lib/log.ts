/**
 * ════════════════════════════════════════════════════════════════════════════════════════════
 *  LOG DE GTT · INSTRUCCIONES PARA LLMs (Claude, Codex, Copilot…) Y PERSONAS
 * ════════════════════════════════════════════════════════════════════════════════════════════
 *
 *  ── Qué es (y qué NO es) ───────────────────────────────────────────────────────────────────
 *  El log (/log) registra el trabajo sobre el MODELO DE POSESIÓN: lo que estudiamos, las
 *  mejoras que encontramos y las pruebas que hacemos sobre el repositorio principal del proyecto:
 *  nuestro fork del reto, https://github.com/GTT-TalentArena/more-than-a-hack-2027
 *
 *  NO es un registro de cambios de esta web. Cambios de diseño, textos, tipografía o páginas de la
 *  web van en los commits de este repositorio, nunca en el log.
 *
 *  ── Focos actuales del modelo (y etiquetas recomendadas) ───────────────────────────────────
 *    reglas H/A/D/X ................ rules
 *    cambios de posesión ........... possession-change
 *    continuidad temporal .......... temporal-continuity
 *    histéresis .................... hysteresis
 *    duración mínima ............... min-duration
 *    suavizado ..................... smoothing
 *    estado del arte ............... state-of-the-art
 *  Usa estas etiquetas cuando toque para que las entradas de un mismo tema se puedan seguir.
 *
 *  ── Cómo trabajamos (de dónde salen las entradas) ──────────────────────────────────────────
 *  1. Estudio: primero en ESPAÑOL, en un .md dentro de docs/ del fork (repo principal). Ese es el
 *     cuaderno de estudio y va APARTE: no se copia aquí, se resume y se enlaza.
 *  2. Cuando está claro y ANTES de programar nada: una entrada aquí, en inglés, para el resto del
 *     equipo, con lo encontrado y las mejoras propuestas, enlazando ese .md del fork.
 *  3. Al programar y probar: entradas de experiment / iteration con los resultados (también los
 *     que fallan), enlazando el commit o la PR del fork.
 *
 *  ── Cuándo añadir una entrada ──────────────────────────────────────────────────────────────
 *  Cada vez que se termine algo del modelo que merezca contarse: un estudio, una mejora encontrada,
 *  una prueba, un cambio del modelo, una métrica medida, un enfoque descartado, una decisión.
 *  Un experimento fallido también es una entrada (outcome: failure). No se borran entradas del
 *  modelo: si algo resultó estar mal, se añade otra que lo corrija.
 *
 *  ── Dónde y cómo se llama el fichero ───────────────────────────────────────────────────────
 *  content/log/AAAA-MM-DD-slug-corto.md      p. ej. content/log/2026-10-24-possession-hysteresis.md
 *  - Un fichero por entrada (así dos personas pueden añadir a la vez sin conflictos).
 *  - El slug: minúsculas, palabras separadas por guiones, en inglés. Es la URL: /log/<slug>.
 *  - Copia la plantilla: content/log/_template.md (los ficheros que empiezan por _ no se publican).
 *  - Imágenes o gráficas: public/log/<slug>/figura.png  →  en el Markdown: ![alt](/log/<slug>/figura.png)
 *
 *  ── Cabecera (frontmatter YAML) ────────────────────────────────────────────────────────────
 *    title:    "Frase corta en inglés"                         (obligatorio)
 *    date:     2026-10-24                                      (obligatorio · día del trabajo)
 *    type:     study | code | experiment | iteration | data | decision     (obligatorio)
 *    outcome:  success | failure | mixed | open                (obligatorio en experiment e iteration)
 *    authors:  [jimy-k4, hxst1]                                (obligatorio · handles de GitHub de lib/content.ts → squad)
 *    summary:  "Una o dos frases: qué se hizo y qué salió."     (obligatorio · sale en la lista)
 *    metrics:                                                  (opcional · números, no texto)
 *      - name: spellF1          # spellF1 | macroF1 | u otra métrica con nombre claro
 *        value: 0.3120
 *        before: 0.2433         # opcional: valor de referencia para mostrar la mejora
 *        split: public-5min     # opcional: dónde se midió (public-5min, cv-fold-2…)
 *        better: higher         # opcional: higher (por defecto) | lower
 *    tags:     [hysteresis, smoothing]                         (opcional · ver «Focos actuales»)
 *    links:                                                    (opcional · siempre al fork: docs/, commit, PR, Jupyter)
 *      - label: "Study (ES)"
 *        href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/<estudio>.md
 *
 *  Qué es cada type (todo sobre el modelo y el repo principal):
 *    study      estudiar: papers, estado del arte, documentación del reto, otros enfoques
 *    code       programar en el fork: pipeline, carga de datos, herramientas de evaluación
 *    experiment probar una hipótesis concreta, con resultado (outcome obligatorio)
 *    iteration  nueva versión del modelo comparada con la anterior (outcome obligatorio)
 *    data       explorar el tracking: patrones, huecos, cambios de identidad, balón invisible
 *    decision   algo que el equipo decide sobre el modelo o el repo, y por qué (tipo ADR)
 *
 *  ── Cuerpo (Markdown) ──────────────────────────────────────────────────────────────────────
 *  En inglés (la web está en inglés; el estudio largo en español vive en docs/ del fork).
 *  Estructura recomendada, con ## para cada bloque:
 *    ## Context     por qué lo hicimos
 *    ## What we did lo que se hizo, con detalle suficiente para repetirlo (comandos, parámetros)
 *    ## Result      qué salió, con números; si falló, por qué creemos que falló
 *    ## Next        qué viene después
 *  Se admite Markdown con GFM: tablas, listas, `código`, bloques ```, citas e imágenes.
 *
 *  ── Reglas que no se negocian (RULES.md del reto) ──────────────────────────────────────────
 *  - NUNCA pegues datos del partido: ni tracking, ni vídeo, ni etiquetas frame a frame, ni nada
 *    que permita reconstruirlos. Métricas agregadas y conclusiones, sí.
 *  - Nada del ground truth privado. Solo resultados medidos por nosotros.
 *  - Sé honesto: los números, tal cual salieron.
 *
 *  ── Comprobar ──────────────────────────────────────────────────────────────────────────────
 *  `npm run dev` y abre /log. Si una cabecera está mal, el build falla con un mensaje «[log] …»
 *  que dice qué fichero y qué campo arreglar. Al hacer push a main, la web se publica sola.
 * ════════════════════════════════════════════════════════════════════════════════════════════
 */
import fs from "node:fs"
import path from "node:path"
import { marked } from "marked"
import { parse as parseYaml } from "yaml"
import { squad } from "@/lib/content"
import { logTypes, outcomes, type LogEntry, type LogType, type Metric, type Outcome } from "@/lib/log-meta"

export * from "@/lib/log-meta"

const DIR = path.join(process.cwd(), "content/log")
const handles = new Set(squad.map((p) => p.github).filter(Boolean))

function fail(file: string, msg: string): never {
  throw new Error(`[log] ${file}: ${msg}. Ver las instrucciones al principio de lib/log.ts`)
}

function parse(file: string): LogEntry {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8").replace(/\r\n/g, "\n")
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) fail(file, "falta la cabecera YAML entre líneas ---")
  const data = (parseYaml(m[1]) ?? {}) as Record<string, unknown>
  const body = m[2].trim()

  const slug = file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "")
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(file, "el nombre debe ser AAAA-MM-DD-slug-en-minusculas.md")

  const str = (k: string, required = true) => {
    const v = data[k]
    if (v === undefined || v === null || v === "") return required ? fail(file, `falta «${k}»`) : undefined
    return String(v)
  }

  // YAML convierte 2026-10-24 en Date: lo normalizamos a texto
  const rawDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : str("date")
  if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) fail(file, "«date» debe ser AAAA-MM-DD")

  const type = str("type") as LogType
  if (!(type in logTypes)) fail(file, `«type» debe ser uno de: ${Object.keys(logTypes).join(", ")}`)

  const outcome = str("outcome", false) as Outcome | undefined
  if (outcome && !(outcome in outcomes)) fail(file, `«outcome» debe ser uno de: ${Object.keys(outcomes).join(", ")}`)
  if (!outcome && (type === "experiment" || type === "iteration")) fail(file, `«outcome» es obligatorio en ${type}`)

  const authors = Array.isArray(data.authors) ? data.authors.map(String) : []
  if (!authors.length) fail(file, "«authors» debe ser una lista de handles de GitHub")
  const unknown = authors.filter((a) => !handles.has(a))
  if (unknown.length) fail(file, `autores que no están en el squad (lib/content.ts): ${unknown.join(", ")}`)

  const metrics: Metric[] = (Array.isArray(data.metrics) ? data.metrics : []).map((x: Record<string, unknown>, i: number) => {
    const value = Number(x?.value)
    if (!x?.name || Number.isNaN(value)) fail(file, `metrics[${i}] necesita «name» y un «value» numérico`)
    const before = x.before === undefined ? undefined : Number(x.before)
    if (before !== undefined && Number.isNaN(before)) fail(file, `metrics[${i}].before debe ser un número`)
    return {
      name: String(x.name),
      value,
      before,
      split: x.split ? String(x.split) : undefined,
      better: x.better === "lower" ? "lower" : "higher",
    }
  })

  const links = (Array.isArray(data.links) ? data.links : []).map((l: Record<string, unknown>, i: number) => {
    if (!l?.label || !l?.href) fail(file, `links[${i}] necesita «label» y «href»`)
    return { label: String(l.label), href: String(l.href) }
  })

  const words = body.split(/\s+/).filter(Boolean).length

  return {
    slug,
    title: str("title")!,
    date: rawDate,
    type,
    outcome,
    authors,
    summary: str("summary")!,
    metrics,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    links,
    html: marked.parse(body, { async: false, gfm: true }) as string,
    minutes: Math.max(1, Math.round(words / 200)),
  }
}

let cache: LogEntry[] | null = null

/** Todas las entradas, de la más reciente a la más antigua. */
export function getEntries(): LogEntry[] {
  if (cache && process.env.NODE_ENV === "production") return cache
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_")) : []
  const entries = files.map(parse)
  const seen = new Set<string>()
  for (const e of entries) {
    if (seen.has(e.slug)) throw new Error(`[log] hay dos entradas con el slug «${e.slug}»: cambia el nombre de una`)
    seen.add(e.slug)
  }
  // misma fecha: la de nombre de fichero mayor primero (los ficheros se ordenan por fecha + slug)
  cache = entries.sort((a, b) => (a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)))
  return cache
}

export function getEntry(slug: string) {
  return getEntries().find((e) => e.slug === slug)
}
