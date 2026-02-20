import { render, screen } from '@testing-library/react'
import MainLayout from '@/components/layout/main-layout'

// Mock the Footer component
jest.mock('@/components/layout/footer', () => {
  return function MockFooter() {
    return <footer data-testid="mock-footer">Footer</footer>
  }
})

describe('MainLayout', () => {
  it('renders children correctly', () => {
    render(
      <MainLayout>
        <main data-testid="main-content">Main Content</main>
      </MainLayout>
    )

    expect(screen.getByTestId('main-content')).toBeInTheDocument()
    expect(screen.getByText('Main Content')).toBeInTheDocument()
  })

  it('renders Footer by default', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    )

    expect(screen.getByTestId('mock-footer')).toBeInTheDocument()
  })

  it('hides Footer when showFooter is false', () => {
    render(
      <MainLayout showFooter={false}>
        <div>Content</div>
      </MainLayout>
    )

    expect(screen.queryByTestId('mock-footer')).not.toBeInTheDocument()
  })

  it('applies default className when not provided', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('min-h-screen')
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <MainLayout className="custom-class another-class">
        <div>Content</div>
      </MainLayout>
    )

    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('custom-class')
    expect(wrapper).toHaveClass('another-class')
  })

  it('wraps Footer in exclude-print div when excludeFooterFromPrint is true', () => {
    const { container } = render(
      <MainLayout excludeFooterFromPrint>
        <div>Content</div>
      </MainLayout>
    )

    const footer = screen.getByTestId('mock-footer')
    const footerWrapper = footer.parentElement
    expect(footerWrapper).toHaveClass('exclude-print')
  })

  it('does not wrap Footer in exclude-print div by default', () => {
    const { container } = render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    )

    const footer = screen.getByTestId('mock-footer')
    // Footer should be a direct child of the MainLayout wrapper div (no intermediate wrapper)
    const mainLayoutWrapper = container.firstChild as HTMLElement
    expect(mainLayoutWrapper).toContainElement(footer)
    // The footer's parent should be the main wrapper, not an exclude-print div
    expect(footer.parentElement).toBe(mainLayoutWrapper)
  })

  it('does not render print wrapper when showFooter is false', () => {
    const { container } = render(
      <MainLayout showFooter={false} excludeFooterFromPrint>
        <div>Content</div>
      </MainLayout>
    )

    expect(screen.queryByTestId('mock-footer')).not.toBeInTheDocument()
    // Ensure no extra wrapper is created
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.children).toHaveLength(1) // Only the content div
  })

  it('renders multiple children correctly', () => {
    render(
      <MainLayout>
        <header data-testid="header">Header</header>
        <main data-testid="main">Main</main>
        <aside data-testid="sidebar">Sidebar</aside>
      </MainLayout>
    )

    expect(screen.getByTestId('header')).toBeInTheDocument()
    expect(screen.getByTestId('main')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument()
  })

  it('combines showFooter=true with excludeFooterFromPrint=true', () => {
    render(
      <MainLayout showFooter={true} excludeFooterFromPrint={true}>
        <div>Content</div>
      </MainLayout>
    )

    const footer = screen.getByTestId('mock-footer')
    expect(footer).toBeInTheDocument()
    expect(footer.parentElement).toHaveClass('exclude-print')
  })

  it('handles showFooter=true with excludeFooterFromPrint=false', () => {
    const { container } = render(
      <MainLayout showFooter={true} excludeFooterFromPrint={false}>
        <div>Content</div>
      </MainLayout>
    )

    const footer = screen.getByTestId('mock-footer')
    const mainLayoutWrapper = container.firstChild as HTMLElement
    expect(footer).toBeInTheDocument()
    // Footer should be direct child of wrapper (no exclude-print div)
    expect(footer.parentElement).toBe(mainLayoutWrapper)
  })
})
