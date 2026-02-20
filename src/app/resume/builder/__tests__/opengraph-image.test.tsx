import { generateResumeBuilderOgImage } from '@/lib/utils/generateResumeBuilderOgImage'
import OgImage, { dynamic, alt, size, contentType } from '@/app/resume/builder/opengraph-image'

// Mock the generateResumeBuilderOgImage utility
jest.mock('@/lib/utils/generateResumeBuilderOgImage', () => ({
  generateResumeBuilderOgImage: jest.fn(),
}))

describe('Resume Builder OpenGraph Image Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Exported Constants', () => {
    it('should export dynamic as force-static', () => {
      expect(dynamic).toBe('force-static')
    })

    it('should export descriptive alt text for resume builder', () => {
      expect(alt).toBe('AI Resume Builder - Build Professional Resumes with AI')
    })

    it('should export correct size dimensions for Open Graph (1200x630)', () => {
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
    it('should call generateResumeBuilderOgImage with correct OG parameters', async () => {
      const mockImageResponse = { ok: true }
      ;(generateResumeBuilderOgImage as jest.Mock).mockResolvedValue(mockImageResponse)

      const result = await OgImage()

      expect(generateResumeBuilderOgImage).toHaveBeenCalledWith({
        width: 1200,
        height: 630,
        logoWidth: 600,
        logoHeight: 337,
      })
      expect(result).toBe(mockImageResponse)
    })

    it('should handle generateResumeBuilderOgImage errors gracefully', async () => {
      const mockError = new Error('Image generation failed')
      ;(generateResumeBuilderOgImage as jest.Mock).mockRejectedValue(mockError)

      await expect(OgImage()).rejects.toThrow('Image generation failed')
    })

    it('should use OG_IMAGE_CONFIG dimensions', async () => {
      const mockImageResponse = { ok: true }
      ;(generateResumeBuilderOgImage as jest.Mock).mockResolvedValue(mockImageResponse)

      await OgImage()

      const callArgs = (generateResumeBuilderOgImage as jest.Mock).mock.calls[0][0]
      expect(callArgs.width).toBe(1200)
      expect(callArgs.height).toBe(630)
    })
  })

  describe('Static Generation', () => {
    it('should be configured for static generation', () => {
      expect(dynamic).toBe('force-static')
    })

    it('should generate at build time not runtime', () => {
      // Verify force-static ensures build-time generation
      expect(dynamic).not.toBe('force-dynamic')
      expect(dynamic).not.toBe('auto')
    })
  })

  describe('Social Media Optimization', () => {
    it('should have optimized dimensions for Facebook/LinkedIn sharing', () => {
      // 1.91:1 aspect ratio recommended by Facebook
      const aspectRatio = size.width / size.height
      expect(aspectRatio).toBeCloseTo(1.91, 1)
    })

    it('should have minimum recommended dimensions for social platforms', () => {
      // Facebook recommends minimum 1200x630
      expect(size.width).toBeGreaterThanOrEqual(1200)
      expect(size.height).toBeGreaterThanOrEqual(630)
    })
  })
})
