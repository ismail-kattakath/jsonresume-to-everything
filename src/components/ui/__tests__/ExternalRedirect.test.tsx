import { render, screen } from '@testing-library/react'
import ExternalRedirect from '@/components/ui/ExternalRedirect'

// Mock DotLottieReact
jest.mock('@lottiefiles/dotlottie-react', () => ({
  DotLottieReact: () => <div data-testid="lottie-spinner" />,
}))

describe('ExternalRedirect', () => {
  it('should render spinner when url is provided', () => {
    render(<ExternalRedirect url="https://test.com" label="test page" />)
    expect(screen.getByTestId('lottie-spinner')).toBeInTheDocument()
  })

  it('should show spinner animation', () => {
    render(<ExternalRedirect url="https://test.com" label="test page" />)
    expect(screen.getByTestId('lottie-spinner')).toBeInTheDocument()
  })

  it('should display redirect spinner when provided', () => {
    render(<ExternalRedirect url="https://test.com" label="test page" />)
    expect(screen.getByTestId('lottie-spinner')).toBeInTheDocument()
  })

  it('should render error message when url is missing', () => {
    render(<ExternalRedirect url={undefined} label="test page" />)

    expect(screen.getByText('Test page not available')).toBeInTheDocument()
    expect(
      screen.getByText('Sorry, the test page could not be found.')
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Return Home' })).toHaveAttribute(
      'href',
      '/'
    )
  })

})
