import { render } from '@testing-library/react'
import CalendarPage from '@/app/calendar/page'

// Mock ExternalRedirect
jest.mock('@/components/ui/ExternalRedirect', () => ({
    __esModule: true,
    default: ({ label }: { label: string }) => <div data-testid="external-redirect">{label}</div>,
}))

describe('CalendarPage', () => {
    it('should render ExternalRedirect with correct label', () => {
        const { getByTestId, getByText } = render(<CalendarPage />)
        expect(getByTestId('external-redirect')).toBeInTheDocument()
        expect(getByText('calendar')).toBeInTheDocument()
    })
})
