import ExternalRedirect from '@/components/ui/ExternalRedirect'
import resumeData from '@/lib/resumeAdapter'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'

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
