// @ts-nocheck
import {
  resumeBuilderStructuredData,
  resumeBuilderBreadcrumbData,
  resumeBuilderFAQData,
} from '@/config/structured-data'

// Mock SITE_URL
jest.mock('@/config/site', () => ({
  SITE_URL: 'https://test.example.com',
}))

// Mock resumeAdapter
jest.mock('@/lib/resumeAdapter', () => ({
  __esModule: true,
  default: {
    name: 'Test User',
    position: 'Software Engineer',
  },
}))

describe('Structured Data Configurations', () => {
  describe('resumeBuilderStructuredData', () => {
    it('should have WebApplication schema type', () => {
      expect(resumeBuilderStructuredData['@context']).toBe('https://schema.org')
      expect(resumeBuilderStructuredData['@type']).toBe('WebApplication')
    })

    it('should have correct name and description', () => {
      expect(resumeBuilderStructuredData.name).toBe('AI Resume Builder')
      expect(resumeBuilderStructuredData.description).toContain('ATS-friendly')
      expect(resumeBuilderStructuredData.description).toContain('AI-powered')
    })

    it('should have correct URL', () => {
      expect(resumeBuilderStructuredData.url).toBe(
        'https://test.example.com/resume/builder'
      )
    })

    it('should have BusinessApplication category', () => {
      expect(resumeBuilderStructuredData.applicationCategory).toBe(
        'BusinessApplication'
      )
    })

    it('should have Any operating system', () => {
      expect(resumeBuilderStructuredData.operatingSystem).toBe('Any')
    })

    it('should have free offer', () => {
      expect(resumeBuilderStructuredData.offers).toEqual({
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      })
    })

    it('should have creator information', () => {
      expect(resumeBuilderStructuredData.creator).toEqual({
        '@type': 'Person',
        name: 'Test User',
        url: 'https://test.example.com',
      })
    })

    it('should have browser requirements', () => {
      expect(resumeBuilderStructuredData.browserRequirements).toContain(
        'JavaScript'
      )
      expect(resumeBuilderStructuredData.browserRequirements).toContain('HTML5')
    })

    it('should have comprehensive feature list', () => {
      const features = resumeBuilderStructuredData.featureList
      expect(features).toContain('AI-powered content suggestions')
      expect(features).toContain('Real-time resume preview')
      expect(features).toContain('Cover letter generator')
      expect(features).toContain('ATS-friendly templates')
      expect(features).toContain('Export to multiple formats')
      expect(features.length).toBeGreaterThan(5)
    })

    it('should have screenshot URL', () => {
      expect(resumeBuilderStructuredData.screenshot).toBe(
        'https://test.example.com/resume/builder/opengraph-image'
      )
    })

    it('should have aggregate rating', () => {
      expect(resumeBuilderStructuredData.aggregateRating).toEqual({
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
        bestRating: '5',
        worstRating: '1',
      })
    })
  })

  describe('resumeBuilderBreadcrumbData', () => {
    it('should have BreadcrumbList schema type', () => {
      expect(resumeBuilderBreadcrumbData['@context']).toBe('https://schema.org')
      expect(resumeBuilderBreadcrumbData['@type']).toBe('BreadcrumbList')
    })

    it('should have three breadcrumb levels', () => {
      expect(resumeBuilderBreadcrumbData.itemListElement).toHaveLength(3)
    })

    it('should have correct breadcrumb hierarchy', () => {
      const items = resumeBuilderBreadcrumbData.itemListElement

      expect(items[0]).toEqual({
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://test.example.com',
      })

      expect(items[1]).toEqual({
        '@type': 'ListItem',
        position: 2,
        name: 'Resume',
        item: 'https://test.example.com/resume',
      })

      expect(items[2]).toEqual({
        '@type': 'ListItem',
        position: 3,
        name: 'AI Resume Builder',
        item: 'https://test.example.com/resume/builder',
      })
    })
  })

  describe('resumeBuilderFAQData', () => {
    it('should have FAQPage schema type', () => {
      expect(resumeBuilderFAQData['@context']).toBe('https://schema.org')
      expect(resumeBuilderFAQData['@type']).toBe('FAQPage')
    })

    it('should have multiple FAQ entries', () => {
      expect(resumeBuilderFAQData.mainEntity.length).toBeGreaterThan(3)
    })

    it('should have properly structured Question entities', () => {
      const firstQuestion = resumeBuilderFAQData.mainEntity[0]
      expect(firstQuestion['@type']).toBe('Question')
      expect(firstQuestion.name).toBeDefined()
      expect(firstQuestion.acceptedAnswer).toBeDefined()
      expect(firstQuestion.acceptedAnswer['@type']).toBe('Answer')
      expect(firstQuestion.acceptedAnswer.text).toBeDefined()
    })

    it('should include question about pricing', () => {
      const pricingQuestion = resumeBuilderFAQData.mainEntity.find((q) =>
        q.name.toLowerCase().includes('free')
      )
      expect(pricingQuestion).toBeDefined()
      expect(pricingQuestion?.acceptedAnswer.text).toContain('free')
    })

    it('should include question about ATS compatibility', () => {
      const atsQuestion = resumeBuilderFAQData.mainEntity.find((q) =>
        q.name.toLowerCase().includes('ats')
      )
      expect(atsQuestion).toBeDefined()
      expect(atsQuestion?.acceptedAnswer.text).toContain('ATS')
    })

    it('should include question about cover letter', () => {
      const coverLetterQuestion = resumeBuilderFAQData.mainEntity.find((q) =>
        q.name.toLowerCase().includes('cover letter')
      )
      expect(coverLetterQuestion).toBeDefined()
    })

    it('should include question about export formats', () => {
      const exportQuestion = resumeBuilderFAQData.mainEntity.find((q) =>
        q.name.toLowerCase().includes('export')
      )
      expect(exportQuestion).toBeDefined()
      expect(exportQuestion?.acceptedAnswer.text).toContain('PDF')
    })

    it('should include question about AI assistance', () => {
      const aiQuestion = resumeBuilderFAQData.mainEntity.find((q) =>
        q.name.toLowerCase().includes('ai')
      )
      expect(aiQuestion).toBeDefined()
    })
  })
})
