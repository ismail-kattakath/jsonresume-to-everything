import DefaultResumeData from '@/components/resume-builder/utility/DefaultResumeData'
import type { Metadata } from 'next'

/**
 * Generate metadata from DefaultResumeData
 * Single source of truth for all site metadata
 */
export function generateSiteMetadata(): Metadata {
  const { name, position, summary, socialMedia } = DefaultResumeData

  // Find LinkedIn handle for Twitter creator field
  const linkedInProfile = socialMedia.find(
    (sm) => sm.socialMedia === 'LinkedIn'
  )
  const linkedInHandle = linkedInProfile?.link.replace('linkedin.com/in/', '')

  // Use name as title with fallback
  const siteTitle = name || 'Portfolio'

  // Generate description meeting 55-200 char requirement
  let siteDescription = position || 'Professional Portfolio'

  // If description is too short, append from summary
  if (siteDescription.length < 55 && summary) {
    // Extract first sentence from summary
    const firstSentence = summary.split(/[.!?]/)[0]?.trim()
    if (firstSentence) {
      // Combine position with summary until we reach ~150 chars
      siteDescription = `${position} - ${firstSentence}`
      // Truncate if too long
      if (siteDescription.length > 200) {
        siteDescription = siteDescription.substring(0, 197) + '...'
      }
    }
  }

  return {
    metadataBase: new URL('https://ismail.kattakath.com'),
    title: {
      default: siteTitle,
      template: `%s | ${name}`,
    },
    description: siteDescription,
    keywords:
      'Principal Software Engineer, Technical Leader, Full Stack, AI/ML, OAuth, SSO, CI/CD, Kubernetes, MCP Gateways, RAG Systems, GenAI, Machine Learning, Cloud Architecture',
    authors: [{ name }],
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: 'https://ismail.kattakath.com',
      siteName: name,
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      creator: linkedInHandle ? `@${linkedInHandle}` : undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
  }
}
