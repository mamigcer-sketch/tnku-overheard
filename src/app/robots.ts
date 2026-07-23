import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin'], // Admin panelini Google görmesin
    },
    sitemap: 'https://www.tnkuoverheard.com.tr/sitemap.xml',
  }
}