"use client"

import { useEffect, useRef, type ElementType, type ComponentPropsWithoutRef } from "react"

type RevealProps<T extends ElementType> = {
  as?: T
  delay?: number
} & ComponentPropsWithoutRef<T>

export function Reveal<T extends ElementType = "div">({ as, delay = 0, style, ...props }: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null)
  const Tag = (as ?? "div") as ElementType

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "in"
          io.disconnect()
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
      {...props}
    />
  )
}
