import type { IConfig } from 'next-sitemap'

const config: IConfig = {
  siteUrl: 'https://ismail.kattakath.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false, // Single sitemap (not index + multiple)
  outDir: 'out', // Output to 'out' directory for static export

  // Exclude edit pages, API endpoints, and image routes
  exclude: [
    '/resume/edit',
    '/resume/edit/*',
    '/cover-letter/edit',
    '/cover-letter/edit/*',
    '/resume.json',
    '/opengraph-image',
    '/twitter-image',
  ],

  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/resume/edit/', '/cover-letter/edit/', '/resume.json/'],
      },
    ],
  },

  // Priority and change frequency defaults
  changefreq: 'monthly',
  priority: 0.7,

  // Custom transformation for specific routes
  transform: async (config, path) => {
    // Custom priority for different routes
    let priority = 0.7
    let changefreq: 'monthly' | 'yearly' = 'monthly'

    if (path === '/') {
      priority = 1.0
    } else if (path === '/resume' || path === '/resume/') {
      priority = 0.8
    } else if (path === '/book' || path === '/book/') {
      priority = 0.5
      changefreq = 'yearly'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}

export default config
