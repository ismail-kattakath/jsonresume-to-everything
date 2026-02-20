import { generateResumeBuilderOgImage } from '@/lib/utils/generate-resume-builder-og-image'
import TwitterImage, { dynamic, alt, size, contentType } from '@/app/resume/builder/twitter-image'

// Mock the generateResumeBuilderOgImage utility
jest.mock('@/lib/utils/generate-resume-builder-og-image', () => ({
  generateResumeBuilderOgImage: jest.fn(),
}))

describe('Resume Builder Twitter Image Route Handler', () => {
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

    it('should export correct size dimensions for Twitter Card (1200x600)', () => {
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
    it('should call generateResumeBuilderOgImage with correct Twitter parameters', async () => {
      const mockImageResponse = { ok: true }
      ;(generateResumeBuilderOgImage as jest.Mock).mockResolvedValue(mockImageResponse)

      const result = await TwitterImage()

      expect(generateResumeBuilderOgImage).toHaveBeenCalledWith({
        width: 1200,
        height: 600,
        logoWidth: 560,
        logoHeight: 315,
      })
      expect(result).toBe(mockImageResponse)
    })

    it('should handle generateResumeBuilderOgImage errors gracefully', async () => {
      const mockError = new Error('Twitter image generation failed')
      ;(generateResumeBuilderOgImage as jest.Mock).mockRejectedValue(mockError)

      await expect(TwitterImage()).rejects.toThrow('Twitter image generation failed')
    })

    it('should use TWITTER_IMAGE_CONFIG dimensions', async () => {
      const mockImageResponse = { ok: true }
      ;(generateResumeBuilderOgImage as jest.Mock).mockResolvedValue(mockImageResponse)

      await TwitterImage()

      const callArgs = (generateResumeBuilderOgImage as jest.Mock).mock.calls[0][0]
      expect(callArgs.width).toBe(1200)
      expect(callArgs.height).toBe(600)
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

  describe('Twitter Card Optimization', () => {
    it('should have optimized dimensions for Twitter summary_large_image', () => {
      // 2:1 aspect ratio recommended by Twitter
      const aspectRatio = size.width / size.height
      expect(aspectRatio).toBeCloseTo(2.0, 1)
    })

    it('should have minimum recommended dimensions for Twitter', () => {
      // Twitter recommends minimum 600x314 for summary_large_image
      expect(size.width).toBeGreaterThanOrEqual(600)
      expect(size.height).toBeGreaterThanOrEqual(314)
    })

    it('should use higher resolution for better quality', () => {
      // Using 1200x600 for crisp display on high-DPI screens
      expect(size.width).toBe(1200)
      expect(size.height).toBe(600)
    })
  })
})
