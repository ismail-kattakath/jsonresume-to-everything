import { render } from '@testing-library/react'
import BookLayout, { metadata } from '@/app/book/layout'

describe('BookLayout', () => {
  describe('Metadata', () => {
    it('should export correct metadata', () => {
      expect(metadata).toBeDefined()
      expect(metadata.title).toBe('Book Meeting')
      expect(metadata.description).toBe("Let's discuss how we can work together.")
    })

    it('should include Open Graph metadata', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph).toEqual({
        title: 'Book Meeting',
        description: "Let's discuss how we can work together.",
        type: 'website',
        url: expect.stringContaining('/book'),
      })
    })

    it('should include Twitter metadata', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter).toEqual({
        card: 'summary',
        title: 'Book Meeting',
        description: "Let's discuss how we can work together.",
      })
    })
  })

  describe('Component Rendering', () => {
    it('should render children content', () => {
      const { container } = render(
        <BookLayout>
          <div data-testid="test-child">Test Content</div>
        </BookLayout>
      )

      expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument()
    })

    it('should not wrap children in additional elements', () => {
      const { container } = render(
        <BookLayout>
          <div>Direct Child</div>
        </BookLayout>
      )

      const firstChild = container.firstChild
      expect(firstChild).toBeInstanceOf(HTMLDivElement)
      expect(firstChild?.textContent).toBe('Direct Child')
    })
  })
})
