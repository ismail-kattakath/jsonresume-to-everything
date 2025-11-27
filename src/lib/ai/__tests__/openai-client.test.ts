import {
  generateCoverLetter,
  generateSummary,
  testConnection,
  saveCredentials,
  loadCredentials,
  clearCredentials,
  OpenAIAPIError,
} from '@/lib/ai/openai-client'
import type { ResumeData, StoredCredentials } from '@/types'

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Software Engineer',
  contactInformation: '+1234567890',
  email: 'john@example.com',
  address: '123 Main St',
  profilePicture: '',
  calendarLink: '',
  socialMedia: [],
  summary: 'Experienced software engineer',
  education: [],
  workExperience: [
    {
      company: 'Tech Corp',
      url: 'techcorp.com',
      position: 'Senior Developer',
      description: 'Leading development',
      keyAchievements: [
        { text: 'Built scalable systems' },
        { text: 'Reduced bugs by 50%' },
      ],
      startYear: '2020',
      endYear: 'Present',
      technologies: ['React', 'Node.js'],
    },
  ],
  skills: [
    {
      title: 'Programming',
      skills: [
        { text: 'JavaScript', highlight: false },
        { text: 'TypeScript', highlight: false },
      ],
    },
  ],
  languages: ['English'],
  certifications: [],
}

describe('OpenAI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('generateCoverLetter', () => {
    it('generates cover letter successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is a generated cover letter content.',
            },
          },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await generateCoverLetter(
        {
          baseURL: 'http://localhost:1234',
          apiKey: 'test-key',
          model: 'test-model',
        },
        mockResumeData,
        'Job description here'
      )

      expect(result).toContain('generated cover letter')
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:1234/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-key',
          },
        })
      )
    })

    it('throws error on network failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(
        generateCoverLetter(
          {
            baseURL: 'http://localhost:1234',
            apiKey: 'test-key',
            model: 'test-model',
          },
          mockResumeData,
          'Job description'
        )
      ).rejects.toThrow(OpenAIAPIError)
    })

    it('throws error on API error response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: 'Invalid API key',
            type: 'authentication_error',
          },
        }),
      })

      await expect(
        generateCoverLetter(
          {
            baseURL: 'http://localhost:1234',
            apiKey: 'invalid-key',
            model: 'test-model',
          },
          mockResumeData,
          'Job description'
        )
      ).rejects.toThrow('Invalid API key')
    })

    it('throws error on empty response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      })

      await expect(
        generateCoverLetter(
          {
            baseURL: 'http://localhost:1234',
            apiKey: 'test-key',
            model: 'test-model',
          },
          mockResumeData,
          'Job description'
        )
      ).rejects.toThrow('empty response')
    })

    it('throws error on timeout', async () => {
      // Mock AbortError
      const abortError = new Error('The operation was aborted')
      abortError.name = 'AbortError'
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(abortError)

      await expect(
        generateCoverLetter(
          {
            baseURL: 'http://localhost:1234',
            apiKey: 'test-key',
            model: 'test-model',
          },
          mockResumeData,
          'Job description'
        )
      ).rejects.toThrow('Request timed out after 2 minutes')
    })

    it('includes resume data in prompt', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content:
                'Cover letter content with sufficient length to pass validation checks.',
            },
          },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await generateCoverLetter(
        {
          baseURL: 'http://localhost:1234',
          apiKey: 'test-key',
          model: 'test-model',
        },
        mockResumeData,
        'Looking for a React developer'
      )

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody.messages[1].content).toContain('John Doe')
      expect(requestBody.messages[1].content).toContain('React developer')
    })
  })

  describe('Credential Management', () => {
    it('saves credentials to localStorage when remember is true', () => {
      const credentials: StoredCredentials = {
        apiUrl: 'http://localhost:1234',
        apiKey: 'test-key',
        rememberCredentials: true,
        lastJobDescription: 'Test job description',
      }

      saveCredentials(credentials)

      const stored = localStorage.getItem('ai_cover_letter_credentials')
      expect(stored).toBeTruthy()
      expect(JSON.parse(stored!)).toEqual(credentials)
    })

    it('keeps job description when remember is false', () => {
      // First save credentials
      localStorage.setItem(
        'ai_cover_letter_credentials',
        JSON.stringify({
          apiUrl: 'http://localhost:1234',
          apiKey: 'test-key',
          rememberCredentials: true,
          lastJobDescription: 'Previous job',
        })
      )

      // Then save with remember false but with job description
      saveCredentials({
        apiUrl: 'http://localhost:1234',
        apiKey: 'test-key',
        rememberCredentials: false,
        lastJobDescription: 'New job description',
      })

      const stored = localStorage.getItem('ai_cover_letter_credentials')
      expect(stored).toBeTruthy()
      const parsed = JSON.parse(stored!)
      expect(parsed.lastJobDescription).toBe('New job description')
      expect(parsed.apiUrl).toBe('')
      expect(parsed.apiKey).toBe('')
    })

    it('loads credentials from localStorage', () => {
      const credentials: StoredCredentials = {
        apiUrl: 'http://localhost:1234',
        apiKey: 'test-key',
        rememberCredentials: true,
        lastJobDescription: 'Saved job description',
      }

      localStorage.setItem(
        'ai_cover_letter_credentials',
        JSON.stringify(credentials)
      )

      const loaded = loadCredentials()
      expect(loaded).toEqual(credentials)
    })

    it('returns null when no credentials stored', () => {
      const loaded = loadCredentials()
      expect(loaded).toBeNull()
    })

    it('handles corrupted localStorage data', () => {
      localStorage.setItem('ai_cover_letter_credentials', 'invalid json')

      const loaded = loadCredentials()
      expect(loaded).toBeNull()
    })

    it('clears credentials', () => {
      localStorage.setItem(
        'ai_cover_letter_credentials',
        JSON.stringify({
          apiUrl: 'http://localhost:1234',
          apiKey: 'test-key',
          rememberCredentials: true,
        })
      )

      clearCredentials()

      const stored = localStorage.getItem('ai_cover_letter_credentials')
      expect(stored).toBeNull()
    })
  })

  describe('OpenAIAPIError', () => {
    it('creates error with message', () => {
      const error = new OpenAIAPIError('Test error')
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('OpenAIAPIError')
    })

    it('creates error with code and type', () => {
      const error = new OpenAIAPIError('Test error', 'test_code', 'test_type')
      expect(error.code).toBe('test_code')
      expect(error.type).toBe('test_type')
    })
  })

  describe('generateSummary', () => {
    it('generates summary successfully without streaming', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content:
                'Experienced Software Engineer with 5+ years building scalable systems.',
            },
          },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await generateSummary(
        {
          baseURL: 'http://localhost:1234',
          apiKey: 'test-key',
          model: 'test-model',
        },
        mockResumeData,
        'Looking for a senior software engineer'
      )

      expect(result).toContain('Experienced Software Engineer')
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:1234/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('throws error on empty response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [],
        }),
      })

      await expect(
        generateSummary(
          {
            baseURL: 'http://localhost:1234',
            apiKey: 'test-key',
            model: 'test-model',
          },
          mockResumeData,
          'Job description'
        )
      ).rejects.toThrow('empty response')
    })

    it('throws error on empty content', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: '',
              },
            },
          ],
        }),
      })

      await expect(
        generateSummary(
          {
            baseURL: 'http://localhost:1234',
            apiKey: 'test-key',
            model: 'test-model',
          },
          mockResumeData,
          'Job description'
        )
      ).rejects.toThrow('empty')
    })

    it('throws error on network failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      await expect(
        generateSummary(
          {
            baseURL: 'http://localhost:1234',
            apiKey: 'test-key',
            model: 'test-model',
          },
          mockResumeData,
          'Job description'
        )
      ).rejects.toThrow(OpenAIAPIError)
    })

    it('includes resume data in summary prompt', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content:
                'Senior Developer with expertise in React and Node.js, proven track record of success.',
            },
          },
        ],
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      })

      await generateSummary(
        {
          baseURL: 'http://localhost:1234',
          apiKey: 'test-key',
          model: 'test-model',
        },
        mockResumeData,
        'Looking for React expert'
      )

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      // Resume data is now in system message (index 0), not user message
      expect(requestBody.messages[0].content).toContain('John Doe')
      expect(requestBody.messages[0].content).toContain('React expert')
    })
  })

  describe('testConnection', () => {
    it('returns true on successful connection', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hi' } }],
        }),
      })

      const result = await testConnection({
        baseURL: 'http://localhost:1234',
        apiKey: 'test-key',
        model: 'test-model',
      })

      expect(result).toBe(true)
    })

    it('returns false on connection failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Connection failed')
      )

      const result = await testConnection({
        baseURL: 'http://localhost:1234',
        apiKey: 'bad-key',
        model: 'test-model',
      })

      expect(result).toBe(false)
    })

    it('returns false on API error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          error: {
            message: 'Invalid API key',
            type: 'authentication_error',
          },
        }),
      })

      const result = await testConnection({
        baseURL: 'http://localhost:1234',
        apiKey: 'invalid-key',
        model: 'test-model',
      })

      expect(result).toBe(false)
    })
  })
})
