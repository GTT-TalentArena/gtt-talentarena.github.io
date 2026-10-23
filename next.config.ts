import type { NextConfig } from "next"

// Static site for GitHub Pages: `npm run build` generates ./out (see .github/workflows/deploy.yml)
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
