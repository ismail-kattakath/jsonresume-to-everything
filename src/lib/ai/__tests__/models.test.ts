import { fetchAvailableModels } from '@/lib/ai/models'

// Mock global fetch
global.fetch = jest.fn()

describe('fetchAvailableModels', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns empty array if no baseURL is provided', async () => {
    const result = await fetchAvailableModels({ baseURL: '', apiKey: 'test' })
    expect(result).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns empty array if Gemini provider lacks API key', async () => {
    const result = await fetchAvailableModels({
      baseURL: 'https://generativelanguage.googleapis.com',
      apiKey: '',
    })
    expect(result).toEqual([])
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetches Gemini models correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        models: [{ name: 'models/gemini-pro' }, { name: 'models/gemini-ultra' }],
      }),
    })

    const result = await fetchAvailableModels({
      baseURL: 'https://generativelanguage.googleapis.com',
      apiKey: 'key123',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/models?key=key123',
      expect.objectContaining({ method: 'GET' })
    )
    // Sorts and strips 'models/'
    expect(result).toEqual(['gemini-pro', 'gemini-ultra'])
  })

  it('fetches OpenRouter models and passes specific headers', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 'openai/gpt-4' }, { id: 'anthropic/claude-3' }],
      }),
    })

    const result = await fetchAvailableModels({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: 'sk-or-test',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/models',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-or-test',
          'HTTP-Referer': 'https://github.com/ismail-kattakath/jsonresume-to-everything',
          'X-Title': 'JSON Resume to Everything',
        }),
      })
    )
    expect(result).toEqual(['anthropic/claude-3', 'openai/gpt-4'])
  })

  it('fetches OpenAI format models correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 'gpt-3.5-turbo' }, { id: 'gpt-4o' }],
      }),
    })

    const result = await fetchAvailableModels({
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'sk-test',
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/models',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer sk-test',
        },
      })
    )
    expect(result).toEqual(['gpt-3.5-turbo', 'gpt-4o'])
  })

  it('handles direct array response (e.g. Ollama)', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 'llama3' }, { id: 'mistral' }],
    })

    const result = await fetchAvailableModels({
      baseURL: 'http://localhost:11434/v1',
      apiKey: '', // Testing without api key
    })

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:11434/v1/models',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )
    // Note standard alphabetical sort applied by models.ts
    expect(result).toEqual(['llama3', 'mistral'])
  })

  it('returns empty array if response is not ok', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    const result = await fetchAvailableModels({
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'bad',
    })
    expect(result).toEqual([])
  })

  it('returns empty array for unexpected data structure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: 'data' }),
    })

    const result = await fetchAvailableModels({
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'test',
    })
    expect(result).toEqual([])
  })

  it('handles fetch abort timeout', async () => {
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => {
      return new Promise((_, reject) => {
        const error = new Error('AbortError')
        error.name = 'AbortError'
        reject(error)
      })
    })

    const result = await fetchAvailableModels({
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'test',
    })
    expect(result).toEqual([])
  })

  it('handles fetch network error', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Failed'))

    const consoleSpy = jest.spyOn(console, 'debug').mockImplementation(() => {})
    const result = await fetchAvailableModels({
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'test',
    })

    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Model fetch failed:', 'Network Failed')
    consoleSpy.mockRestore()
  })
})
