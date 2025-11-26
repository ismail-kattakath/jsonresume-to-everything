import { generateOgImage } from '@/lib/utils/generateOgImage'
import TwitterImage, {
  dynamic,
  alt,
  size,
  contentType,
} from '@/app/twitter-image'

// Mock the generateOgImage utility
jest.mock('@/lib/utils/generateOgImage', () => ({
  generateOgImage: jest.fn(),
}))

// Mock resumeAdapter
jest.mock('@/lib/resumeAdapter', () => ({
  __esModule: true,
  default: {
    name: 'Jane Smith',
    position: 'Product Designer',
    email: 'jane@example.com',
    phone: '+9876543210',
    location: 'New York, NY',
    summary: 'Creative designer',
    website: 'janesmith.com',
    showSummary: true,
    workExperience: [],
    education: [],
    skillGroups: [],
    projects: [],
    certifications: [],
    languages: [],
    socialMedia: {
      linkedin: 'linkedin.com/in/janesmith',
      github: 'github.com/janesmith',
      twitter: 'twitter.com/janesmith',
    },
  },
}))

describe('twitter-image Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Exported Constants', () => {
    it('should export dynamic as force-static', () => {
      expect(dynamic).toBe('force-static')
    })

    it('should export alt text from resume data name in uppercase', () => {
      expect(alt).toBe('JANE SMITH')
    })

    it('should export correct size dimensions for Twitter Card', () => {
      expect(size).toEqual({
        width: 1200,
        height: 600,
      })
    })

    it('should export contentType as image/png', () => {
      expect(contentType).toBe('image/png')
    })
  })

  describe('Image Generation', () => {
    it('should call generateOgImage with correct parameters', async () => {
      const mockImageResponse = { ok: true }
      ;(generateOgImage as jest.Mock).mockResolvedValue(mockImageResponse)

      const result = await TwitterImage()

      expect(generateOgImage).toHaveBeenCalledWith({
        width: 1200,
        height: 600,
        logoWidth: 560,
        logoHeight: 315,
      })
      expect(result).toBe(mockImageResponse)
    })

    it('should handle generateOgImage errors', async () => {
      const mockError = new Error('Twitter image generation failed')
      ;(generateOgImage as jest.Mock).mockRejectedValue(mockError)

      await expect(TwitterImage()).rejects.toThrow(
        'Twitter image generation failed'
      )
    })
  })

  describe('Alt Text Fallback', () => {
    it('should use "Portfolio" as fallback when name is empty', () => {
      // Re-import with empty name mock
      jest.resetModules()
      jest.mock('@/lib/resumeAdapter', () => ({
        __esModule: true,
        default: {
          name: '',
          position: 'Designer',
          email: 'test@example.com',
          phone: '+1234567890',
          location: 'Test City',
          summary: 'Test summary',
          website: 'test.com',
          showSummary: true,
          workExperience: [],
          education: [],
          skillGroups: [],
          projects: [],
          certifications: [],
          languages: [],
          socialMedia: {},
        },
      }))

      const { alt: altWithFallback } = require('@/app/twitter-image')
      expect(altWithFallback).toBe('PORTFOLIO')
    })
  })
})
