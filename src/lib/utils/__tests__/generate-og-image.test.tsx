import { generateOgImage } from '@/lib/utils/generate-og-image'
import { ImageResponse } from 'next/og'
import * as fs from 'fs'

jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation((element, options) => ({
    element,
    options,
  })),
}))

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
}))

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}))

describe('generateOgImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(fs.readFileSync as jest.Mock).mockReturnValue(Buffer.from('test-image'))
  })

  it('generates an image response with the correct dimensions', async () => {
    const config = {
      width: 1200,
      height: 630,
      logoWidth: 400,
      logoHeight: 100,
    }

    const response = await generateOgImage(config)

    expect(ImageResponse).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        width: 1200,
        height: 630,
      })
    )
    expect(response).toBeDefined()
  })
})
