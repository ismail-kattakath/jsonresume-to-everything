import ExternalRedirect from '@/components/ui/ExternalRedirect'
import resumeData from '@/lib/resumeAdapter'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'

/**
 * Page component for the calendar view, redirects to external calendar.
 */
export default function CalendarPage() {
  return (
    <MainLayout>
      <Header />
      <ExternalRedirect url={resumeData.calendarLink} label="calendar" />
    </MainLayout>
  )
}
