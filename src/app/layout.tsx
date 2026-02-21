import type { Metadata } from 'next'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'
import BackgroundImage from '@/components/background-image'
import { generateSiteMetadata } from '@/config/metadata'
import { FramerMotionProvider } from '@/components/providers/framer-motion-provider'

// Generate metadata from resumeData (single source of truth)
export const metadata: Metadata = generateSiteMetadata()

/**
 * Root layout component for the entire application, providing global styles and structure.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#1a182a" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#1a182a" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#1a182a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Resume Builder" />
        <link rel="icon" href="/favicon/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body
        className="antialiased"
        style={{
          minHeight: '100vh',
        }}
      >
        <FramerMotionProvider>
          <BackgroundImage withBlur withOverlay />
          {children}
        </FramerMotionProvider>
        {process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID'] && (
          <GoogleAnalytics gaId={process.env['NEXT_PUBLIC_GA_MEASUREMENT_ID']} />
        )}
      </body>
    </html>
  )
}
