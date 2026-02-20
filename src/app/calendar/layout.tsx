import type { Metadata } from 'next'
import { SITE_URL } from '@/config/site'

const TITLE = 'Book Meeting'
const DESCRIPTION = "Let's discuss how we can work together."
const URL = `${SITE_URL}/calendar`

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
 * Layout component for the calendar page.
 */
export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return children
}
