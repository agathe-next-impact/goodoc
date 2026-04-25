import type { NextConfig } from 'next'

const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
const r2Hostname = r2PublicUrl ? new URL(r2PublicUrl).hostname : undefined

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: [
    '@medsite/config',
    '@medsite/db',
    '@medsite/doctolib',
    '@medsite/seo',
    '@medsite/templates',
    '@medsite/types',
    '@medsite/ui',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // Preset seed images live on Unsplash until practitioners upload their
      // own to R2 (chantier 07). Without this entry, every seeded page errors
      // out because next/image refuses unknown remote hosts.
      { protocol: 'https', hostname: 'images.unsplash.com' },
      ...(r2Hostname ? [{ protocol: 'https' as const, hostname: r2Hostname }] : []),
    ],
  },
  typedRoutes: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
