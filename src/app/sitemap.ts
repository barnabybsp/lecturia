import type { MetadataRoute } from 'next'

/**
 * Sitemap generator — this file tells search engines (like Google) about
 * all the public pages on your site so they can find and index them.
 *
 * Next.js automatically serves this at /sitemap.xml when you export
 * a default function from app/sitemap.ts.
 *
 * Only public-facing pages should be listed here.
 * Dashboard pages (lecturer/, student/) are behind auth,
 * so search engines shouldn't index those.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lecturia.dev'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1, // Homepage gets the highest priority
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
