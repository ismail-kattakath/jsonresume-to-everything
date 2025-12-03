import resumeData from '@/lib/resumeAdapter'
import { SITE_URL } from '@/config/site'
import type { Metadata } from 'next'

/**
 * Generate metadata from resumeData
 * Single source of truth for all site metadata
 */
export function generateSiteMetadata(): Metadata {
  const { name, position, summary, socialMedia } = resumeData

  // Find LinkedIn handle for Twitter creator field
  const linkedInProfile = socialMedia.find(
    (sm) => sm.socialMedia === 'LinkedIn'
  )
  const linkedInHandle = linkedInProfile?.link.replace('linkedin.com/in/', '')

  // OG title: "Name - Position"
  const siteTitle =
    name && position ? `${name} - ${position}` : name || 'Portfolio'

  // OG description: First sentence from summary (55-200 chars)
  let siteDescription = 'Professional Portfolio'

  if (summary) {
    // Extract first sentence from summary
    const firstSentence = summary.split(/[.!?]/)[0]?.trim()
    if (firstSentence) {
      siteDescription = firstSentence

      // Ensure 55-200 character requirement
      if (siteDescription.length < 55) {
        // If too short, try adding second sentence
        const sentences = summary.split(/[.!?]/).filter((s) => s.trim())
        if (sentences.length > 1) {
          siteDescription = `${sentences[0].trim()}. ${sentences[1].trim()}`
        }
      }

      // Truncate if too long
      if (siteDescription.length > 200) {
        siteDescription = siteDescription.substring(0, 197) + '...'
      }
    }
  }

  // Generate keywords from position and skills
  const generateKeywords = (): string => {
    const keywordSet = new Set<string>()

    // Add position title components
    if (position) {
      position.split(/[|,]/).forEach((part) => {
        keywordSet.add(part.trim())
      })
    }

    // Priority skills to include (curated from skills array)
    const prioritySkills = [
      'Generative AI',
      'AI/ML',
      'LLM',
      'RAG Systems',
      'vLLM',
      'Kubernetes',
      'Docker',
      'Cloud Architecture',
      'OAuth 2.0',
      'SAML 2.0',
      'SSO',
      'Authentication',
      'CI/CD',
      'DevOps',
      'Terraform',
      'Node.js',
      'Next.js',
      'ReactJS',
      'TypeScript',
      'Python',
      'MongoDB',
      'PostgreSQL',
      'AWS',
      'Google Cloud',
      'GCP',
      'GKE',
      'Microservices',
      'RESTful APIs',
      'Technical Leadership',
      'Software Engineering',
    ]

    prioritySkills.forEach((skill) => keywordSet.add(skill))

    return Array.from(keywordSet).join(', ')
  }

  const siteKeywords = generateKeywords()

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteTitle,
      template: `%s | ${name}`,
    },
    description: siteDescription,
    keywords: siteKeywords,
    authors: [{ name }],
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      url: SITE_URL,
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
    // PWA Configuration
    manifest: '/favicon/site.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'AI Resume Builder',
    },
    formatDetection: {
      telephone: false,
    },
    // Google Search Console verification handled via DNS (Domain name provider method)
    // No meta tag needed
  }
}
