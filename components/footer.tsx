import Link from "next/link"
import { disclaimer, site } from "@/lib/content"
import { Logo } from "@/components/header"

export function Footer() {
  return (
    <footer className="bg-ink px-4 py-8 text-paper sm:px-6 lg:px-10">
      <div className="label mx-auto flex max-w-[1440px] flex-col gap-4 text-paper/60 sm:flex-row sm:items-center sm:justify-between">
        <span>
          © {site.since} {site.name}
        </span>
        <span className="normal-case tracking-normal text-paper">
          <Logo size="1.5rem" />
        </span>
        <nav aria-label="Footer" className="flex gap-5">
          <Link href="/" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-paper">
            Team
          </Link>
          <Link href="/log" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-paper">
            Log
          </Link>
          <a href="#content" className="-mx-2 -my-3 inline-block px-2 py-3 hover:text-paper">
            Top ↑
          </a>
        </nav>
      </div>
      <p className="label mx-auto mt-6 max-w-[1440px] border-t border-paper/15 pt-4 text-[0.62rem] text-paper/45">
        {disclaimer}
      </p>
    </footer>
  )
}
