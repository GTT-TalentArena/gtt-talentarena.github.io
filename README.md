# gtt — GTT · TalentArena website

> 🇪🇸 This README was originally written in Spanish. The Spanish original is kept at the bottom.

The team website for More than a Hack 2027: **https://gtt-talentarena.github.io**

Next.js 16 + Tailwind CSS 4, exported as a static site and published with **GitHub Pages**: every push to `main`
builds and publishes (`.github/workflows/deploy.yml`). It is also the source of every image on the organisation's
GitHub profile.

## Views

| Route | What it is |
| :-- | :-- |
| `/` | Home page ("Team"): challenge, squad in a 1-2-2, approach and fixtures, with its own section index |
| `/log` | The possession model log: studies, improvements and tests on the challenge fork, in order |
| `/previews/*` | Canvases for the organisation README images (not indexed) |

## Adding a log entry

The log records the work on the **possession model** in the project's main repo
([`GTT-TalentArena/more-than-a-hack-2027`](https://github.com/GTT-TalentArena/more-than-a-hack-2027)), **not** the
changes to this website, which go in this repository's commits. No CMS: one Markdown file per entry in
[`content/log/`](content/log). Copy [`_template.md`](content/log/_template.md) and follow the instructions at the top
of [`lib/log.ts`](lib/log.ts) (also in [`AGENTS.md`](AGENTS.md), so the team's LLMs read them). Push to `main` and it
is published.

## Editing content

All the text is in [`lib/content.ts`](lib/content.ts). Squad roles are empty ("Pending") until they are defined.

## Navigation

The top bar only switches view (**Team** and **Log**). The home page sections have their own fixed index under the
header ([`components/section-index.tsx`](components/section-index.tsx)): each place does one thing.

## Identity

The **Home** kit (paper, midnight-blue ink and blaugrana) and a single type system across all views: Bricolage
Grotesque, Instrument Serif italic, Geist and Geist Mono ([`lib/fonts.ts`](lib/fonts.ts)).

## The squad

Half a pitch with the **1-2-2** formation ([`components/lineup.tsx`](components/lineup.tsx)): each player has their
`position` and `spot` (in metres) in [`lib/content.ts`](lib/content.ts). Hovering, focusing or tapping a player opens
their card with the links.

## The pitch and the ball

- [`lib/pitch-sim.ts`](lib/pitch-sim.ts) simulates 22 players and the ball with the challenge labels (H/A/D). It is
  **invented**: it neither uses nor reconstructs match data, which the rules forbid publishing.
- [`lib/ball.ts`](lib/ball.ts) is the exact geometry of a football (truncated icosahedron) and
  [`components/data-ball.tsx`](components/data-ball.tsx) draws it as a data mesh: you can kick it by dragging it or
  with a click.

## Organisation README images

```bash
npm run build
npm run serve                                   # serves ./out on http://localhost:4173
npm run previews -- http://localhost:4173       # in another terminal
```

It generates, in `../.github/profile/assets` and `../.github/brand`:

- `pitch.svg`, `banner.svg` and `site.svg`: **animated SVGs** (embedded fonts + SMIL) that GitHub plays in the
  README. The ball rolls and the ring spins; with "Reduce motion" they stay still. It fetches the fonts from Google
  Fonts, so it needs network access.
- PNG screenshots with headless Edge/Chrome: squad, avatar, social previews and `app/opengraph-image.png`.

## Development

```bash
npm install
npm run dev
npm run typecheck
```

## Contributing

Everything is written in English. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

<details>
<summary>🇪🇸 Original (Spanish)</summary>

# gtt — web de GTT · TalentArena

Web del equipo para More than a Hack 2027: **https://gtt-talentarena.github.io**

Next.js 16 + Tailwind CSS 4, exportada como web estática y publicada con **GitHub Pages**: cada push a `main`
compila y publica (`.github/workflows/deploy.yml`). Es también la fuente de todas las imágenes del perfil de
GitHub de la organización.

## Vistas

| Ruta | Qué es |
| :-- | :-- |
| `/` | Portada («Team»): reto, plantilla en 1-2-2, enfoque y calendario, con su propio índice de secciones |
| `/log` | El log del modelo de posesión: estudios, mejoras y pruebas sobre el fork del reto, en orden |
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

</details>
