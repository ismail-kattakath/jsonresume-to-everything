import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove basePath and assetPrefix for custom domain
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/ismail-portfolio' : '',
  // basePath: process.env.NODE_ENV === 'production' ? '/ismail-portfolio' : '',
};

export default nextConfig;
