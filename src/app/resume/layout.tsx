import type { Metadata } from 'next'
import { SITE_URL } from '@/config/site'

const TITLE = 'Download Resume'
const DESCRIPTION = 'Print my latest resume in PDF'
const URL = `${SITE_URL}/resume`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: URL,
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
}

/**
 * Layout component for the resume download/preview page.
 */
export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
