import { DataBall } from "@/components/data-ball"

/** Avatar de la organización en GitHub: 500×500. El balón hace de punto del logo. */
export default function AvatarPreview() {
  return (
    <div className="grid size-[500px] place-items-center bg-ink text-paper">
      <span className="flex items-end gap-2">
        <span className="accent leading-none [--accent-base:13rem]">gtt</span>
        <DataBall still className="mb-6 size-28 text-paper" />
      </span>
    </div>
  )
}
