import { render, screen } from '@testing-library/react'
import RootLayout, { metadata } from '@/app/layout'

// Mock BackgroundImage component
jest.mock('@/components/BackgroundImage', () => {
  return function MockBackgroundImage({
    withBlur,
    withOverlay,
  }: {
    withBlur?: boolean
    withOverlay?: boolean
  }) {
    return (
      <div
        data-testid="background-image"
        data-with-blur={withBlur}
        data-with-overlay={withOverlay}
      >
        Background
      </div>
    )
  }
})

// Mock metadata generation
jest.mock('@/config/metadata', () => ({
  generateSiteMetadata: jest.fn(() => ({
    title: 'Test Portfolio',
    description: 'Test Description',
  })),
}))

// No mock needed for Html/Body here if they aren't used

describe('RootLayout', () => {
  it('should render children inside body', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('should render BackgroundImage component with correct props', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    )

    const bg = screen.getByTestId('background-image')
    expect(bg).toBeInTheDocument()
    expect(bg).toHaveAttribute('data-with-blur', 'true')
    expect(bg).toHaveAttribute('data-with-overlay', 'true')
  })

  it('should have html element with lang attribute', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    )

    // Check that html element exists in the document with lang attribute
    const html = document.documentElement
    expect(html).toHaveAttribute('lang', 'en')
  })

  it('should include favicon link in head', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    )

    const head = document.querySelector('head')
    const faviconLink = head?.querySelector('link[rel="icon"]')
    expect(faviconLink).toHaveAttribute('href', '/favicon/favicon.png')
    expect(faviconLink).toHaveAttribute('type', 'image/png')
  })

  it('should include apple-touch-icon link in head', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    )

    const head = document.querySelector('head')
    const appleTouchIcon = head?.querySelector('link[rel="apple-touch-icon"]')
    expect(appleTouchIcon).toHaveAttribute(
      'href',
      '/favicon/apple-touch-icon.png'
    )
  })

  it('should include manifest link in head', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    )

    const head = document.querySelector('head')
    const manifest = head?.querySelector('link[rel="manifest"]')
    expect(manifest).toHaveAttribute('href', '/favicon/site.webmanifest')
  })

  it('should apply antialiased to body', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    )

    const body = document.body
    expect(body).toHaveClass('antialiased')
    // System fonts are used, no custom font variables needed
  })

  it('should apply minHeight style to body', () => {
    render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    )

    const body = document.body
    expect(body).toHaveStyle({ minHeight: '100vh' })
  })

  it('should render multiple children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </RootLayout>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
  })
})

describe('RootLayout Metadata', () => {
  it('should export metadata object', () => {
    expect(metadata).toBeDefined()
    expect(typeof metadata).toBe('object')
  })

  it('should have title from generateSiteMetadata', () => {
    expect(metadata.title).toBe('Test Portfolio')
  })

  it('should have description from generateSiteMetadata', () => {
    expect(metadata.description).toBe('Test Description')
  })
})
