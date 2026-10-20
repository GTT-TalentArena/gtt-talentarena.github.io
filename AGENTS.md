# AGENTS.md — web de GTT (gtt-talentarena.github.io)

Next.js 16 + Tailwind CSS 4, exportada como web estática y publicada con GitHub Pages en cada push a `main`
(`.github/workflows/deploy.yml`). Comentarios del código en español; textos de la web en inglés.

## Si te piden añadir algo al log

El log (`/log`) es el cuaderno del **modelo de posesión**: lo que estudiamos, las mejoras que encontramos y las
pruebas que hacemos en el repo principal del proyecto, el fork
[`GTT-TalentArena/more-than-a-hack-2027`](https://github.com/GTT-TalentArena/more-than-a-hack-2027).
**No** es un registro de cambios de esta web. **Lee primero el comentario al principio de
[`lib/log.ts`](lib/log.ts)**: explica el formato, los focos actuales y el flujo (estudio en español en `docs/` del
fork → entrada aquí en inglés antes de programar → experimentos con sus resultados).

En resumen:

1. Copia [`content/log/_template.md`](content/log/_template.md) a `content/log/AAAA-MM-DD-slug-en-ingles.md`.
2. Rellena la cabecera YAML (`title`, `date`, `type`, `outcome`, `authors`, `summary`, `metrics`, `tags`, `links`).
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
