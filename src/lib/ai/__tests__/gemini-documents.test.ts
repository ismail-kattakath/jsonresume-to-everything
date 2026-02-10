// @ts-nocheck
/**
 * @jest-environment node
 */

import {
  generateCoverLetterWithGemini,
  generateSummaryWithGemini,
  testGeminiConnection,
} from '../gemini-documents'
import { GeminiClient } from '../gemini-client'
import type { ResumeData } from '@/types'

// Mock GeminiClient
jest.mock('../gemini-client')

describe('Gemini Documents', () => {
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    position: 'Senior Software Engineer',
    contactInformation: '+1-555-0100',
    email: 'john@example.com',
    address: 'San Francisco, CA, US',
    profilePicture: '',
    socialMedia: [],
    summary: 'Experienced software engineer',
    education: [],
    languages: [],
    certifications: [],
    workExperience: [
      {
        organization: 'Tech Corp',
        position: 'Senior Engineer',
        startYear: '2020-01-01',
        endYear: 'Present',
        description: 'Led development team',
        url: '',
        keyAchievements: [
          { text: 'Built microservices' },
          { text: 'Improved performance by 60%' },
        ],
      },
    ],
    skills: [
      {
        title: 'Programming Languages',
        skills: [{ text: 'JavaScript' }, { text: 'TypeScript' }],
      },
    ],
  }

  const mockJobDescription =
    'Looking for a senior software engineer with React experience'
  const mockApiKey = 'test-api-key'
  const mockModel = 'gemini-2.0-flash'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateCoverLetterWithGemini', () => {
    it('should generate cover letter with streaming', async () => {
      const mockContent = 'Dear Hiring Manager, I am excited to apply...'
      const mockGenerateContentStream = jest.fn().mockResolvedValue(mockContent)

      ;(
        GeminiClient as jest.MockedClass<typeof GeminiClient>
      ).mockImplementation(
        () =>
          ({
            generateContentStream: mockGenerateContentStream,
          }) as any
      )

      const onProgress = jest.fn()
      const result = await generateCoverLetterWithGemini(
        mockResumeData,
        mockJobDescription,
        mockApiKey,
        mockModel,
        onProgress
      )

      expect(result).toBe(mockContent)
      expect(mockGenerateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
          temperature: 0.7,
          maxTokens: 8192,
          topP: 0.9,
        }),
        onProgress
      )
    })

    it('should generate cover letter without progress callback', async () => {
      const mockContent = 'Dear Hiring Manager, I am excited to apply...'
      const mockGenerateContentStream = jest.fn().mockResolvedValue(mockContent)

      ;(
        GeminiClient as jest.MockedClass<typeof GeminiClient>
      ).mockImplementation(
        () =>
          ({
            generateContentStream: mockGenerateContentStream,
          }) as any
      )

      const result = await generateCoverLetterWithGemini(
        mockResumeData,
        mockJobDescription,
        mockApiKey,
        mockModel
      )

      expect(result).toBe(mockContent)
      expect(mockGenerateContentStream).toHaveBeenCalled()
    })
  })

  describe('generateSummaryWithGemini', () => {
    it('should generate summary with streaming', async () => {
      const mockContent =
        'Senior Software Engineer with 8 years of experience...'
      const mockGenerateContentStream = jest.fn().mockResolvedValue(mockContent)

      ;(
        GeminiClient as jest.MockedClass<typeof GeminiClient>
      ).mockImplementation(
        () =>
          ({
            generateContentStream: mockGenerateContentStream,
          }) as any
      )

      const onProgress = jest.fn()
      const result = await generateSummaryWithGemini(
        mockResumeData,
        mockJobDescription,
        mockApiKey,
        mockModel,
        onProgress
      )

      expect(result).toBe(mockContent)
      expect(mockGenerateContentStream).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({ role: 'system' }),
            expect.objectContaining({ role: 'user' }),
          ]),
          temperature: 0.7,
          maxTokens: 4096,
          topP: 0.9,
        }),
        onProgress
      )
    })
  })

  describe('testGeminiConnection', () => {
    it('should return true on successful connection', async () => {
      const mockTestConnection = jest.fn().mockResolvedValue(true)

      ;(
        GeminiClient as jest.MockedClass<typeof GeminiClient>
      ).mockImplementation(
        () =>
          ({
            testConnection: mockTestConnection,
          }) as any
      )

      const result = await testGeminiConnection(mockApiKey, mockModel)

      expect(result).toBe(true)
      expect(mockTestConnection).toHaveBeenCalled()
    })

    it('should return false on connection failure', async () => {
      const mockTestConnection = jest
        .fn()
        .mockRejectedValue(new Error('Connection failed'))
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      ;(
        GeminiClient as jest.MockedClass<typeof GeminiClient>
      ).mockImplementation(
        () =>
          ({
            testConnection: mockTestConnection,
          }) as any
      )

      const result = await testGeminiConnection(mockApiKey, mockModel)

      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Gemini connection test failed:',
        expect.any(Error)
      )

      consoleErrorSpy.mockRestore()
    })
  })
})
