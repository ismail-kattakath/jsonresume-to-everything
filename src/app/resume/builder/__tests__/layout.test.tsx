import { render } from '@testing-library/react'
import type { Metadata } from 'next'
import ResumeBuilderLayout, { metadata } from '@/app/resume/builder/layout'

// Mock dependencies
jest.mock('@/config/site', () => ({
  SITE_URL: 'https://test.example.com',
}))

jest.mock('@/lib/resume-adapter', () => ({
  __esModule: true,
  default: {
    name: 'Test User',
    position: 'Software Engineer',
    socialMedia: [
      {
        socialMedia: 'LinkedIn',
        link: 'linkedin.com/in/testuser',
      },
    ],
  },
}))

jest.mock('@/components/seo/structured-data', () => ({
  StructuredData: ({ data }: { data: object }) => (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  ),
}))

jest.mock('@/config/structured-data', () => ({
  resumeBuilderStructuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Resume Builder',
  },
  resumeBuilderBreadcrumbData: {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
  },
  resumeBuilderFAQData: {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
  },
}))

describe('Resume Builder Layout', () => {
  describe('Metadata Configuration', () => {
    it('should have SEO-optimized title within character limits', () => {
      const title = (metadata.title as string) || ''
      expect(title).toBe('AI Resume Builder - Tailor Resumes to Any Job Description')
      expect(title.length).toBeLessThanOrEqual(60)
    })

    it('should have description within optimal character limits', () => {
      const description = (metadata.description as string) || ''
      expect(description).toBeDefined()
      expect(description.length).toBeGreaterThanOrEqual(150)
      expect(description.length).toBeLessThanOrEqual(160)
    })

    it('should include relevant SEO keywords', () => {
      const keywords = (metadata.keywords as string[]) || []
      expect(keywords).toContain('AI resume builder')
      expect(keywords).toContain('ATS resume')
      expect(keywords).toContain('cover letter generator')
      expect(keywords.length).toBeGreaterThan(5)
    })

    it('should have metadataBase configured', () => {
      expect(metadata.metadataBase?.toString()).toEqual('https://test.example.com/')
    })

    it('should have authors configured', () => {
      expect(metadata.authors).toEqual([{ name: 'Test User' }])
    })

    it('should have creator and publisher set', () => {
      expect(metadata.creator).toBe('Test User')
      expect(metadata.publisher).toBe('Test User')
    })
  })

  describe('OpenGraph Metadata', () => {
    it('should have proper OpenGraph configuration', () => {
      expect(metadata.openGraph).toBeDefined()
      // Use cast to bypass complex type issues in tests while avoiding 'any'
      const og = metadata.openGraph as Record<string, unknown>
      expect(og['type']).toBe('website')
      expect(og['locale']).toBe('en_US')
      expect(og['url']?.toString()).toBe('https://test.example.com/resume/builder')
    })

    it('should have OpenGraph title within character limits', () => {
      const ogTitle = (metadata.openGraph?.title as string) || ''
      expect(ogTitle).toBe('AI Resume Builder - Tailor Resumes to Any Job Description')
      expect(ogTitle.length).toBeLessThanOrEqual(60)
    })

    it('should have OpenGraph description within character limits', () => {
      const ogDescription = (metadata.openGraph?.description as string) || ''
      expect(ogDescription).toBeDefined()
      expect(ogDescription.length).toBeLessThanOrEqual(200)
    })

    it('should have OpenGraph images configured', () => {
      const images =
        (metadata.openGraph?.images as unknown as { url: string; width: number; height: number; type: string }[]) || []
      expect(images).toHaveLength(1)
      expect(images[0]?.url).toBe('https://test.example.com/resume/builder/opengraph-image')
      expect(images[0]?.width).toBe(1200)
      expect(images[0]?.height).toBe(630)
      expect(images[0]?.type).toBe('image/png')
    })
  })

  describe('Twitter Card Metadata', () => {
    it('should have Twitter card type configured', () => {
      const twitter = metadata.twitter as Record<string, unknown>
      expect(twitter['card']).toBe('summary_large_image')
    })

    it('should have Twitter title within character limits', () => {
      const twitterTitle = (metadata.twitter?.title as string) || ''
      expect(twitterTitle).toBeDefined()
      expect(twitterTitle.length).toBeLessThanOrEqual(70)
    })

    it('should have Twitter description within character limits', () => {
      const twitterDescription = (metadata.twitter?.description as string) || ''
      expect(twitterDescription).toBeDefined()
      expect(twitterDescription.length).toBeLessThanOrEqual(200)
    })

    it('should have Twitter images configured', () => {
      const images = (metadata.twitter?.images as string[]) || []
      expect(images).toHaveLength(1)
      expect(images[0]).toBe('https://test.example.com/resume/builder/twitter-image')
    })
  })

  describe('Robots and Indexing', () => {
    it('should allow indexing and following', () => {
      const robots = metadata.robots as Record<string, unknown>
      expect(robots['index']).toBe(true)
      expect(robots['follow']).toBe(true)
      expect(robots['nocache']).toBe(false)
    })

    it('should have GoogleBot configuration', () => {
      const robots = metadata.robots as Record<string, Record<string, unknown>>
      expect(robots['googleBot']?.['index']).toBe(true)
      expect(robots['googleBot']?.['follow']).toBe(true)
      expect(robots['googleBot']?.['max-image-preview']).toBe('large')
    })
  })

  describe('Canonical URL', () => {
    it('should have canonical URL configured', () => {
      expect(metadata.alternates?.canonical).toBe('https://test.example.com/resume/builder')
    })
  })

  describe('Layout Component', () => {
    it('should render children', () => {
      const { getByText } = render(
        <ResumeBuilderLayout>
          <div>Test Content</div>
        </ResumeBuilderLayout>
      )
      expect(getByText('Test Content')).toBeInTheDocument()
    })

    it('should include structured data scripts', () => {
      const { container } = render(
        <ResumeBuilderLayout>
          <div>Test</div>
        </ResumeBuilderLayout>
      )
      const scripts = container.querySelectorAll('script[type="application/ld+json"]')
      expect(scripts.length).toBe(3) // WebApplication, Breadcrumb, FAQ
    })
  })
})
