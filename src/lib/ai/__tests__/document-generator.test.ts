/**
 * @jest-environment node
 */

import {
  generateCoverLetterWithProvider,
  generateSummaryWithProvider,
} from '../document-generator'
import type { ResumeData } from '@/types'
import * as geminiDocuments from '../gemini-documents'
import * as openaiClient from '../openai-client'

// Mock the document generation modules
jest.mock('../gemini-documents')
jest.mock('../openai-client')

describe('Document Generator', () => {
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    position: 'Software Engineer',
    contactInformation: '+1-555-0100',
    email: 'john@example.com',
    address: 'San Francisco, CA, US',
    profilePicture: '',
    socialMedia: [],
    summary: 'Experienced software engineer',
    education: [
      {
        school: 'University of Example',
        url: '',
        area: '',
        studyType: 'Bachelor in Computer Science',
        startYear: '2016-09-01',
        endYear: '2020-05-01',
        // grade: '',
      },
    ],
    workExperience: [
      {
        position: 'Senior Engineer',
        organization: 'Tech Corp',
        startYear: '2020-01-01',
        endYear: 'Present',
        description: 'Led development team',
        url: '',
        keyAchievements: [
          { text: 'Built microservices' },
          { text: 'Improved performance by 50%' },
        ],
      },
    ],
    skills: [
      {
        title: 'Programming',
        skills: [
          { text: 'TypeScript' },
          { text: 'React' },
          { text: 'Node.js' },
        ],
      },
    ],
    languages: ['English'],
    certifications: [],
    projects: [],
  }

  const mockJobDescription = 'Looking for a senior full-stack developer'
  const mockApiUrl = 'https://api.example.com/v1'
  const mockApiKey = 'test-key-123'
  const mockModel = 'test-model'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateCoverLetterWithProvider', () => {
    it('should use Gemini provider when providerType is gemini', async () => {
      const mockResult = 'Generated cover letter with Gemini'

      jest
        .spyOn(geminiDocuments, 'generateCoverLetterWithGemini')
        .mockResolvedValue(mockResult)

      const result = await generateCoverLetterWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'gemini'
      )

      expect(
        geminiDocuments.generateCoverLetterWithGemini
      ).toHaveBeenCalledWith(
        mockResumeData,
        mockJobDescription,
        mockApiKey,
        mockModel,
        undefined
      )
      expect(result).toBe(mockResult)
    })

    it('should use OpenAI-compatible provider when providerType is openai-compatible', async () => {
      const mockResult = 'Generated cover letter with OpenAI'

      jest
        .spyOn(openaiClient, 'generateCoverLetter')
        .mockResolvedValue(mockResult)

      const result = await generateCoverLetterWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'openai-compatible'
      )

      expect(openaiClient.generateCoverLetter).toHaveBeenCalledWith(
        { baseURL: mockApiUrl, apiKey: mockApiKey, model: mockModel },
        mockResumeData,
        mockJobDescription,
        undefined
      )
      expect(result).toBe(mockResult)
    })

    it('should pass onProgress callback to Gemini provider', async () => {
      const mockOnProgress = jest.fn()
      const mockResult = 'Full response'

      jest
        .spyOn(geminiDocuments, 'generateCoverLetterWithGemini')
        .mockResolvedValue(mockResult)

      await generateCoverLetterWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'gemini',
        mockOnProgress
      )

      expect(
        geminiDocuments.generateCoverLetterWithGemini
      ).toHaveBeenCalledWith(
        mockResumeData,
        mockJobDescription,
        mockApiKey,
        mockModel,
        mockOnProgress
      )
    })

    it('should pass onProgress callback to OpenAI provider', async () => {
      const mockOnProgress = jest.fn()
      const mockResult = 'Full response'

      jest
        .spyOn(openaiClient, 'generateCoverLetter')
        .mockResolvedValue(mockResult)

      await generateCoverLetterWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'openai-compatible',
        mockOnProgress
      )

      expect(openaiClient.generateCoverLetter).toHaveBeenCalledWith(
        { baseURL: mockApiUrl, apiKey: mockApiKey, model: mockModel },
        mockResumeData,
        mockJobDescription,
        mockOnProgress
      )
    })
  })

  describe('generateSummaryWithProvider', () => {
    it('should use Gemini provider when providerType is gemini', async () => {
      const mockResult = 'Generated summary with Gemini'

      jest
        .spyOn(geminiDocuments, 'generateSummaryWithGemini')
        .mockResolvedValue(mockResult)

      const result = await generateSummaryWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'gemini'
      )

      expect(geminiDocuments.generateSummaryWithGemini).toHaveBeenCalledWith(
        mockResumeData,
        mockJobDescription,
        mockApiKey,
        mockModel,
        undefined
      )
      expect(result).toBe(mockResult)
    })

    it('should use OpenAI-compatible provider when providerType is openai-compatible', async () => {
      const mockResult = 'Generated summary with OpenAI'

      jest.spyOn(openaiClient, 'generateSummary').mockResolvedValue(mockResult)

      const result = await generateSummaryWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'openai-compatible'
      )

      expect(openaiClient.generateSummary).toHaveBeenCalledWith(
        { baseURL: mockApiUrl, apiKey: mockApiKey, model: mockModel },
        mockResumeData,
        mockJobDescription,
        undefined
      )
      expect(result).toBe(mockResult)
    })

    it('should pass onProgress callback to Gemini provider', async () => {
      const mockOnProgress = jest.fn()
      const mockResult = 'Full summary'

      jest
        .spyOn(geminiDocuments, 'generateSummaryWithGemini')
        .mockResolvedValue(mockResult)

      await generateSummaryWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'gemini',
        mockOnProgress
      )

      expect(geminiDocuments.generateSummaryWithGemini).toHaveBeenCalledWith(
        mockResumeData,
        mockJobDescription,
        mockApiKey,
        mockModel,
        mockOnProgress
      )
    })

    it('should pass onProgress callback to OpenAI provider', async () => {
      const mockOnProgress = jest.fn()
      const mockResult = 'Full summary'

      jest.spyOn(openaiClient, 'generateSummary').mockResolvedValue(mockResult)

      await generateSummaryWithProvider(
        mockResumeData,
        mockJobDescription,
        mockApiUrl,
        mockApiKey,
        mockModel,
        'openai-compatible',
        mockOnProgress
      )

      expect(openaiClient.generateSummary).toHaveBeenCalledWith(
        { baseURL: mockApiUrl, apiKey: mockApiKey, model: mockModel },
        mockResumeData,
        mockJobDescription,
        mockOnProgress
      )
    })
  })

  describe('Error Handling', () => {
    it('should propagate errors from Gemini client', async () => {
      const mockError = new Error('Gemini API error')

      jest
        .spyOn(geminiDocuments, 'generateCoverLetterWithGemini')
        .mockRejectedValue(mockError)

      await expect(
        generateCoverLetterWithProvider(
          mockResumeData,
          mockJobDescription,
          mockApiUrl,
          mockApiKey,
          mockModel,
          'gemini'
        )
      ).rejects.toThrow('Gemini API error')
    })

    it('should propagate errors from OpenAI-compatible client', async () => {
      const mockError = new Error('OpenAI API error')

      jest.spyOn(openaiClient, 'generateSummary').mockRejectedValue(mockError)

      await expect(
        generateSummaryWithProvider(
          mockResumeData,
          mockJobDescription,
          mockApiUrl,
          mockApiKey,
          mockModel,
          'openai-compatible'
        )
      ).rejects.toThrow('OpenAI API error')
    })
  })
})
