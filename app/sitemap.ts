import type { MetadataRoute } from 'next'
import { films } from '@/content/films'
import { site } from '@/content/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: 'monthly', priority: 1 },
    ...films.map((f) => ({ url: `${site.url}/filmes/${f.slug}`, changeFrequency: 'yearly' as const, priority: 0.8 })),
  ]
}
