import type { Metadata } from "next"

/**
 * Fixed-size canvases for the organisation README images and the social previews.
 * They are captured with `npm run previews` (scripts/previews.ts). Not indexed.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function PreviewsLayout({ children }: { children: React.ReactNode }) {
  return children
}
