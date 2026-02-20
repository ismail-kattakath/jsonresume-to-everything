import { render } from '@testing-library/react'
import BookPage from '@/app/book/page'

// Mock ExternalRedirect
jest.mock('@/components/ui/external-redirect', () => ({
  __esModule: true,
  default: ({ label }: { label: string }) => <div data-testid="external-redirect">{label}</div>,
}))

describe('BookPage', () => {
  it('should render ExternalRedirect with correct label', () => {
    const { getByTestId, getByText } = render(<BookPage />)
    expect(getByTestId('external-redirect')).toBeInTheDocument()
    expect(getByText('booking page')).toBeInTheDocument()
  })
})
