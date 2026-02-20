import { OpenAIConfig } from '@/types/openai'

/**
 * Fetches available models from the API
 */
export async function fetchAvailableModels(config: Pick<OpenAIConfig, 'baseURL' | 'apiKey'>): Promise<string[]> {
  try {
    if (!config.baseURL) return []

    const isGemini = config.baseURL.includes('generativelanguage.googleapis.com')
    const isOpenRouter = config.baseURL.includes('openrouter.ai')

    let endpoint: string
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (isGemini) {
      if (!config.apiKey) return []
      endpoint = `${config.baseURL}/models?key=${config.apiKey}`
    } else {
      endpoint = `${config.baseURL}/models`
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
      }
      if (isOpenRouter) {
        headers['HTTP-Referer'] = 'https://github.com/ismail-kattakath/jsonresume-to-everything'
        headers['X-Title'] = 'JSON Resume to Everything'
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) return []

    const data = await response.json()

    if (isGemini && data.models && Array.isArray(data.models)) {
      return data.models.map((model: { name: string }) => model.name.replace('models/', '')).sort()
    }

    if (data.data && Array.isArray(data.data)) {
      return data.data.map((model: { id: string }) => model.id).sort()
    }

    if (Array.isArray(data)) {
      return data.map((model: { id: string }) => model.id).sort()
    }

    return []
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      console.debug('Model fetch failed:', error.message)
    }
    return []
  }
}
