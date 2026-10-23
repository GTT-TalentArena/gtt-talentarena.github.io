import { CenterSpot } from "@/components/icons"

export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul
      className={`flex shrink-0 items-center ${hidden ? "motion-reduce:hidden" : ""}`}
      aria-hidden={hidden || undefined}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-3xl font-medium tracking-tight sm:text-5xl">{item}</span>
          <CenterSpot className="size-5 opacity-70 sm:size-7" />
        </li>
      ))}
    </ul>
  )
  // With "Reduce motion" it doesn't move on its own: it scrolls by hand and without the loop copy.
  return (
    <div
      className={`on-accent overflow-hidden py-5 motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none] motion-reduce:[&::-webkit-scrollbar]:hidden sm:py-7 ${className}`}
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}
