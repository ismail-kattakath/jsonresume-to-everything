// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import NotFound from '@/app/not-found'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, transition, viewport, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, initial, animate, transition, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, initial, animate, transition, ...props }: any) => <h2 {...props}>{children}</h2>,
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
  MockLink.displayName = 'MockLink'
  return MockLink
})

// Mock Header component
jest.mock('@/components/layout/Header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>
  }
})

// Mock MainLayout component
jest.mock('@/components/layout/MainLayout', () => {
  const MockMainLayout = ({ children, ...props }: any) => {
    return (
      <div data-testid="mock-main-layout" {...props}>
        {children}
      </div>
    )
  }
  MockMainLayout.displayName = 'MockMainLayout'
  return MockMainLayout
})

describe('NotFound (404 Page)', () => {
  beforeEach(() => {
    // Mock window.history.back
    Object.defineProperty(window, 'history', {
      value: { back: jest.fn() },
      writable: true,
      configurable: true,
    })
  })

  it('renders 404 heading', () => {
    render(<NotFound />)
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders "Page Not Found" message', () => {
    render(<NotFound />)
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
  })

  it('renders "Go Home" link pointing to /', () => {
    render(<NotFound />)
    const goHomeLink = screen.getByText('Go Home')
    expect(goHomeLink.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders "Go Back" button', () => {
    render(<NotFound />)
    expect(screen.getByText('Go Back')).toBeInTheDocument()
  })

  it('calls window.history.back when "Go Back" is clicked', () => {
    render(<NotFound />)
    const goBackButton = screen.getByText('Go Back')
    fireEvent.click(goBackButton)
    expect(window.history.back).toHaveBeenCalled()
  })
})
