import { render } from '@testing-library/react'
import ResumeLayout, { metadata } from '@/app/resume/layout'

describe('ResumeLayout', () => {
  describe('Metadata', () => {
    it('should export correct metadata', () => {
      expect(metadata).toBeDefined()
      expect(metadata.title).toBe('Download Resume')
      expect(metadata.description).toBe('Print my latest resume in PDF')
    })

    it('should include Open Graph metadata', () => {
      expect(metadata.openGraph).toBeDefined()
      expect(metadata.openGraph).toEqual({
        title: 'Download Resume',
        description: 'Print my latest resume in PDF',
        type: 'website',
        url: expect.stringContaining('/resume'),
      })
    })

    it('should include Twitter metadata', () => {
      expect(metadata.twitter).toBeDefined()
      expect(metadata.twitter).toEqual({
        card: 'summary',
        title: 'Download Resume',
        description: 'Print my latest resume in PDF',
      })
    })
  })

  describe('Component Rendering', () => {
    it('should render children content', () => {
      const { container } = render(
        <ResumeLayout>
          <div data-testid="test-child">Test Content</div>
        </ResumeLayout>
      )

      expect(container.querySelector('[data-testid="test-child"]')).toBeInTheDocument()
    })

    it('should render children in React fragment', () => {
      const { container } = render(
        <ResumeLayout>
          <div>Child 1</div>
          <div>Child 2</div>
        </ResumeLayout>
      )

      expect(container.textContent).toContain('Child 1')
      expect(container.textContent).toContain('Child 2')
    })
  })
})
