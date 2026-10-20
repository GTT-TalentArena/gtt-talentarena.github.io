# gtt — web de GTT · TalentArena

Web del equipo para More than a Hack 2027: **https://gtt-talentarena.github.io**

Next.js 16 + Tailwind CSS 4, exportada como web estática y publicada con **GitHub Pages**: cada push a `main`
compila y publica (`.github/workflows/deploy.yml`). Es también la fuente de todas las imágenes del perfil de
GitHub de la organización.

## Vistas

| Ruta | Qué es |
| :-- | :-- |
| `/` | Portada («Team»): reto, plantilla en 1-2-2, enfoque y calendario, con su propio índice de secciones |
| `/log` | El cuaderno del modelo de posesión: estudios, mejoras y pruebas sobre el fork del reto, en orden |
| `/previews/*` | Lienzos para las imágenes del README de la organización (no se indexan) |

## Añadir una entrada al log

El log registra el trabajo sobre el **modelo de posesión** en el repo principal del proyecto
([`GTT-TalentArena/more-than-a-hack-2027`](https://github.com/GTT-TalentArena/more-than-a-hack-2027)), **no** los
cambios de esta web, que van en los commits de este repositorio. Sin CMS: un fichero Markdown por entrada en [`content/log/`](content/log). Copia
[`_template.md`](content/log/_template.md) y sigue las instrucciones del principio de [`lib/log.ts`](lib/log.ts)
(también en [`AGENTS.md`](AGENTS.md), para que las lean los LLMs del equipo). Push a `main` y está publicado.

## Editar contenido

Todo el texto está en [`lib/content.ts`](lib/content.ts). Los roles de la plantilla están vacíos («Pending») hasta
que se definan.

## Navegación

La barra de arriba solo cambia de vista (**Team** y **Log**). Las secciones de la portada tienen su propio índice
fijo bajo la cabecera ([`components/section-index.tsx`](components/section-index.tsx)): cada sitio hace una sola cosa.

## Identidad

Equipación **Casa** (papel, tinta azul noche y blaugrana) y una sola tipografía en todas las vistas: Bricolage
Grotesque, Instrument Serif cursiva, Geist y Geist Mono ([`lib/fonts.ts`](lib/fonts.ts)).

## La plantilla

Medio campo con la formación **1-2-2** ([`components/lineup.tsx`](components/lineup.tsx)): cada jugador tiene su
`position` y su `spot` (en metros) en [`lib/content.ts`](lib/content.ts). Al pasar el ratón, enfocar o tocar un
jugador se abre su ficha con los enlaces.

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

Genera, en `../.github/profile/assets` y `../.github/brand`:

- `pitch.svg`, `banner.svg` y `site.svg`: **SVG animados** (fuentes embebidas + SMIL) que GitHub reproduce en el
  README. El balón rueda y el anillo gira; con «Reducir movimiento» se quedan quietos. Pide las fuentes a Google
  Fonts, así que necesita red.
- Capturas PNG con Edge/Chrome headless: plantilla, avatar, social previews y `app/opengraph-image.png`.

## Desarrollo

```bash
npm install
npm run dev
npm run typecheck
```
