import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  experimental: {
    inlineCss: true,
  },
  output: "standalone",
  reactCompiler: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      // Open Up Group corporate site (used by seed data and the signage display).
      { protocol: "https", hostname: "www.openupgroup.co.jp" },
      // Vercel Blob hosted assets in production.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "*.blob.vercel-storage.com" },
      // Local RustFS during development.
      { protocol: "http", hostname: "127.0.0.1", port: "9000" },
      { protocol: "http", hostname: "localhost", port: "9000" },
    ],
  },
}

export default nextConfig
