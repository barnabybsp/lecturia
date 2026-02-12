import type React from "react"
import type { Metadata, Viewport } from "next"

import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import DevToolbar from "@/components/DevToolbar"
import "./globals.css"

import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'

// Initialize fonts - distinctive typography for academic platform
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

// Viewport config — controls how the page scales on mobile devices
// and sets the browser theme color for the address bar
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1225' },
  ],
}

// Root metadata — these are the site-wide SEO defaults.
// Individual pages can override any of these values.
// The title.template means child pages only need to set their own title
// and it'll automatically append " | Lecturia" at the end.
export const metadata: Metadata = {
  metadataBase: new URL('https://lecturia.dev'),
  title: {
    default: 'Lecturia - AI-Powered Learning From Your Course Materials',
    template: '%s | Lecturia',
  },
  description:
    'Upload lecture notes, textbooks, and slides. Students chat with AI that answers questions using your course materials. Study smarter with Lecturia.',
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
  openGraph: {
    siteName: 'Lecturia',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lecturia - AI-Powered Learning From Your Course Materials',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${plusJakarta.variable} ${fraunces.variable}`}>
        {children}
        <Toaster />
        <Analytics />
        <DevToolbar />
      </body>
    </html>
  )
}
