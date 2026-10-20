import type { ReactNode } from "react"
import { Arrow, ArrowDown } from "@/components/icons"

type Props = { href: string; children: ReactNode; external?: boolean; down?: boolean }

const ext = (external?: boolean) => (external ? { target: "_blank", rel: "noreferrer" } : {})

export function ButtonPrimary({ href, children, external, down }: Props) {
  return (
    <a
      href={href}
      {...ext(external)}
      className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-medium text-on-accent transition-colors hover:bg-ink hover:text-paper"
    >
      {children}
      {down ? (
        <ArrowDown className="size-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
      ) : (
        <Arrow className="size-3 transition-transform duration-500 group-hover:rotate-45" />
      )}
    </a>
  )
}

export function ButtonGhost({ href, children, external, down }: Props) {
  return (
    <a
      href={href}
      {...ext(external)}
      className="group inline-flex items-center gap-2 rounded-full border border-ink/25 px-5 py-3 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      {children}
      {down ? (
        <ArrowDown className="size-3.5 transition-transform duration-500 group-hover:translate-y-0.5" />
      ) : (
        <Arrow className="size-3 transition-transform duration-500 group-hover:rotate-45" />
      )}
    </a>
  )
}
