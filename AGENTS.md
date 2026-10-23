# AGENTS.md — GTT website (gtt-talentarena.github.io)

> 🇪🇸 This file was originally written in Spanish. The Spanish original is kept at the bottom.

Next.js 16 + Tailwind CSS 4, exported as a static site and published with GitHub Pages on every push to `main`
(`.github/workflows/deploy.yml`).

## Language: English only

Everything in this repository is written in **English**: code comments, commit messages, pull requests, reviews,
issues, docs and log entries. Older Spanish texts keep their original wording and carry an English translation
(see [`docs/commit-translations.md`](docs/commit-translations.md) for commits). Details in
[`CONTRIBUTING.md`](CONTRIBUTING.md).

## If you're asked to add something to the log

The log (`/log`) records the work on the **possession model**: what we study, the improvements we find and the tests
we run in the project's main repo, the fork
[`GTT-TalentArena/more-than-a-hack-2027`](https://github.com/GTT-TalentArena/more-than-a-hack-2027).
It is **not** a changelog of this website. **First read the comment at the top of
[`lib/log.ts`](lib/log.ts)**: it explains the format, the current focus areas and the workflow (study in the fork's
`docs/` → entry here before coding → experiments with their results). The study is the notebook and lives separately,
in the fork's `docs/`: the log only summarises what comes out of it.

In short:

1. Copy [`content/log/_template.md`](content/log/_template.md) to `content/log/YYYY-MM-DD-english-slug.md`.
2. Fill in the YAML header (`title`, `date`, `type`, `outcome`, `authors`, `summary`, `model`, `version`, `metrics`, `tags`, `links`).
   Each metric with `model` and `version` is a point on the `/log` results chart.
3. Write the body: `## Context`, `## What we did`, `## Result`, `## Next`.
4. Never paste match data or anything that would allow it to be reconstructed (the challenge's RULES.md).
5. `npm run build`: if the header is wrong, it fails with a `[log] …` message saying what to fix.

## Other pieces

- Texts: [`lib/content.ts`](lib/content.ts). Squad: `squad` (empty role = "Pending"; `position` and `spot` for the 1-2-2).
- Navigation: the bar only switches view (Team, Log); the home page sections use `components/section-index.tsx`.
- Typography: a single one across the whole site, in [`lib/fonts.ts`](lib/fonts.ts).
- Pitch simulation: [`lib/pitch-sim.ts`](lib/pitch-sim.ts) (invented; it uses no match data).
- Ball: [`lib/ball.ts`](lib/ball.ts) + [`components/data-ball.tsx`](components/data-ball.tsx).
- Organisation README images: `npm run previews` (see README.md).

## Check before pushing

```bash
npm run typecheck
npm run build
```

---

<details>
<summary>🇪🇸 Original (Spanish) — superseded by the English text above; kept for reference only</summary>

# AGENTS.md — web de GTT (gtt-talentarena.github.io)

Next.js 16 + Tailwind CSS 4, exportada como web estática y publicada con GitHub Pages en cada push a `main`
(`.github/workflows/deploy.yml`). Comentarios del código en español; textos de la web en inglés.

## Si te piden añadir algo al log

El log (`/log`) registra el trabajo sobre el **modelo de posesión**: lo que estudiamos, las mejoras que encontramos y las
pruebas que hacemos en el repo principal del proyecto, el fork
[`GTT-TalentArena/more-than-a-hack-2027`](https://github.com/GTT-TalentArena/more-than-a-hack-2027).
**No** es un registro de cambios de esta web. **Lee primero el comentario al principio de
[`lib/log.ts`](lib/log.ts)**: explica el formato, los focos actuales y el flujo (estudio en español en `docs/` del
fork → entrada aquí en inglés antes de programar → experimentos con sus resultados). El estudio en español es el
cuaderno, y va aparte, en `docs/` del fork: el log solo resume lo que sale de él.

En resumen:

1. Copia [`content/log/_template.md`](content/log/_template.md) a `content/log/AAAA-MM-DD-slug-en-ingles.md`.
2. Rellena la cabecera YAML (`title`, `date`, `type`, `outcome`, `authors`, `summary`, `model`, `version`, `metrics`, `tags`, `links`).
   Cada métrica con `model` y `version` es un punto de la gráfica de resultados de `/log`.
3. Escribe el cuerpo en inglés: `## Context`, `## What we did`, `## Result`, `## Next`.
4. Nunca pegues datos del partido ni nada que permita reconstruirlos (RULES.md del reto).
5. `npm run build`: si la cabecera está mal, falla con un mensaje `[log] …` que dice qué arreglar.

## Otras piezas

- Textos: [`lib/content.ts`](lib/content.ts). Plantilla: `squad` (rol vacío = «Pending»; `position` y `spot` para el 1-2-2).
- Navegación: la barra solo cambia de vista (Team, Log); las secciones de la portada usan `components/section-index.tsx`.
- Tipografía: una sola en toda la web, en [`lib/fonts.ts`](lib/fonts.ts).
- Simulación del campo: [`lib/pitch-sim.ts`](lib/pitch-sim.ts) (inventada; no usa datos del partido).
- Balón: [`lib/ball.ts`](lib/ball.ts) + [`components/data-ball.tsx`](components/data-ball.tsx).
- Imágenes del README de la organización: `npm run previews` (ver README.md).

## Comprobar antes de hacer push

```bash
npm run typecheck
npm run build
```

</details>
