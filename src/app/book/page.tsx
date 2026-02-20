import ExternalRedirect from '@/components/ui/external-redirect'
import resumeData from '@/lib/resume-adapter'
import MainLayout from '@/components/layout/main-layout'
import Header from '@/components/layout/header'

/**
 * Page component for booking meetings, redirects to external calendar.
 */
export default function BookPage() {
  return (
    <MainLayout>
      <Header />
      <ExternalRedirect url={resumeData.calendarLink} label="booking page" />
    </MainLayout>
  )
}
