/**
 * Fuentes de Google cargadas con next/font (se sirven desde la propia web).
 *   Bricolage Grotesque → titulares · Instrument Serif cursiva → la palabra que cambia el tono
 *   Geist → texto · Geist Mono → etiquetas y datos
 * Las mismas, embebidas, en las imágenes del README (scripts/readme-svg.ts).
 */
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], axes: ["opsz", "wdth"], variable: "--f-bricolage" })
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--f-instrument" })
const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--f-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--f-geist-mono" })

/** Clases que definen las variables `--f-*`; van en <html>. */
export const fontVariables = [bricolage, instrument, geist, geistMono].map((f) => f.variable).join(" ")
