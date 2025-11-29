/**
 * @jest-environment node
 */

import { GeminiClient, GeminiAPIError } from '../gemini-client'
import type { AIRequest } from '@/types/ai-provider'

// Mock fetch globally
global.fetch = jest.fn()

describe('GeminiClient', () => {
  let client: GeminiClient
  const mockApiKey = 'test-api-key-123'
  const mockModel = 'gemini-2.5-flash'

  beforeEach(() => {
    client = new GeminiClient({
      providerType: 'gemini',
      apiKey: mockApiKey,
      model: mockModel,
    })
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with default base URL', () => {
      expect(client).toBeDefined()
    })

    it('should accept custom base URL', () => {
      const customClient = new GeminiClient({
        providerType: 'gemini',
        apiKey: mockApiKey,
        model: mockModel,
        baseURL: 'https://custom.example.com/v1',
      })
      expect(customClient).toBeDefined()
    })
  })

  describe('generateContent', () => {
    const mockRequest: AIRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.7,
      maxTokens: 100,
    }

    const mockSuccessResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: 'Hello! How can I help you?' }],
            role: 'model',
          },
          finishReason: 'STOP',
        },
      ],
      usageMetadata: {
        promptTokenCount: 5,
        candidatesTokenCount: 8,
        totalTokenCount: 13,
      },
      modelVersion: 'gemini-2.5-flash-001',
    }

    it('should generate content successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      })

      const response = await client.generateContent(mockRequest)

      expect(response.content).toBe('Hello! How can I help you?')
      expect(response.model).toBe('gemini-2.5-flash-001')
      expect(response.usage).toEqual({
        promptTokens: 5,
        completionTokens: 8,
        totalTokens: 13,
      })
    })

    it('should handle system messages correctly', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      })

      const requestWithSystem: AIRequest = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Hello' },
        ],
        temperature: 0.7,
      }

      await client.generateContent(requestWithSystem)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody.systemInstruction).toEqual({
        parts: [{ text: 'You are a helpful assistant.' }],
      })
      expect(requestBody.contents).toHaveLength(1)
      expect(requestBody.contents[0].role).toBe('user')
    })

    it('should handle multi-turn conversations', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      })

      const conversationRequest: AIRequest = {
        messages: [
          { role: 'user', content: 'What is TypeScript?' },
          {
            role: 'assistant',
            content: 'TypeScript adds static typing to JavaScript.',
          },
          { role: 'user', content: 'What are its benefits?' },
        ],
        temperature: 0.5,
      }

      await client.generateContent(conversationRequest)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody.contents).toHaveLength(3)
      expect(requestBody.contents[0].role).toBe('user')
      expect(requestBody.contents[1].role).toBe('model') // assistant → model
      expect(requestBody.contents[2].role).toBe('user')
    })

    it('should throw GeminiAPIError on HTTP error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 401,
        text: async () =>
          JSON.stringify({
            error: { message: 'Invalid API key' },
          }),
      })

      await expect(client.generateContent(mockRequest)).rejects.toThrow(
        'Invalid API key'
      )
    })

    it('should handle MAX_TOKENS error (thinking mode)', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: { role: 'model' }, // No parts array
              finishReason: 'MAX_TOKENS',
            },
          ],
          usageMetadata: {
            promptTokenCount: 10,
            candidatesTokenCount: 0,
            totalTokenCount: 10,
            thoughtsTokenCount: 990, // All tokens used for thinking
          },
        }),
      })

      await expect(client.generateContent(mockRequest)).rejects.toThrow(
        /Response exceeded max tokens.*thinking mode/
      )
    })

    it('should handle empty response without MAX_TOKENS', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: { parts: [], role: 'model' },
              finishReason: 'STOP',
            },
          ],
        }),
      })

      await expect(client.generateContent(mockRequest)).rejects.toThrow(
        /empty response/
      )
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(
        new Error('fetch failed: network error')
      )

      await expect(client.generateContent(mockRequest)).rejects.toThrow(
        GeminiAPIError
      )
    })

    it('should handle timeout errors', async () => {
      const abortError = new DOMException(
        'The operation was aborted',
        'AbortError'
      )

      ;(global.fetch as jest.Mock).mockRejectedValue(abortError)

      await expect(client.generateContent(mockRequest)).rejects.toThrow(
        GeminiAPIError
      )
    })

    it('should trim whitespace from content', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: '  Response with spaces  ' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      })

      const response = await client.generateContent(mockRequest)
      expect(response.content).toBe('Response with spaces')
    })

    it('should join multiple parts into single content', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  { text: 'Part 1. ' },
                  { text: 'Part 2. ' },
                  { text: 'Part 3.' },
                ],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      })

      const response = await client.generateContent(mockRequest)
      expect(response.content).toBe('Part 1. Part 2. Part 3.')
    })

    it('should include generation config in request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSuccessResponse,
      })

      const requestWithConfig: AIRequest = {
        messages: [{ role: 'user', content: 'Test' }],
        temperature: 0.9,
        topP: 0.95,
        maxTokens: 2000,
      }

      await client.generateContent(requestWithConfig)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody.generationConfig).toEqual({
        temperature: 0.9,
        topP: 0.95,
        maxOutputTokens: 2000,
      })
    })
  })

  describe('generateContentStream', () => {
    it('should stream content successfully', async () => {
      const chunks = [
        'data: {"candidates":[{"content":{"parts":[{"text":"Hello"}]}}]}\n',
        'data: {"candidates":[{"content":{"parts":[{"text":" there"}]}}]}\n',
        'data: {"candidates":[{"content":{"parts":[{"text":"!"}]}}]}\n',
      ]

      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(chunks[0]),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(chunks[1]),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(chunks[2]),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      })

      const progressCallback = jest.fn()
      const result = await client.generateContentStream(
        {
          messages: [{ role: 'user', content: 'Test' }],
          temperature: 0.7,
        },
        progressCallback
      )

      expect(result).toBe('Hello there!')
      expect(progressCallback).toHaveBeenCalledWith({
        content: 'Hello',
        done: false,
      })
      expect(progressCallback).toHaveBeenCalledWith({
        content: ' there',
        done: false,
      })
      expect(progressCallback).toHaveBeenCalledWith({
        content: '!',
        done: false,
      })
      expect(progressCallback).toHaveBeenCalledWith({ done: true })
    })

    it('should handle HTTP errors in streaming', async () => {
      const progressCallback = jest.fn()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        text: async () =>
          JSON.stringify({
            error: { message: 'Permission denied' },
          }),
      })

      await expect(
        client.generateContentStream(
          {
            messages: [{ role: 'user', content: 'Test' }],
          },
          progressCallback
        )
      ).rejects.toThrow('Permission denied')
    })

    it('should handle missing response body', async () => {
      const progressCallback = jest.fn()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: null,
      })

      await expect(
        client.generateContentStream(
          {
            messages: [{ role: 'user', content: 'Test' }],
          },
          progressCallback
        )
      ).rejects.toThrow(/No response body/)
    })

    it('should handle empty streaming response', async () => {
      const mockReader = {
        read: jest.fn().mockResolvedValueOnce({ done: true, value: undefined }),
      }

      const progressCallback = jest.fn()

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      })

      await expect(
        client.generateContentStream(
          {
            messages: [{ role: 'user', content: 'Test' }],
          },
          progressCallback
        )
      ).rejects.toThrow(/empty response/)
    })

    it('should handle malformed JSON chunks gracefully', async () => {
      const chunks = [
        'data: {"candidates":[{"content":{"parts":[{"text":"Valid"}]}}]}\n',
        'data: {invalid json}\n', // Malformed chunk
        'data: {"candidates":[{"content":{"parts":[{"text":" text"}]}}]}\n',
      ]

      const mockReader = {
        read: jest
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(chunks[0]),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(chunks[1]),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(chunks[2]),
          })
          .mockResolvedValueOnce({ done: true, value: undefined }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      })

      const progressCallback = jest.fn()
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {})

      const result = await client.generateContentStream(
        {
          messages: [{ role: 'user', content: 'Test' }],
        },
        progressCallback
      )

      expect(result).toBe('Valid text')
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to parse SSE chunk:',
        expect.any(String)
      )

      consoleWarnSpy.mockRestore()
    })
  })

  describe('testConnection', () => {
    it('should return true on successful connection', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Hi!' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      })

      const result = await client.testConnection()
      expect(result).toBe(true)
    })

    it('should return false on connection failure', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const result = await client.testConnection()
      expect(result).toBe(false)
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('should use 100 maxTokens for thinking mode', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: 'Hi!' }],
                role: 'model',
              },
              finishReason: 'STOP',
            },
          ],
        }),
      })

      await client.testConnection()

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      const requestBody = JSON.parse(fetchCall[1].body)

      expect(requestBody.generationConfig.maxOutputTokens).toBe(100)
    })
  })

  describe('fetchModels', () => {
    it('should return common Gemini models', async () => {
      const models = await client.fetchModels()

      expect(models).toEqual([
        'gemini-2.5-flash',
        'gemini-2.5-pro',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
      ])
    })

    it('should not make API calls', async () => {
      await client.fetchModels()
      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('GeminiAPIError', () => {
    it('should create error with message only', () => {
      const error = new GeminiAPIError('Test error')
      expect(error.message).toBe('Test error')
      expect(error.name).toBe('GeminiAPIError')
      expect(error.code).toBeUndefined()
      expect(error.status).toBeUndefined()
    })

    it('should create error with code and status', () => {
      const error = new GeminiAPIError('Test error', 'invalid_key', 401)
      expect(error.message).toBe('Test error')
      expect(error.code).toBe('invalid_key')
      expect(error.status).toBe(401)
    })
  })
})
