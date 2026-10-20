import { Reveal } from "@/components/reveal"

export function SectionHead({
  index,
  label,
  aside,
  title,
  accent,
}: {
  index: string
  label: string
  aside?: string
  title: string
  accent?: string
}) {
  return (
    <div>
      <div className="label flex items-center justify-between border-t border-ink pt-3">
        <span className="flex items-center gap-2">
          {/* pestaña blaugrana sobre la línea, como el cuello de una camiseta */}
          <span aria-hidden className="blaugrana -mt-[13px] mr-1 h-[3px] w-8 self-start" />
          <span className="text-accent">{index}</span> — {label}
        </span>
        {aside && <span className="text-muted">{aside}</span>}
      </div>
      <Reveal
        as="h2"
        className="font-display-tight mt-6 text-[clamp(2.6rem,calc(8.5vw*var(--display-scale)),calc(8rem*var(--display-scale)))] sm:mt-8"
      >
        {title}
        {accent && (
          <>
            {" "}
            <span className="accent">{accent}</span>
          </>
        )}
      </Reveal>
    </div>
  )
}
