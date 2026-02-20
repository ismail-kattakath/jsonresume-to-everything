// @ts-nocheck
import { GET, dynamic } from '@/app/resume.json/route'
import { NextResponse } from 'next/server'
import { convertToJSONResume } from '@/lib/jsonResume'

// Mock dependencies
jest.mock('@/lib/jsonResume', () => ({
  convertToJSONResume: jest.fn(),
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      data,
      options,
      headers: options?.headers,
    })),
  },
}))

describe('resume.json Route Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('dynamic export', () => {
    it('should export dynamic as force-static', () => {
      expect(dynamic).toBe('force-static')
    })
  })

  describe('GET handler', () => {
    it('should call convertToJSONResume', async () => {
      const mockResume = {
        basics: {
          name: 'Test User',
          email: 'test@example.com',
        },
      }

      ;(convertToJSONResume as jest.Mock).mockReturnValue(mockResume)

      await GET()

      expect(convertToJSONResume).toHaveBeenCalledTimes(1)
    })

    it('should return NextResponse.json with resume data', async () => {
      const mockResume = {
        basics: {
          name: 'Test User',
          position: 'Software Engineer',
          email: 'test@example.com',
        },
        work: [],
        education: [],
      }

      ;(convertToJSONResume as jest.Mock).mockReturnValue(mockResume)

      const response = await GET()

      expect(NextResponse.json).toHaveBeenCalledWith(
        mockResume,
        expect.objectContaining({
          headers: expect.any(Object),
        })
      )
      expect(response.data).toEqual(mockResume)
    })

    it('should set correct Content-Type header', async () => {
      const mockResume = { basics: {} }
      ;(convertToJSONResume as jest.Mock).mockReturnValue(mockResume)

      const response = await GET()

      expect(response.headers['Content-Type']).toBe('application/json')
    })

    it('should set Cache-Control header with correct values', async () => {
      const mockResume = { basics: {} }
      ;(convertToJSONResume as jest.Mock).mockReturnValue(mockResume)

      const response = await GET()

      expect(response.headers['Cache-Control']).toBe('public, max-age=3600, s-maxage=3600')
    })

    it('should handle empty resume data', async () => {
      const emptyResume = {}
      ;(convertToJSONResume as jest.Mock).mockReturnValue(emptyResume)

      const response = await GET()

      expect(NextResponse.json).toHaveBeenCalledWith(emptyResume, expect.any(Object))
      expect(response.data).toEqual(emptyResume)
    })

    it('should handle resume with all standard fields', async () => {
      const fullResume = {
        basics: {
          name: 'John Doe',
          label: 'Full Stack Developer',
          email: 'john@example.com',
          phone: '555-1234',
          url: 'https://johndoe.com',
          summary: 'Experienced developer',
          location: {
            city: 'San Francisco',
            countryCode: 'US',
          },
          profiles: [
            {
              network: 'GitHub',
              url: 'https://github.com/johndoe',
            },
          ],
        },
        work: [],
        education: [],
        skills: [],
        languages: [],
        certificates: [],
      }

      ;(convertToJSONResume as jest.Mock).mockReturnValue(fullResume)

      const response = await GET()

      expect(response.data).toEqual(fullResume)
    })
  })
})
