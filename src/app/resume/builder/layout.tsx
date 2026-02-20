import type { Metadata } from 'next'
import { SITE_URL } from '@/config/site'
import resumeData from '@/lib/resumeAdapter'
import { StructuredData } from '@/components/seo/StructuredData'
import {
  resumeBuilderStructuredData,
  resumeBuilderBreadcrumbData,
  resumeBuilderFAQData,
} from '@/config/structured-data'

/**
 * SEO-optimized metadata for Resume Builder page
 * Respects character limits for all major social platforms:
 * - Title: 58 chars (optimal: 50-60)
 * - Description: 157 chars (optimal: 150-160)
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'AI Resume Builder - Tailor Resumes to Any Job Description',
  description:
    'Build JD-tailored ATS resumes with AI - from JSON Resume or start fresh. Real-time preview, AI assistance, and export options. Free resume builder tool.',
  keywords: [
    'AI resume builder',
    'resume maker',
    'CV builder',
    'cover letter generator',
    'ATS resume',
    'professional resume',
    'resume template',
    'AI-powered resume',
    'online resume builder',
    'free resume builder',
    'resume creator',
    'job application',
  ],
  authors: [{ name: resumeData.name }],
  creator: resumeData.name,
  publisher: resumeData.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: `${SITE_URL}/resume/builder`,
    siteName: `${resumeData.name} - AI Resume Builder`,
    title: 'AI Resume Builder - Tailor Resumes to Any Job Description',
    description:
      'Build JD-tailored ATS resumes with AI - from JSON Resume or start fresh. Real-time preview, AI assistance, and easy export.',
    images: [
      {
        url: `${SITE_URL}/resume/builder/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'AI Resume Builder - Build JD-Tailored ATS Resumes with AI',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Resume Builder - Tailor Resumes to Any Job Description',
    description:
      'Build JD-tailored ATS resumes with AI - from JSON Resume or start fresh. Real-time preview and export options.',
    images: [`${SITE_URL}/resume/builder/twitter-image`],
    creator:
      '@' +
      (resumeData.socialMedia
        .find((s) => s.socialMedia === 'LinkedIn')
        ?.link.split('/')
        .pop() || 'resume_builder'),
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: `${SITE_URL}/resume/builder`,
  },
  verification: {
    google: 'google-site-verification-token', // Replace with actual token if available
  },
}

/**
 * Layout component for the AI Resume Builder interface.
 */
export default function ResumeBuilderLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StructuredData data={resumeBuilderStructuredData} />
      <StructuredData data={resumeBuilderBreadcrumbData} />
      <StructuredData data={resumeBuilderFAQData} />
      {children}
    </>
  )
}
