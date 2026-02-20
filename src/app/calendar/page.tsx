import ExternalRedirect from '@/components/ui/external-redirect'
import resumeData from '@/lib/resume-adapter'
import MainLayout from '@/components/layout/main-layout'
import { Header } from '@/components/layout/header'

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
