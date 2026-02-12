---
name: auto-seo
description: Automatically applies SEO best practices when building web apps, pages, or components. Ensures all pages include proper metadata, OpenGraph tags, Twitter cards, canonical URLs, structured data, and semantic HTML. Use proactively when creating new pages, routes, or web applications to ensure they are search engine optimized by default.
---

# Automatic SEO Optimization

This skill ensures all web apps and pages are automatically SEO optimized by default. Apply these patterns proactively whenever building new pages, routes, or web applications.

## Core Principle

**Every page must be SEO-ready before completion.** SEO is not optional—it's a fundamental requirement for all public-facing web content.

## Automatic SEO Checklist

When creating or modifying any page, verify these elements:

### Essential Metadata (Every Page)

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Page Title - Site Name',
    template: '%s | Site Name', // For dynamic titles
  },
  description: 'Compelling 150-160 character description with primary keywords',
  alternates: {
    canonical: '/page-path', // Always include canonical URL
  },
  openGraph: {
    title: 'Page Title',
    description: 'Description for social sharing',
    url: 'https://your-site.com/page-path',
    siteName: 'Site Name',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title',
    description: 'Description for Twitter',
    images: ['/og-image.png'],
  },
  robots: {
    index: true, // Set to false only for private/admin pages
    follow: true,
  },
};
```

### ✅ Root Layout Requirements

Every Next.js app must have these in `app/layout.tsx`:

```typescript
import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://your-site.com'), // Required for relative URLs
  title: {
    default: 'Site Name - Main Value Proposition',
    template: '%s | Site Name',
  },
  description: 'Compelling site description (150-160 chars)',
  // ... rest of metadata
};
```

### ✅ Semantic HTML Structure

Every page must use semantic HTML:

```tsx
// ✅ Good - Semantic structure
<main>
  <article>
    <header>
      <h1>Page Title</h1>
      <p>Page description</p>
    </header>
    <section>
      <h2>Section Title</h2>
      {/* Content */}
    </section>
  </article>
</main>

// ❌ Bad - Div soup
<div>
  <div>
    <div>Page Title</div>
  </div>
</div>
```

### ✅ Heading Hierarchy

- Only ONE `<h1>` per page (the main page title)
- Use `<h2>` for main sections
- Use `<h3>` for subsections
- Never skip heading levels (h1 → h3 is wrong, use h1 → h2 → h3)

### ✅ Image Optimization

All images must include:

```tsx
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Descriptive alt text that describes the image content"
  width={1200}
  height={630}
  priority={false} // Set true for above-the-fold images
/>
```

**Alt text rules:**
- Describe what the image shows or its purpose
- Include relevant keywords naturally
- Be concise but descriptive
- Never use "image of" or "picture of" (redundant)

### ✅ Dynamic Pages

For dynamic routes, use `generateMetadata`:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const item = await getItem(params.id);
  
  return {
    title: item.name,
    description: item.description,
    alternates: {
      canonical: `/items/${params.id}`,
    },
    openGraph: {
      title: item.name,
      description: item.description,
      images: [{ url: item.imageUrl, width: 1200, height: 630 }],
    },
  };
}
```

## Required Files Checklist

Every web app must have these files:

- [ ] `app/layout.tsx` - Root metadata with `metadataBase`
- [ ] `app/sitemap.ts` - Dynamic sitemap generation
- [ ] `app/robots.ts` - Robots.txt configuration
- [ ] `public/og-image.png` - 1200x630px OpenGraph image
- [ ] `public/favicon.ico` - Site favicon
- [ ] `public/apple-icon.png` - Apple touch icon (180x180px)

## Page Type Patterns

### Landing Page
```typescript
export const metadata: Metadata = {
  title: 'Site Name - Value Proposition',
  description: 'Compelling description of what your site does',
  openGraph: {
    type: 'website',
    // ... full OG tags
  },
};
```

### Blog Post / Article
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
  };
}
```

### Product Page
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);
  
  return {
    title: `${product.name} - Site Name`,
    description: product.description,
    openGraph: {
      type: 'product',
      images: [{ url: product.imageUrl }],
    },
  };
}
```

## Performance = SEO

These performance optimizations directly impact SEO:

1. **Use Next.js Image component** - Automatic optimization
2. **Set `priority={true}`** - For above-the-fold images
3. **Use Server Components** - Faster initial page load
4. **Implement proper caching** - Better Core Web Vitals scores
5. **Minimize JavaScript** - Use Server Components when possible

## Common Mistakes to Avoid

❌ **Missing canonical URLs** - Always set `alternates.canonical`
❌ **Duplicate titles** - Use title templates, not hardcoded titles
❌ **Missing OpenGraph images** - Every page needs OG image
❌ **No alt text on images** - All images need descriptive alt text
❌ **Poor heading hierarchy** - Only one h1, proper nesting
❌ **Missing metadataBase** - Required for relative URLs in metadata
❌ **Client-side only rendering** - Use Server Components for SEO pages

## Quick Reference

### When to Set `robots.index: false`
- Admin/dashboard pages
- Private user content
- Development/staging pages
- Pages with duplicate content

### Canonical URL Pattern
```typescript
alternates: {
  canonical: '/current-page-path', // Always absolute path from root
}
```

### OpenGraph Image Requirements
- Size: 1200x630px (1.91:1 ratio)
- Format: PNG or JPG
- File size: Under 1MB
- Location: `/public/og-image.png` or page-specific

## Integration with Existing Skills

This skill works alongside:
- `nextjs-seo` - Detailed SEO reference and troubleshooting
- `nextjs-shadcn` - UI component patterns that maintain SEO

For detailed metadata API reference, see `.cursor/skills/nextjs-seo/references/metadata-api.md`.

## Action Items

When building a new page:

1. ✅ Add complete metadata export
2. ✅ Include OpenGraph tags
3. ✅ Add Twitter card tags
4. ✅ Set canonical URL
5. ✅ Use semantic HTML (main, article, section, header)
6. ✅ Ensure proper heading hierarchy (one h1)
7. ✅ Add alt text to all images
8. ✅ Verify page is server-rendered (not client-only)
9. ✅ Test with [Google Rich Results Test](https://search.google.com/test/rich-results)
10. ✅ Check metadata with [OpenGraph Preview](https://www.opengraph.xyz/)
