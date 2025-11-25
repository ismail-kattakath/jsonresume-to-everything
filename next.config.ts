import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove basePath and assetPrefix for custom domain
  // If not using custom domain, uncomment these lines:
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/jsonresume-to-everything' : '',
  // basePath: process.env.NODE_ENV === 'production' ? '/jsonresume-to-everything' : '',
}

export default nextConfig
