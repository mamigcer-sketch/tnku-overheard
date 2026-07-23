import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.tnkuoverheard.com.tr',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
  ]
}