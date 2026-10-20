import type { Metadata, Viewport } from "next"
import { site } from "@/lib/content"
import { fontVariables } from "@/lib/fonts"
import { isLaunched } from "@/lib/launch"
import { defaultType, typesets, typeStorageKey } from "@/lib/typesets"
import { TypeSwitcher } from "@/components/type-switcher"
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

// Antes de pintar: marca que hay JS (y ?still para capturas sin animación de entrada) y,
// mientras se elige tipografía, aplica la de ?type= o la guardada.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');if(/[?&]still/.test(location.search))d.classList.add('still');${
  isLaunched
    ? ""
    : `try{var ok=${JSON.stringify(typesets.map((t) => t.id))};var q=new URLSearchParams(location.search).get('type');var k=${JSON.stringify(typeStorageKey)};if(q&&ok.indexOf(q)>-1){localStorage.setItem(k,q)}var t=localStorage.getItem(k);if(t&&ok.indexOf(t)>-1){d.setAttribute('data-type',t)}}catch(e){}`
}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-type={defaultType} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Skip to content
        </a>
        {children}
        {!isLaunched && <TypeSwitcher />}
      </body>
    </html>
  )
}
