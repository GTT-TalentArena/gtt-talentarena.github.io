/**
 * Fuentes de Google cargadas con next/font (se sirven desde la propia web).
 * Cada combinación de lib/typesets.ts usa cuatro de estas variables.
 *
 * Mientras el equipo elige tipografía se cargan todas con `preload: false`: el navegador solo
 * descarga las que la página usa. Cuando haya elegida, borra las que sobren.
 */
import {
  Albert_Sans,
  Azeret_Mono,
  Big_Shoulders,
  Bodoni_Moda,
  Bowlby_One,
  Bricolage_Grotesque,
  Caveat,
  Chivo,
  Chivo_Mono,
  Cormorant_Garamond,
  Courier_Prime,
  Crimson_Pro,
  Cutive_Mono,
  DM_Mono,
  Dela_Gothic_One,
  Doto,
  Familjen_Grotesk,
  Figtree,
  Fragment_Mono,
  Gabarito,
  Geist,
  Geist_Mono,
  IBM_Plex_Mono,
  Instrument_Serif,
  JetBrains_Mono,
  Karla,
  Kode_Mono,
  League_Gothic,
  Libre_Caslon_Text,
  Literata,
  Manrope,
  Martian_Mono,
  Onest,
  Permanent_Marker,
  Plus_Jakarta_Sans,
  Public_Sans,
  Shrikhand,
  Spectral,
  Unbounded,
  Work_Sans,
} from "next/font/google"


// 00 · Actual (la de Nhoa)
const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], axes: ["opsz", "wdth"], variable: "--f-bricolage" })
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--f-instrument" })
const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--f-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--f-geist-mono" })

// 01 · Graderia
const bigShoulders = Big_Shoulders({ subsets: ["latin"], axes: ["opsz"], variable: "--f-big-shoulders", preload: false, adjustFontFallback: false })
const libreCaslon = Libre_Caslon_Text({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--f-libre-caslon", preload: false })
const figtree = Figtree({ subsets: ["latin"], variable: "--f-figtree", preload: false })
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--f-jetbrains", preload: false })

// 02 · Pissarra
const gabarito = Gabarito({ subsets: ["latin"], variable: "--f-gabarito", preload: false })
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--f-marker", preload: false })
const workSans = Work_Sans({ subsets: ["latin"], variable: "--f-work-sans", preload: false })
const martian = Martian_Mono({ subsets: ["latin"], axes: ["wdth"], variable: "--f-martian", preload: false })

// 03 · Marcador
const doto = Doto({ subsets: ["latin"], axes: ["ROND"], variable: "--f-doto", preload: false })
const literata = Literata({ subsets: ["latin"], style: ["italic"], variable: "--f-literata", preload: false })
const onest = Onest({ subsets: ["latin"], variable: "--f-onest", preload: false })
const azeret = Azeret_Mono({ subsets: ["latin"], variable: "--f-azeret", preload: false })

// 04 · Nit de Champions
const unbounded = Unbounded({ subsets: ["latin"], variable: "--f-unbounded", preload: false })
const cormorant = Cormorant_Garamond({ subsets: ["latin"], style: ["italic"], variable: "--f-cormorant", preload: false })
const manrope = Manrope({ subsets: ["latin"], variable: "--f-manrope", preload: false })
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-plex-mono", preload: false })

// 05 · Gol
const dela = Dela_Gothic_One({ subsets: ["latin"], weight: "400", variable: "--f-dela", preload: false })
const caveat = Caveat({ subsets: ["latin"], variable: "--f-caveat", preload: false })
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--f-jakarta", preload: false })
const kode = Kode_Mono({ subsets: ["latin"], variable: "--f-kode", preload: false })

// 06 · Cruyff 74
const bowlby = Bowlby_One({ subsets: ["latin"], weight: "400", variable: "--f-bowlby", preload: false })
const shrikhand = Shrikhand({ subsets: ["latin"], weight: "400", variable: "--f-shrikhand", preload: false })
const karla = Karla({ subsets: ["latin"], variable: "--f-karla", preload: false })
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--f-courier", preload: false })

// 07 · Quadern
const chivoMono = Chivo_Mono({ subsets: ["latin"], style: ["normal", "italic"], variable: "--f-chivo-mono", preload: false })
const chivo = Chivo({ subsets: ["latin"], variable: "--f-chivo", preload: false })

// 08 · Eixample
const familjen = Familjen_Grotesk({ subsets: ["latin"], variable: "--f-familjen", preload: false })
const spectral = Spectral({ subsets: ["latin"], weight: "400", style: ["italic"], variable: "--f-spectral", preload: false })
const publicSans = Public_Sans({ subsets: ["latin"], variable: "--f-public-sans", preload: false })
const fragment = Fragment_Mono({ subsets: ["latin"], weight: "400", variable: "--f-fragment", preload: false })

// 09 · Diari
const leagueGothic = League_Gothic({ subsets: ["latin"], axes: ["wdth"], variable: "--f-league-gothic", preload: false })
const crimson = Crimson_Pro({ subsets: ["latin"], style: ["normal", "italic"], variable: "--f-crimson", preload: false })
const cutive = Cutive_Mono({ subsets: ["latin"], weight: "400", variable: "--f-cutive", preload: false })

// 10 · Llotja
const bodoni = Bodoni_Moda({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--f-bodoni", preload: false })
const albert = Albert_Sans({ subsets: ["latin"], variable: "--f-albert", preload: false })
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--f-dm-mono", preload: false })

/** Clases que definen todas las variables `--f-*`; van en <html>. */
export const fontVariables = [
  bricolage, instrument, geist, geistMono,
  bigShoulders, libreCaslon, figtree, jetbrains,
  gabarito, marker, workSans, martian,
  doto, literata, onest, azeret,
  unbounded, cormorant, manrope, plexMono,
  dela, caveat, jakarta, kode,
  bowlby, shrikhand, karla, courier,
  chivoMono, chivo,
  familjen, spectral, publicSans, fragment,
  leagueGothic, crimson, cutive,
  bodoni, albert, dmMono,
]
  .map((f) => f.variable)
  .join(" ")
