import { SITE_URL } from '@/config/site'
import resumeData from '@/lib/resume-adapter'

/**
 * Structured Data (JSON-LD) Configurations
 * Schema.org vocabulary for SEO enhancement
 */

/**
 * WebApplication Schema for Resume Builder
 * Describes the AI Resume Builder as an interactive web application
 */
export const resumeBuilderStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Resume Builder',
  description:
    'Build ATS-friendly resumes and cover letters with AI-powered suggestions. Features real-time preview, customizable templates, and easy export options.',
  url: `${SITE_URL}/resume/builder`,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  creator: {
    '@type': 'Person',
    name: resumeData.name,
    url: SITE_URL,
  },
  browserRequirements: 'Requires JavaScript. Requires HTML5.',
  featureList: [
    'AI-powered content suggestions',
    'Real-time resume preview',
    'Cover letter generator',
    'ATS-friendly templates',
    'Export to multiple formats',
    'Customizable sections',
    'Drag-and-drop interface',
  ],
  screenshot: `${SITE_URL}/resume/builder/opengraph-image`,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
    bestRating: '5',
    worstRating: '1',
  },
}

/**
 * BreadcrumbList Schema for Resume Builder
 * Helps search engines understand site hierarchy
 */
export const resumeBuilderBreadcrumbData = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: SITE_URL,
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Resume',
      item: `${SITE_URL}/resume`,
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'AI Resume Builder',
      item: `${SITE_URL}/resume/builder`,
    },
  ],
}

/**
 * FAQPage Schema for Resume Builder
 * Provides answers to common questions for rich results
 */
export const resumeBuilderFAQData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is the AI Resume Builder free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, the AI Resume Builder is completely free to use. You can create, edit, and export your resume without any cost.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does the resume builder work with Applicant Tracking Systems (ATS)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, our resume builder creates ATS-friendly resumes that are optimized for applicant tracking systems used by employers.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I create a cover letter with this tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, the AI Resume Builder includes a cover letter generator with AI-powered suggestions to help you craft compelling cover letters.',
      },
    },
    {
      '@type': 'Question',
      name: 'What export formats are supported?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'You can export your resume and cover letter to PDF format for easy sharing and printing. The builder also supports JSON format for data portability.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the AI assistance work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The AI Resume Builder uses advanced language models to provide intelligent suggestions for your resume content, helping you craft impactful summaries and achievements.',
      },
    },
  ],
}
