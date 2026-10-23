/**
 * Google fonts loaded with next/font (served from the site itself).
 *   Bricolage Grotesque → headlines · Instrument Serif italic → the word that shifts the tone
 *   Geist → body text · Geist Mono → labels and data
 * The same ones, embedded, in the README images (scripts/readme-svg.ts).
 */
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

const bricolage = Bricolage_Grotesque({ subsets: ["latin", "latin-ext"], axes: ["opsz", "wdth"], variable: "--f-bricolage" })
const instrument = Instrument_Serif({ subsets: ["latin", "latin-ext"], weight: "400", style: ["normal", "italic"], variable: "--f-instrument" })
const geist = Geist({ subsets: ["latin", "latin-ext"], variable: "--f-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--f-geist-mono" })

/** Classes that define the `--f-*` variables; they go on <html>. */
export const fontVariables = [bricolage, instrument, geist, geistMono].map((f) => f.variable).join(" ")
