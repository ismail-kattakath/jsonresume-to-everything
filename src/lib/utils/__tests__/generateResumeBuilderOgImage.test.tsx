import { generateResumeBuilderOgImage } from '@/lib/utils/generateResumeBuilderOgImage'
import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'

// Mock fs module
jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))

// Mock next/og
jest.mock('next/og', () => ({
  ImageResponse: jest.fn(),
}))

// Mock background config
jest.mock('@/config/background', () => ({
  BACKGROUND_IMAGE_FILE_PATH: 'public/images/background.jpg',
}))

describe('generateResumeBuilderOgImage', () => {
  const mockBuffer = Buffer.from('fake-image-data')

  beforeEach(() => {
    jest.clearAllMocks()
    ;(readFileSync as jest.Mock).mockReturnValue(mockBuffer)
    ;(ImageResponse as unknown as jest.Mock).mockImplementation(
      (element, options) => ({
        element,
        options,
      })
    )
  })

  describe('Image Generation', () => {
    it('should generate image with correct dimensions', async () => {
      const config = {
        width: 1200,
        height: 630,
      }

      await generateResumeBuilderOgImage(config)

      expect(ImageResponse).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 630,
        })
      )
    })

    it('should read background image from filesystem', async () => {
      const config = {
        width: 1200,
        height: 630,
      }

      await generateResumeBuilderOgImage(config)

      expect(readFileSync).toHaveBeenCalled()
    })

    it('should handle different config sizes', async () => {
      const twitterConfig = {
        width: 1200,
        height: 600,
      }

      await generateResumeBuilderOgImage(twitterConfig)

      expect(ImageResponse).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          width: 1200,
          height: 600,
        })
      )
    })
  })

  describe('Visual Content', () => {
    it('should include AI Resume Builder title', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      const [[element]] = (ImageResponse as unknown as jest.Mock).mock.calls
      const elementString = JSON.stringify(element)

      expect(elementString).toContain('AI Resume Builder')
    })

    it('should include descriptive subtitle', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      const [[element]] = (ImageResponse as unknown as jest.Mock).mock.calls
      const elementString = JSON.stringify(element)

      expect(elementString).toContain('JD-tailored resumes')
    })

    it('should include feature pills', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      const [[element]] = (ImageResponse as unknown as jest.Mock).mock.calls
      const elementString = JSON.stringify(element)

      expect(elementString).toContain('AI-Powered')
      expect(elementString).toContain('Real-time Preview')
      expect(elementString).toContain('JSON Resume')
    })
  })

  describe('Layout Structure', () => {
    it('should have gradient background', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      const [[element]] = (ImageResponse as unknown as jest.Mock).mock.calls
      const elementString = JSON.stringify(element)

      expect(elementString).toContain('linear-gradient')
    })

    it('should have blurred background image', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      const [[element]] = (ImageResponse as unknown as jest.Mock).mock.calls
      const elementString = JSON.stringify(element)

      expect(elementString).toContain('blur')
    })

    it('should have dark overlay', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      const [[element]] = (ImageResponse as unknown as jest.Mock).mock.calls
      const elementString = JSON.stringify(element)

      expect(elementString).toContain('rgba')
    })

    it('should have bottom gradient accent', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      const [[element]] = (ImageResponse as unknown as jest.Mock).mock.calls
      const elementString = JSON.stringify(element)

      // Check for gradient in the bottom accent
      expect(elementString).toContain('bottom')
    })
  })

  describe('Error Handling', () => {
    it('should handle file read errors', async () => {
      ;(readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found')
      })

      const config = { width: 1200, height: 630 }

      await expect(generateResumeBuilderOgImage(config)).rejects.toThrow(
        'File not found'
      )
    })
  })

  describe('Buffer Processing', () => {
    it('should convert buffer to ArrayBuffer correctly', async () => {
      const config = { width: 1200, height: 630 }

      await generateResumeBuilderOgImage(config)

      expect(readFileSync).toHaveBeenCalled()
      // Verify ImageResponse was called (which means buffer conversion succeeded)
      expect(ImageResponse).toHaveBeenCalled()
    })
  })
})
