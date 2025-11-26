import { generateOgImage } from '@/lib/utils/generateOgImage'

// Mock next/og
jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation((element, config) => ({
    element,
    config,
  })),
}))

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock-image-data')),
}))

// Mock path
jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}))

describe('generateOgImage', () => {
  it('generates OG image with correct dimensions', async () => {
    const result = await generateOgImage({
      width: 1200,
      height: 630,
      logoWidth: 600,
      logoHeight: 300,
    })
    expect(result).toBeDefined()
    expect(result.config).toEqual({ width: 1200, height: 630 })
  })

  it('generates OG image with different dimensions', async () => {
    const result = await generateOgImage({
      width: 1280,
      height: 720,
      logoWidth: 640,
      logoHeight: 360,
    })
    expect(result).toBeDefined()
    expect(result.config).toEqual({ width: 1280, height: 720 })
  })
})
