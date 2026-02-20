// @ts-nocheck
import { AIAPIError, OpenAIAPIError, sanitizeAIError, makeOpenAIRequest, testConnection } from '@/lib/ai/api'

// Mock providers module
jest.mock('@/lib/ai/providers', () => ({
  getProviderByURL: jest.fn().mockReturnValue(null),
}))

import { getProviderByURL } from '@/lib/ai/providers'

describe('AIAPIError', () => {
  it('creates error with message only', () => {
    const err = new AIAPIError('test error')
    expect(err.message).toBe('test error')
    expect(err.name).toBe('AIAPIError')
    expect(err.code).toBeUndefined()
    expect(err.type).toBeUndefined()
  })

  it('creates error with code and type', () => {
    const err = new AIAPIError('test error', 'rate_limit', 'server_error')
    expect(err.message).toBe('test error')
    expect(err.code).toBe('rate_limit')
    expect(err.type).toBe('server_error')
  })

  it('is an instance of Error', () => {
    const err = new AIAPIError('test')
    expect(err).toBeInstanceOf(Error)
  })
})

describe('OpenAIAPIError alias', () => {
  it('is the same class as AIAPIError', () => {
    expect(OpenAIAPIError).toBe(AIAPIError)
  })
})

describe('sanitizeAIError', () => {
  it('returns string errors directly', () => {
    expect(sanitizeAIError('simple error')).toBe('simple error')
  })

  it('extracts message from JSON string errors', () => {
    const jsonError = '{"error": {"message": "API quota exceeded"}}'
    const result = sanitizeAIError(jsonError)
    expect(result).toBe('API quota exceeded')
  })

  it('handles non-JSON string errors that contain braces', () => {
    const result = sanitizeAIError('Error {invalid json')
    expect(result).toBe('Error {invalid json')
  })

  it('detects rate limit errors', () => {
    const error = new Error('RateLimitError: Too many requests')
    const result = sanitizeAIError(error)
    expect(result).toContain('Rate limit')
  })

  it('detects 429 errors', () => {
    const error = new Error('Error 429: Too many requests')
    const result = sanitizeAIError(error)
    expect(result).toContain('Rate limit')
  })

  it('detects quota errors', () => {
    const error = new Error('Your quota has been exceeded')
    const result = sanitizeAIError(error)
    expect(result).toContain('Rate limit')
  })

  it('detects RESOURCE_EXHAUSTED errors', () => {
    const error = new Error('RESOURCE_EXHAUSTED: quota exceeded')
    const result = sanitizeAIError(error)
    expect(result).toContain('Rate limit')
  })

  it('detects service unavailable errors', () => {
    const error = new Error('ServiceUnavailableError: server busy')
    const result = sanitizeAIError(error)
    expect(result).toContain('overloaded')
  })

  it('detects 503 errors', () => {
    const error = new Error('503 Overloaded')
    const result = sanitizeAIError(error)
    expect(result).toContain('overloaded')
  })

  it('detects context length exceeded errors', () => {
    const error = new Error('context_length_exceeded: maximum context length is 4096')
    const result = sanitizeAIError(error)
    expect(result).toContain('too long')
  })

  it('detects invalid authentication errors', () => {
    const error = new Error('InvalidAuthenticationError: invalid api key')
    const result = sanitizeAIError(error)
    expect(result).toContain('Invalid API Key')
  })

  it('detects 401 errors', () => {
    const error = new Error('401 Unauthorized')
    const result = sanitizeAIError(error)
    expect(result).toContain('Invalid API Key')
  })

  it('extracts nested JSON message field from error message', () => {
    const error = new Error('Error occurred: {"message": "Detailed error info"}')
    const result = sanitizeAIError(error)
    expect(result).toBe('Detailed error info')
  })

  it('extracts error.message from nested JSON', () => {
    const error = new Error('{"error": {"message": "Nested error message"}}')
    const result = sanitizeAIError(error)
    expect(result).toBe('Nested error message')
  })

  it('returns toString for unrecognized errors', () => {
    const error = new Error('Some unknown error')
    expect(sanitizeAIError(error)).toBe('Some unknown error')
  })
})

describe('makeOpenAIRequest', () => {
  const mockConfig = {
    baseURL: 'https://api.openai.com',
    apiKey: 'sk-test',
    model: 'gpt-4o-mini',
  }

  const mockRequest = {
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Hello' }],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('makes a successful request', async () => {
    const mockResponse = {
      id: 'test-id',
      model: 'gpt-4o-mini',
      choices: [{ message: { content: 'Hello back!' } }],
    }

    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await makeOpenAIRequest(mockConfig, mockRequest)
    expect(result).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer sk-test',
        }),
      })
    )
  })

  it('makes request without Authorization when API key is empty', async () => {
    const configNoKey = { ...mockConfig, apiKey: '' }
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'test' }),
    })

    await makeOpenAIRequest(configNoKey, mockRequest)
    const callArgs = (global.fetch as jest.Mock).mock.calls[0]
    expect(callArgs[1].headers).not.toHaveProperty('Authorization')
  })

  it('throws AIAPIError on non-ok response with parseable error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () =>
        Promise.resolve({
          error: {
            message: 'Invalid API key',
            code: 'invalid_api_key',
            type: 'auth_error',
          },
        }),
    })

    await expect(makeOpenAIRequest(mockConfig, mockRequest)).rejects.toThrow(AIAPIError)
  })

  it('throws AIAPIError on non-ok response with unparseable error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('Invalid JSON')),
    })

    await expect(makeOpenAIRequest(mockConfig, mockRequest)).rejects.toThrow(AIAPIError)
  })

  it('throws timeout error when fetch is aborted', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(Object.assign(new Error('AbortError'), { name: 'AbortError' }))

    await expect(makeOpenAIRequest(mockConfig, mockRequest)).rejects.toThrow(/timed out/)
  })

  it('throws network error on fetch failure', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('fetch failed: ECONNREFUSED'))

    await expect(makeOpenAIRequest(mockConfig, mockRequest)).rejects.toThrow(/Unable to connect/)
  })

  it('throws AIAPIError for unexpected non-Error exceptions', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce('string error')

    await expect(makeOpenAIRequest(mockConfig, mockRequest)).rejects.toThrow(AIAPIError)
  })
})

describe('testConnection', () => {
  const mockConfig = {
    baseURL: 'https://api.openai.com',
    apiKey: 'sk-test',
    model: 'gpt-4o-mini',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getProviderByURL as jest.Mock).mockReturnValue(null)
  })

  it('returns success on valid connection', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'test',
          model: 'gpt-4o-mini',
          choices: [{ message: { content: 'Hi' } }],
        }),
    })

    const result = await testConnection(mockConfig)
    expect(result.success).toBe(true)
    expect(result.modelId).toBe('gpt-4o-mini')
  })

  it('returns failure on connection error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const result = await testConnection(mockConfig)
    expect(result.success).toBe(false)
  })

  it('uses Gemini-specific test for Gemini providers', async () => {
    ;(getProviderByURL as jest.Mock).mockReturnValue({
      providerType: 'gemini',
    })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ models: [] }),
    })

    const geminiConfig = {
      ...mockConfig,
      baseURL: 'https://generativelanguage.googleapis.com',
    }
    const result = await testConnection(geminiConfig)
    expect(result.success).toBe(true)
    expect(result.modelId).toBe('gpt-4o-mini')
    // Should call models endpoint, not chat/completions
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/models'))
  })

  it('returns failure for Gemini when API call fails', async () => {
    ;(getProviderByURL as jest.Mock).mockReturnValue({
      providerType: 'gemini',
    })
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    const result = await testConnection(mockConfig)
    expect(result.success).toBe(false)
  })
})
