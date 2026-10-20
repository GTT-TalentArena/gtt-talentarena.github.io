import type { MetadataRoute } from "next"
import { site } from "@/lib/content"
import { getEntries } from "@/lib/log"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${site.url}/`, priority: 1 },
    { url: `${site.url}/log/`, priority: 0.9 },
    ...getEntries().map((e) => ({ url: `${site.url}/log/${e.slug}/`, lastModified: e.date, priority: 0.7 })),
  ]
}
