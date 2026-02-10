import ExternalRedirect from '@/components/ui/ExternalRedirect'
import resumeData from '@/lib/resumeAdapter'
import MainLayout from '@/components/layout/MainLayout'
import Header from '@/components/layout/Header'

export default function CalendarPage() {
    return (
        <MainLayout>
            <Header />
            <ExternalRedirect url={resumeData.calendarLink} label="calendar" />
        </MainLayout>
    )
}
