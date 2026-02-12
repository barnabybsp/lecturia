import type { MetadataRoute } from 'next'

/**
 * Robots.txt configuration — this file tells search engine crawlers
 * which parts of your site they're allowed to visit.
 *
 * Next.js automatically serves this at /robots.txt.
 *
 * We allow crawlers to see public pages (landing page, login)
 * but block them from API routes and dashboard pages
 * (those are private and behind authentication).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',        // API routes — not meant for browsers
          '/lecturer/',   // Lecturer dashboard — private
          '/student/',    // Student dashboard — private
        ],
      },
    ],
    sitemap: 'https://lecturia.dev/sitemap.xml',
  }
}
