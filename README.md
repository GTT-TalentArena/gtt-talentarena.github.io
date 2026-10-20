# gtt — web de GTT · TalentArena

Web del equipo para More than a Hack 2027: **https://gtt-talentarena.github.io**

Next.js 16 + Tailwind CSS 4, exportada como web estática y publicada con **GitHub Pages**: cada push a `main`
compila y publica (`.github/workflows/deploy.yml`). Es también la fuente de todas las imágenes del perfil de
GitHub de la organización.

## Vistas

| Ruta | Qué es |
| :-- | :-- |
| `/` | Portada: equipo, reto, enfoque y calendario |
| `/log` | El cuaderno del equipo: estudios, código, experimentos, iteraciones, datos y decisiones, en orden |
| `/type` | Las 10 tipografías candidatas sobre componentes reales (se borra al elegir) |
| `/previews/*` | Lienzos para las imágenes del README de la organización (no se indexan) |

## Añadir una entrada al log

Sin CMS: un fichero Markdown por entrada en [`content/log/`](content/log). Copia
[`_template.md`](content/log/_template.md) y sigue las instrucciones del principio de [`lib/log.ts`](lib/log.ts)
(también en [`AGENTS.md`](AGENTS.md), para que las lean los LLMs del equipo). Push a `main` y está publicado.

## Editar contenido

Todo el texto está en [`lib/content.ts`](lib/content.ts). Los roles de la plantilla están vacíos («Pending») hasta
que se definan.

## Tipografía

Equipación única: **Casa** (papel, tinta azul noche y blaugrana). La tipografía está por elegir: diez combinaciones
en [`lib/typesets.ts`](lib/typesets.ts), con sus ajustes en `app/globals.css` (`[data-type]`). Hasta el lanzamiento
hay un selector flotante y se puede enlazar una con `?type=marcador`. Al elegir: pon su id en `defaultType`, borra el
resto (y la vista `/type`) y pon `NEXT_PUBLIC_LAUNCHED: "1"` en el workflow.

## El campo y el balón

- [`lib/pitch-sim.ts`](lib/pitch-sim.ts) simula 22 jugadores y el balón con las etiquetas del reto (H/A/D). Es
  **inventada**: no usa ni reconstruye datos del partido, que las reglas prohíben publicar.
- [`lib/ball.ts`](lib/ball.ts) es la geometría exacta de un balón (icosaedro truncado) y
  [`components/data-ball.tsx`](components/data-ball.tsx) lo dibuja como una malla de datos: se puede chutar
  arrastrándolo o con un clic.

## Imágenes del README de la organización

```bash
npm run build
npm run serve                                   # sirve ./out en http://localhost:4173
npm run previews -- http://localhost:4173       # en otra terminal
```

Genera `pitch.svg` (animación que GitHub sí reproduce) y captura con Edge/Chrome headless los PNG en
`../.github/profile/assets` y `../.github/brand`, además de `app/opengraph-image.png`.

## Desarrollo

```bash
npm install
npm run dev
npm run typecheck
```
