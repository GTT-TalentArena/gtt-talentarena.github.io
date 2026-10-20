/**
 * Combinaciones tipográficas candidatas. Cada una asigna cuatro papeles:
 *   display → titulares (GTT, títulos de sección)
 *   accent  → la palabra que cambia el tono («dades.», «the ball?»)
 *   sans    → texto
 *   mono    → etiquetas y datos (`01 — THE CHALLENGE`)
 * Las fuentes se cargan en lib/fonts.ts y los ajustes finos (peso, interletraje, escala)
 * viven en app/globals.css bajo [data-type="<id>"].
 *
 * Para elegir una: pon su id en `defaultType`, borra el resto aquí, en globals.css y en
 * lib/fonts.ts, y define NEXT_PUBLIC_LAUNCHED=1 al publicar (oculta el selector).
 */
export const typesets = [
  {
    id: "actual",
    name: "Actual",
    idea: "The current set, borrowed from Nhoa's portfolio. Here for reference.",
    fonts: { display: "Bricolage Grotesque", accent: "Instrument Serif Italic", sans: "Geist", mono: "Geist Mono" },
    display: "var(--f-bricolage)",
  },
  {
    id: "graderia",
    name: "Graderia",
    idea: "Stadium signage. A condensed grotesque made for wayfinding, softened by a classical italic.",
    fonts: { display: "Big Shoulders", accent: "Libre Caslon Italic", sans: "Figtree", mono: "JetBrains Mono" },
    display: "var(--f-big-shoulders)",
  },
  {
    id: "pissarra",
    name: "Pissarra",
    idea: "The tactics board. Bold geometric headlines and the coach's marker scribbling over them.",
    fonts: { display: "Gabarito", accent: "Permanent Marker", sans: "Work Sans", mono: "Martian Mono" },
    display: "var(--f-gabarito)",
  },
  {
    id: "marcador",
    name: "Marcador",
    idea: "The LED scoreboard. Dot-matrix headlines — like a tracking frame — with a bookish italic.",
    fonts: { display: "Doto", accent: "Literata Italic", sans: "Onest", mono: "Azeret Mono" },
    display: "var(--f-doto)",
  },
  {
    id: "champions",
    name: "Nit de Champions",
    idea: "Wide, technical display type and an anthem-grand Garamond italic. A European night.",
    fonts: { display: "Unbounded", accent: "Cormorant Garamond Italic", sans: "Manrope", mono: "IBM Plex Mono" },
    display: "var(--f-unbounded)",
  },
  {
    id: "gol",
    name: "Gol",
    idea: "Heavy, loud and celebratory, with a handwritten note in the margin.",
    fonts: { display: "Dela Gothic One", accent: "Caveat", sans: "Plus Jakarta Sans", mono: "Kode Mono" },
    display: "var(--f-dela)",
  },
  {
    id: "cruyff",
    name: "Cruyff 74",
    idea: "A 1970s match poster: fat retro grotesque, a swashy italic and a typewritten match report.",
    fonts: { display: "Bowlby One", accent: "Shrikhand", sans: "Karla", mono: "Courier Prime" },
    display: "var(--f-bowlby)",
  },
  {
    id: "quadern",
    name: "Quadern",
    idea: "The data notebook. Monospace all the way down, as if the page were a Jupyter cell.",
    fonts: { display: "Chivo Mono", accent: "Chivo Mono Italic", sans: "Chivo", mono: "Chivo Mono" },
    display: "var(--f-chivo-mono)",
  },
  {
    id: "eixample",
    name: "Eixample",
    idea: "Cerdà's grid: a rational, slightly quirky Swiss grotesque with a crisp book italic.",
    fonts: { display: "Familjen Grotesk", accent: "Spectral Italic", sans: "Public Sans", mono: "Fragment Mono" },
    display: "var(--f-familjen)",
  },
  {
    id: "diari",
    name: "Diari",
    idea: "The morning sports paper: tall condensed headlines over serif columns.",
    fonts: { display: "League Gothic", accent: "Crimson Pro Italic", sans: "Crimson Pro", mono: "Cutive Mono" },
    display: "var(--f-league-gothic)",
  },
  {
    id: "llotja",
    name: "Llotja",
    idea: "The directors' box. High-contrast Bodoni, fashion-magazine sharp.",
    fonts: { display: "Bodoni Moda", accent: "Bodoni Moda Italic", sans: "Albert Sans", mono: "DM Mono" },
    display: "var(--f-bodoni)",
  },
] as const

export type TypesetId = (typeof typesets)[number]["id"]

/** Tipografía que ve todo el mundo por defecto. */
export const defaultType: TypesetId = "actual"

export const typeStorageKey = "gtt-type"
