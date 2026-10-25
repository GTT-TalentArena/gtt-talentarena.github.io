/**
 * ════════════════════════════════════════════════════════════════════════════════════════════
 *  GTT LOG · INSTRUCTIONS FOR LLMs (Claude, Codex, Copilot…) AND PEOPLE
 * ════════════════════════════════════════════════════════════════════════════════════════════
 *
 *  ── What it is (and what it is NOT) ────────────────────────────────────────────────────────
 *  The log (/log) records the work on the POSSESSION MODEL: what we study, the improvements we
 *  find and the tests we run on the project's main repository: our fork of the challenge,
 *  https://github.com/GTT-TalentArena/more-than-a-hack-2027
 *
 *  It is NOT a changelog of this website. Changes to the site's design, text, typography or pages
 *  go in this repository's commits, never in the log.
 *
 *  Everything is written in ENGLISH (see CONTRIBUTING.md).
 *
 *  ── Current model focus areas (and recommended tags) ───────────────────────────────────────
 *    H/A/D/X rules ................. rules
 *    possession changes ............ possession-change
 *    temporal continuity ........... temporal-continuity
 *    hysteresis .................... hysteresis
 *    minimum duration .............. min-duration
 *    smoothing ..................... smoothing
 *    state of the art .............. state-of-the-art
 *  Use these tags when they apply so entries on the same topic can be followed.
 *
 *  ── How we work (where entries come from) ──────────────────────────────────────────────────
 *  1. Study: first, in a .md inside the fork's docs/ (main repo). That is the study notebook and
 *     lives SEPARATELY: it isn't copied here; it is summarised and linked.
 *  2. When it's clear and BEFORE coding anything: an entry here for the rest of the team, with
 *     what was found and the proposed improvements, linking that .md in the fork.
 *  3. While coding and testing: experiment / iteration entries with the results (including the
 *     ones that fail), linking the fork's commit or PR.
 *
 *  ── When to add an entry ───────────────────────────────────────────────────────────────────
 *  Whenever something on the model is finished that is worth telling: a study, an improvement
 *  found, a test, a model change, a measured metric, a discarded approach, a decision.
 *  A failed experiment is also an entry (outcome: failure). Model entries are never deleted:
 *  if something turned out to be wrong, add another one that corrects it.
 *
 *  ── Where the file goes and what it's called ───────────────────────────────────────────────
 *  content/log/YYYY-MM-DD-short-slug.md      e.g. content/log/2026-10-24-possession-hysteresis.md
 *  - One file per entry (so two people can add at the same time without conflicts).
 *  - The slug: lowercase, words separated by hyphens, in English. It is the URL: /log/<slug>.
 *  - Copy the template: content/log/_template.md (files starting with _ are not published).
 *  - Images or charts: public/log/<slug>/figure.png  →  in the Markdown: ![alt](/log/<slug>/figure.png)
 *
 *  ── Header (YAML front matter) ─────────────────────────────────────────────────────────────
 *    title:    "Short sentence"                                (required)
 *    date:     2026-10-24                                      (required · day of the work)
 *    type:     study | code | experiment | iteration | data | decision     (required; change is automatic)
 *    outcome:  success | failure | mixed | open                (required for experiment and iteration)
 *    authors:  [jimy-k4, hxst1]                                (required · GitHub handles from lib/content.ts → squad)
 *    summary:  "One or two sentences: what was done and what came out."   (required · shown in the list)
 *    model:    hmm-viterbi                                     (optional · model measured, lowercase with hyphens)
 *    version:  v2                                              (required if there is a model · v1, v2… or a short name)
 *    metrics:                                                  (optional · numbers, not text)
 *      - name: spellF1          # spellF1 | macroF1 | or another clearly named metric
 *        value: 0.3120
 *        before: 0.2433         # optional: reference value to show the improvement
 *        split: public-5min     # optional: where it was measured (public-5min, full-match, dfl-cv…)
 *        better: higher         # optional: higher (default) | lower
 *        low: 0.2810            # optional, with high: bootstrap interval (run_evaluation.py --bootstrap 1000)
 *        high: 0.3390
 *        model: rules           # optional: another model/version for this metric only (to compare variants)
 *        version: v1
 *        date: 2026-10-21       # optional: day this version was measured, if before the entry's date
 *
 *  ── The results chart (at the top of /log) ─────────────────────────────────────────────────
 *  Each metric with a model and version is a point: X axis = date, Y axis = value, one line per
 *  model joining its versions. The metric and split are chosen above the chart; only points from
 *  the same split are compared. Each point links to its entry, and the entry shows its model in
 *  the same colour. The reference lines (published baseline) are in lib/log-meta.ts → references.
 *  ALWAYS use the same model name for its versions (hmm-viterbi v1, v2…): a different name is
 *  another line. Versions of one model measured on the same day are spread out within that day.
 *    tags:     [hysteresis, smoothing]                         (optional · see "Current focus areas")
 *    links:                                                    (optional · always to the fork: docs/, commit, PR, Jupyter)
 *      - label: "Study"
 *        href: https://github.com/GTT-TalentArena/more-than-a-hack-2027/blob/main/docs/<study>.md
 *
 *  What each type means (everything is about the model and the main repo):
 *    study      studying: papers, state of the art, challenge documentation, other approaches
 *    code       coding in the fork: pipeline, data loading, evaluation tools
 *    experiment testing a specific hypothesis, with a result (outcome required)
 *    iteration  a new model version compared with the previous one (outcome required)
 *    data       exploring the tracking: patterns, gaps, identity switches, invisible ball
 *    decision   something the team decides about the model or the repo, and why (ADR-style)
 *    change     AUTOMATIC: one per PR merged into the fork's main. It is generated and pushed by the
 *               fork's .github/workflows/publish-pr-log.yml workflow. Don't write it by hand.
 *
 *  ── Body (Markdown) ────────────────────────────────────────────────────────────────────────
 *  Recommended structure, with ## for each block:
 *    ## Context     why we did it
 *    ## What we did what was done, in enough detail to repeat it (commands, parameters)
 *    ## Result      what came out, with numbers; if it failed, why we think it failed
 *    ## Next        what comes next
 *  GFM Markdown is supported: tables, lists, `code`, ``` blocks, quotes and images.
 *
 *  ── Figures (everything visual that can be) ────────────────────────────────────────────────
 *  Code blocks with these languages are drawn as figures at build time (lib/log-viz.ts, with
 *  the full syntax above each function):
 *    ```timeline  H/A/D/X strips over time, with spellF1 computed like the challenge scorer;
 *                 supports transformations (=viterbi(raw, 2), =hold(raw)…) to show a method
 *    ```pitch     the pitch at one or more moments: players, ball, passes and the label
 *    ```bars      bars with their value          ```stats  big numbers
 *    ```roadmap   numbered steps (P0, P1…)
 *  Full example: content/log/2026-10-21-who-has-the-ball.md. If a block is wrong, the build
 *  fails with a "[log] …" message. What is drawn is invented: never match data.
 *
 *  ── Non-negotiable rules (the challenge's RULES.md) ────────────────────────────────────────
 *  - NEVER paste match data: no tracking, no video, no frame-by-frame labels, nor anything that
 *    would allow them to be reconstructed. Aggregate metrics and conclusions, yes.
 *  - Nothing from the private ground truth. Only results we measured ourselves.
 *  - Be honest: the numbers, exactly as they came out.
 *
 *  ── Check ──────────────────────────────────────────────────────────────────────────────────
 *  `npm run dev` and open /log. If a header is wrong, the build fails with a "[log] …" message
 *  saying which file and which field to fix. When you push to main, the site publishes itself.
 * ════════════════════════════════════════════════════════════════════════════════════════════
 */
import fs from "node:fs"
import path from "node:path"
import { Marked } from "marked"
import { renderViz, VizError } from "@/lib/log-viz"
import { parse as parseYaml } from "yaml"
import { squad } from "@/lib/content"
import { logTypes, outcomes, type LogEntry, type LogType, type Metric, type Outcome } from "@/lib/log-meta"

export * from "@/lib/log-meta"

const DIR = path.join(process.cwd(), "content/log")
const handles = new Set(squad.map((p) => p.github).filter(Boolean))

function fail(file: string, msg: string): never {
  throw new Error(`[log] ${file}: ${msg}. See the instructions at the top of lib/log.ts`)
}

function parse(file: string): LogEntry {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8").replace(/\r\n/g, "\n")
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!m) fail(file, "missing YAML header between --- lines")
  const data = (parseYaml(m[1]) ?? {}) as Record<string, unknown>
  const body = m[2].trim()

  const slug = file.replace(/\.md$/, "").replace(/^\d{4}-\d{2}-\d{2}-/, "")
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) fail(file, "the name must be YYYY-MM-DD-lowercase-slug.md")

  const str = (k: string, required = true) => {
    const v = data[k]
    if (v === undefined || v === null || v === "") return required ? fail(file, `missing "${k}"`) : undefined
    return String(v)
  }

  // YAML turns 2026-10-24 into a Date: normalise it back to text
  const rawDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : str("date")
  if (!rawDate || !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) fail(file, "\"date\" must be YYYY-MM-DD")

  const type = str("type") as LogType
  if (!(type in logTypes)) fail(file, `"type" must be one of: ${Object.keys(logTypes).join(", ")}`)

  const outcome = str("outcome", false) as Outcome | undefined
  if (outcome && !(outcome in outcomes)) fail(file, `"outcome" must be one of: ${Object.keys(outcomes).join(", ")}`)
  if (!outcome && (type === "experiment" || type === "iteration")) fail(file, `"outcome" is required for ${type}`)

  const authors = Array.isArray(data.authors) ? data.authors.map(String) : []
  if (!authors.length) fail(file, "\"authors\" must be a list of GitHub handles")
  const unknown = authors.filter((a) => !handles.has(a))
  if (unknown.length) fail(file, `authors who aren't in the squad (lib/content.ts): ${unknown.join(", ")}`)

  // the entry's model and version: they apply to all its metrics unless one says otherwise
  const entryModel = str("model", false)
  const entryVersion = str("version", false)

  const metrics: Metric[] = (Array.isArray(data.metrics) ? data.metrics : []).map((x: Record<string, unknown>, i: number) => {
    const value = Number(x?.value)
    if (!x?.name || Number.isNaN(value)) fail(file, `metrics[${i}] needs "name" and a numeric "value"`)
    const num = (k: string) => {
      if (x[k] === undefined) return undefined
      const n = Number(x[k])
      return Number.isNaN(n) ? fail(file, `metrics[${i}].${k} must be a number`) : n
    }
    const before = num("before")
    const low = num("low")
    const high = num("high")
    if ((low === undefined) !== (high === undefined)) fail(file, `metrics[${i}] needs "low" and "high" together`)
    if (low !== undefined && high !== undefined && low > high) fail(file, `metrics[${i}]: "low" can't be greater than "high"`)

    const model = x.model ? String(x.model) : entryModel
    const version = x.version ? String(x.version) : entryVersion
    if (model && !/^[a-z0-9]+([-_.][a-z0-9]+)*$/.test(model))
      fail(file, `metrics[${i}]: the model "${model}" must be lowercase with hyphens (e.g. hmm-viterbi)`)
    if (model && !version) fail(file, `metrics[${i}]: "version" is missing for the model "${model}" (e.g. v1)`)
    if (version && !model) fail(file, `metrics[${i}]: there is a "version" but "model" is missing`)

    const date = x.date instanceof Date ? x.date.toISOString().slice(0, 10) : x.date === undefined ? undefined : String(x.date)
    if (date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(date)) fail(file, `metrics[${i}].date must be YYYY-MM-DD`)
    if (date && date > rawDate!) fail(file, `metrics[${i}].date can't be after the entry's date`)

    return {
      name: String(x.name),
      value,
      before,
      split: x.split ? String(x.split) : undefined,
      better: x.better === "lower" ? "lower" : "higher",
      model,
      version,
      date,
      history: Boolean(x.version && entryVersion && version !== entryVersion && model === entryModel),
      low,
      high,
    }
  })

  const links = (Array.isArray(data.links) ? data.links : []).map((l: Record<string, unknown>, i: number) => {
    if (!l?.label || !l?.href) fail(file, `links[${i}] needs "label" and "href"`)
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
    html: toHtml(file, body),
    minutes: Math.max(1, Math.round(words / 200)),
  }
}

// Markdown → HTML; the ```timeline, ```pitch, ```bars, ```stats and ```roadmap blocks are figures (lib/log-viz.ts)
const md = new Marked({
  gfm: true,
  async: false,
  renderer: {
    code({ text, lang }) {
      return renderViz(lang, text) ?? false
    },
  },
})

function toHtml(file: string, body: string) {
  try {
    // wide tables scroll horizontally inside their box instead of widening the page
    return (md.parse(body) as string).replace(/<table>/g, '<div class="prose-table"><table>').replace(/<\/table>/g, "</table></div>")
  } catch (e) {
    if (e instanceof VizError) fail(file, e.message)
    throw e
  }
}

let cache: LogEntry[] | null = null

/** All entries, newest first. */
export function getEntries(): LogEntry[] {
  if (cache && process.env.NODE_ENV === "production") return cache
  const files = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md") && !f.startsWith("_")) : []
  const entries = files.map(parse)
  const seen = new Set<string>()
  for (const e of entries) {
    if (seen.has(e.slug)) throw new Error(`[log] two entries have the slug "${e.slug}": rename one of them`)
    seen.add(e.slug)
  }
  // same date: the larger file name first (files sort by date + slug)
  cache = entries.sort((a, b) => (a.date === b.date ? b.slug.localeCompare(a.slug) : b.date.localeCompare(a.date)))
  return cache
}

export function getEntry(slug: string) {
  return getEntries().find((e) => e.slug === slug)
}
