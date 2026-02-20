import { generateSiteMetadata } from '@/config/metadata'
import resumeData from '@/lib/resumeAdapter'
import { SITE_URL } from '@/config/site'

// Mock the resume adapter
jest.mock('@/lib/resumeAdapter', () => ({
  __esModule: true,
  default: {
    name: 'John Doe',
    position: 'Senior Software Engineer | Technical Lead',
    summary:
      'Experienced software engineer with 10 years in full-stack development. Led teams of 5+ engineers on enterprise projects. Specialized in cloud architecture and scalable systems.',
    socialMedia: [
      { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
      { socialMedia: 'GitHub', link: 'github.com/johndoe' },
    ],
    email: 'john@example.com',
    phone: '',
    location: '',
    website: '',
    workExperience: [],
    education: [],
    skillGroups: [],
    projects: [],
    certifications: [],
    languages: [],
  },
}))

describe('generateSiteMetadata', () => {
  describe('Site Title Generation', () => {
    it('should generate title from name and position', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.title).toEqual({
        default: 'John Doe - Senior Software Engineer | Technical Lead',
        template: '%s | John Doe',
      })
    })

    it('should use only name if position is missing', () => {
      const mockData = {
        ...resumeData,
        position: '',
      }

      jest.mocked(resumeData).position = ''

      const metadata = generateSiteMetadata()

      expect(metadata.title).toEqual({
        default: 'John Doe',
        template: '%s | John Doe',
      })

      // Restore
      jest.mocked(resumeData).position = 'Senior Software Engineer | Technical Lead'
    })

    it('should fallback to "Portfolio" if both name and position are missing', () => {
      jest.mocked(resumeData).name = ''
      jest.mocked(resumeData).position = ''

      const metadata = generateSiteMetadata()

      expect(metadata.title).toHaveProperty('default', 'Portfolio')

      // Restore
      jest.mocked(resumeData).name = 'John Doe'
      jest.mocked(resumeData).position = 'Senior Software Engineer | Technical Lead'
    })
  })

  describe('Site Description Generation', () => {
    it('should use first sentence from summary', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.description).toBe('Experienced software engineer with 10 years in full-stack development')
    })

    it('should add second sentence if first is too short', () => {
      jest.mocked(resumeData).summary = 'Short. This is a longer second sentence to meet the minimum requirement.'

      const metadata = generateSiteMetadata()

      expect(metadata.description).toContain('Short')
      expect(metadata.description).toContain('This is a longer second sentence')

      // Restore
      jest.mocked(resumeData).summary =
        `Experienced software engineer with 10 years in full-stack development. Led teams of 5+ engineers on enterprise projects. Specialized in cloud architecture and scalable systems.`
    })

    it('should truncate description if longer than 200 characters', () => {
      jest.mocked(resumeData).summary =
        'This is a very long summary that exceeds the maximum character limit of 200 characters for the site description and should be truncated with an ellipsis to meet the SEO requirements and prevent overly long meta descriptions that may be cut off in search results anyway so we need to ensure proper truncation happens'

      const metadata = generateSiteMetadata()

      expect(metadata.description?.length).toBeLessThanOrEqual(200)
      expect(metadata.description).toMatch(/\.\.\.$/)

      // Restore
      jest.mocked(resumeData).summary =
        `Experienced software engineer with 10 years in full-stack development. Led teams of 5+ engineers on enterprise projects. Specialized in cloud architecture and scalable systems.`
    })

    it('should use default description when summary is empty', () => {
      jest.mocked(resumeData).summary = ''

      const metadata = generateSiteMetadata()

      expect(metadata.description).toBe('Professional Portfolio')

      // Restore
      jest.mocked(resumeData).summary =
        `Experienced software engineer with 10 years in full-stack development. Led teams of 5+ engineers on enterprise projects. Specialized in cloud architecture and scalable systems.`
    })

    it('should handle summary with only whitespace', () => {
      jest.mocked(resumeData).summary = '   \n\t   '

      const metadata = generateSiteMetadata()

      expect(metadata.description).toBe('Professional Portfolio')

      // Restore
      jest.mocked(resumeData).summary =
        `Experienced software engineer with 10 years in full-stack development. Led teams of 5+ engineers on enterprise projects. Specialized in cloud architecture and scalable systems.`
    })

    it('should handle summary with no sentence terminators', () => {
      jest.mocked(resumeData).summary = 'A summary without any proper sentence endings'

      const metadata = generateSiteMetadata()

      expect(metadata.description).toBe('A summary without any proper sentence endings')

      // Restore
      jest.mocked(resumeData).summary =
        `Experienced software engineer with 10 years in full-stack development. Led teams of 5+ engineers on enterprise projects. Specialized in cloud architecture and scalable systems.`
    })
  })

  describe('Keywords Generation', () => {
    it('should generate keywords from position', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.keywords).toContain('Senior Software Engineer')
      expect(metadata.keywords).toContain('Technical Lead')
    })

    it('should include priority skills in keywords', () => {
      const metadata = generateSiteMetadata()

      const keywords = metadata.keywords as string

      // Check some priority skills
      expect(keywords).toContain('Node.js')
      expect(keywords).toContain('TypeScript')
      expect(keywords).toContain('Kubernetes')
      expect(keywords).toContain('Generative AI')
    })

    it('should handle missing position', () => {
      jest.mocked(resumeData).position = ''

      const metadata = generateSiteMetadata()

      // Should still have priority skills
      expect(metadata.keywords).toContain('TypeScript')

      // Restore
      jest.mocked(resumeData).position = 'Senior Software Engineer | Technical Lead'
    })

    it('should split position by pipe and comma', () => {
      jest.mocked(resumeData).position = 'Engineer, Developer | Tech Lead'

      const metadata = generateSiteMetadata()

      const keywords = metadata.keywords as string
      expect(keywords).toContain('Engineer')
      expect(keywords).toContain('Developer')
      expect(keywords).toContain('Tech Lead')

      // Restore
      jest.mocked(resumeData).position = 'Senior Software Engineer | Technical Lead'
    })
  })

  describe('LinkedIn Handle Extraction', () => {
    it('should extract LinkedIn handle for Twitter creator', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.twitter).toHaveProperty('creator', '@johndoe')
    })

    it('should handle missing LinkedIn profile', () => {
      jest.mocked(resumeData).socialMedia = [{ socialMedia: 'GitHub', link: 'github.com/johndoe' }]

      const metadata = generateSiteMetadata()

      expect(metadata.twitter?.creator).toBeUndefined()

      // Restore
      jest.mocked(resumeData).socialMedia = [
        { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
        { socialMedia: 'GitHub', link: 'github.com/johndoe' },
      ]
    })

    it('should handle empty social media array', () => {
      jest.mocked(resumeData).socialMedia = []

      const metadata = generateSiteMetadata()

      expect(metadata.twitter?.creator).toBeUndefined()

      // Restore
      jest.mocked(resumeData).socialMedia = [
        { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
        { socialMedia: 'GitHub', link: 'github.com/johndoe' },
      ]
    })
  })

  describe('OpenGraph Metadata', () => {
    it('should include OpenGraph properties', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.openGraph).toEqual({
        title: 'John Doe - Senior Software Engineer | Technical Lead',
        description: 'Experienced software engineer with 10 years in full-stack development',
        url: SITE_URL,
        siteName: 'John Doe',
        type: 'website',
        locale: 'en_US',
      })
    })

    it('should use same description for OG', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.openGraph?.description).toBe(metadata.description)
    })
  })

  describe('Twitter Card Metadata', () => {
    it('should include Twitter card properties', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.twitter).toHaveProperty('card', 'summary_large_image')
      expect(metadata.twitter).toHaveProperty('title', 'John Doe - Senior Software Engineer | Technical Lead')
      expect(metadata.twitter).toHaveProperty(
        'description',
        'Experienced software engineer with 10 years in full-stack development'
      )
    })
  })

  describe('Metadata Base URL', () => {
    it('should set metadataBase to site URL', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.metadataBase).toEqual(new URL(SITE_URL))
    })
  })

  describe('Authors Metadata', () => {
    it('should include author name', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.authors).toEqual([{ name: 'John Doe' }])
    })
  })

  describe('Robots Metadata', () => {
    it('should enable indexing', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.robots).toHaveProperty('index', true)
      expect(metadata.robots).toHaveProperty('follow', true)
    })

    it('should configure Google Bot settings', () => {
      const metadata = generateSiteMetadata()

      expect(metadata.robots).toHaveProperty('googleBot', {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      })
    })
  })
})
