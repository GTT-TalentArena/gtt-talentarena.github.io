import type { Metadata } from "next"

/**
 * Lienzos a tamaño fijo para las imágenes del README de la organización y las social previews.
 * Se capturan con `npm run previews` (scripts/previews.ts). No se indexan.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function PreviewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
