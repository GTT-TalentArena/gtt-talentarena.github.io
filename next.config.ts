import type { NextConfig } from "next"

// Web estática para GitHub Pages: `npm run build` genera ./out (ver .github/workflows/deploy.yml)
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
}

export default nextConfig
