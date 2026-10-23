import type { Metadata, Viewport } from "next"
import { site } from "@/lib/content"
import { fontVariables } from "@/lib/fonts"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
}

export const viewport: Viewport = {
  themeColor: "#f3eee6",
}

// Before painting: flag that JS is on. For the README screenshots (scripts/previews.ts):
// ?still removes the entry animations and ?noball hides the ball (it is drawn separately, animated).
const bootScript = `(function(){var d=document.documentElement,q=location.search;d.classList.add('js');if(/[?&]still/.test(q))d.classList.add('still');if(/[?&]noball/.test(q))d.classList.add('noball')})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* Anonymous visits, no cookies: https://jimy-superveil.vercel.app (doesn't count localhost or automated browsers) */}
        <script defer src="https://jimy-superveil.vercel.app/p.js" data-site="gtt" />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
