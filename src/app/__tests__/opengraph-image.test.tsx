import { generateOgImage } from '@/lib/utils/generateOgImage'
import OgImage, { dynamic, alt, size, contentType } from '@/app/opengraph-image'

// Mock the generateOgImage utility
jest.mock('@/lib/utils/generateOgImage', () => ({
  generateOgImage: jest.fn(),
}))

// Mock resumeAdapter
jest.mock('@/lib/resumeAdapter', () => ({
  __esModule: true,
  default: {
    name: 'John Doe',
    position: 'Software Engineer',
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
    summary: 'Experienced developer',
    website: 'johndoe.com',
    showSummary: true,
    workExperience: [],
    education: [],
    skillGroups: [],
    projects: [],
    certifications: [],
    languages: [],
    socialMedia: {
      linkedin: 'linkedin.com/in/johndoe',
      github: 'github.com/johndoe',
      twitter: 'twitter.com/johndoe',
    },
  },
}))

describe('opengraph-image Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Exported Constants', () => {
    it('should export dynamic as force-static', () => {
      expect(dynamic).toBe('force-static')
    })

    it('should export alt text from resume data name in uppercase', () => {
      expect(alt).toBe('JOHN DOE')
    })

    it('should export correct size dimensions for Open Graph', () => {
      expect(size).toEqual({
        width: 1200,
        height: 630,
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

      const result = await OgImage()

      expect(generateOgImage).toHaveBeenCalledWith({
        width: 1200,
        height: 630,
        logoWidth: 600,
        logoHeight: 337,
      })
      expect(result).toBe(mockImageResponse)
    })

    it('should handle generateOgImage errors', async () => {
      const mockError = new Error('Image generation failed')
      ;(generateOgImage as jest.Mock).mockRejectedValue(mockError)

      await expect(OgImage()).rejects.toThrow('Image generation failed')
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
          position: 'Software Engineer',
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

      const { alt: altWithFallback } = require('@/app/opengraph-image')
      expect(altWithFallback).toBe('PORTFOLIO')
    })
  })
})
