# AGENTS.md — web de GTT (gtt-talentarena.github.io)

Next.js 16 + Tailwind CSS 4, exportada como web estática y publicada con GitHub Pages en cada push a `main`
(`.github/workflows/deploy.yml`). Comentarios del código en español; textos de la web en inglés.

## Si te piden añadir algo al log

El log (`/log`) es el cuaderno del equipo: estudios, código, experimentos (también los fallidos), iteraciones,
datos y decisiones. **Lee primero el comentario al principio de [`lib/log.ts`](lib/log.ts)**: explica el formato.

En resumen:

1. Copia [`content/log/_template.md`](content/log/_template.md) a `content/log/AAAA-MM-DD-slug-en-ingles.md`.
2. Rellena la cabecera YAML (`title`, `date`, `type`, `outcome`, `authors`, `summary`, `metrics`, `tags`, `links`).
3. Escribe el cuerpo en inglés: `## Context`, `## What we did`, `## Result`, `## Next`.
4. Nunca pegues datos del partido ni nada que permita reconstruirlos (RULES.md del reto).
5. `npm run build`: si la cabecera está mal, falla con un mensaje `[log] …` que dice qué arreglar.

## Otras piezas

- Textos: [`lib/content.ts`](lib/content.ts). Plantilla y roles: `squad` (rol vacío = «Pending»).
- Tipografía: [`lib/typesets.ts`](lib/typesets.ts) y `app/globals.css` (`[data-type]`). Una sola en toda la web.
- Simulación del campo: [`lib/pitch-sim.ts`](lib/pitch-sim.ts) (inventada; no usa datos del partido).
- Balón: [`lib/ball.ts`](lib/ball.ts) + [`components/data-ball.tsx`](components/data-ball.tsx).
- Imágenes del README de la organización: `npm run previews` (ver README.md).

## Comprobar antes de hacer push

```bash
npm run typecheck
npm run build
```
