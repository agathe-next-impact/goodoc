import type { NextConfig } from 'next'
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@medsite/billing', '@medsite/config', '@medsite/db', '@medsite/email', '@medsite/templates', '@medsite/types'],
  serverExternalPackages: ['prettier'],
  experimental: {
    reactCompiler: false,
  },
  webpack: (config) => {
    // Payload's drizzle schema generator dynamically requires prettier — webpack
    // can't analyse the expression. The code path is dev-only and harmless.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /prettier/, message: /Critical dependency/ },
    ]
    return config
  },
}

export default withPayload(nextConfig)
