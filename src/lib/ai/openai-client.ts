'use client'

import {
  OpenAIRequest,
  OpenAIResponse,
  OpenAIError,
  StoredCredentials,
  OpenAIConfig,
  OpenAIStreamChunk,
} from '@/types/openai'
import {
  encryptData,
  decryptData,
  generateVaultKey,
} from '@/lib/utils/encryption'

const STORAGE_KEY = 'jsonresume_ai_credentials'
const REQUEST_TIMEOUT = 120000 // 120 seconds (2 minutes)
const VAULT_KEY = 'jsonresume_vault_key'

/**
 * Custom error class for OpenAI API errors
 */
export class OpenAIAPIError extends Error {
  constructor(
    public override message: string,
    public code?: string,
    public type?: string
  ) {
    super(message)
    this.name = 'OpenAIAPIError'
  }
}

/**
 * Makes a non-streaming request to OpenAI-compatible API
 */
export async function makeOpenAIRequest(
  config: OpenAIConfig,
  request: OpenAIRequest
): Promise<OpenAIResponse> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`
      try {
        const errorData: OpenAIError = await response.json()
        errorMessage = errorData.error.message || errorMessage
        throw new OpenAIAPIError(
          errorMessage,
          errorData.error.code,
          errorData.error.type
        )
      } catch (parseError) {
        if (parseError instanceof OpenAIAPIError) {
          throw parseError
        }
        throw new OpenAIAPIError(errorMessage)
      }
    }

    const data = await response.json()
    return data as OpenAIResponse
  } catch (error) {
    if (error instanceof OpenAIAPIError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new OpenAIAPIError(
          'API request timed out. The server took too long to respond.',
          'timeout'
        )
      }

      if (error.message.includes('fetch')) {
        throw new OpenAIAPIError(
          'Unable to connect to AI server. Please check the URL and ensure the server is running.',
          'network_error'
        )
      }

      throw new OpenAIAPIError(error.message)
    }

    throw new OpenAIAPIError('An unexpected error occurred')
  }
}

/**
 * Gets or creates a unique vault key for this browser
 */
function getVaultKey(): string {
  if (typeof window === 'undefined') return ''
  let key = localStorage.getItem(VAULT_KEY)
  if (!key) {
    key = generateVaultKey()
    localStorage.setItem(VAULT_KEY, key)
  }
  return key
}

/**
 * Saves API credentials and job description to localStorage
 */
export async function saveCredentials(
  credentials: StoredCredentials
): Promise<void> {
  if (typeof window === 'undefined') return

  const vaultKey = getVaultKey()

  // Encrypt sensitive data
  const encryptedApiKey = credentials.apiKey
    ? await encryptData(credentials.apiKey, vaultKey)
    : ''

  const encryptedProviderKeys: Record<string, string> = {}
  if (credentials.providerKeys) {
    for (const [url, key] of Object.entries(credentials.providerKeys)) {
      encryptedProviderKeys[url] = await encryptData(key, vaultKey)
    }
  }

  const dataToSave = credentials.rememberCredentials
    ? {
      ...credentials,
      apiKey: encryptedApiKey,
      providerKeys: encryptedProviderKeys,
    }
    : {
      apiUrl: '',
      apiKey: '',
      model: credentials.model,
      providerType: credentials.providerType,
      providerKeys: encryptedProviderKeys,
      rememberCredentials: false,
      lastJobDescription: credentials.lastJobDescription,
      skillsToHighlight: credentials.skillsToHighlight,
    }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
}

/**
 * Loads API credentials from localStorage
 */
export async function loadCredentials(): Promise<StoredCredentials | null> {
  if (typeof window === 'undefined') return null

  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return null

  try {
    const credentials = JSON.parse(saved) as StoredCredentials
    const vaultKey = getVaultKey()

    // Decrypt sensitive data
    if (credentials.apiKey) {
      try {
        credentials.apiKey = await decryptData(credentials.apiKey, vaultKey)
      } catch {
        credentials.apiKey = '' // Reset on failure
      }
    }

    if (credentials.providerKeys) {
      for (const [url, key] of Object.entries(credentials.providerKeys)) {
        try {
          credentials.providerKeys[url] = await decryptData(key, vaultKey)
        } catch {
          credentials.providerKeys[url] = ''
        }
      }
    }

    return credentials
  } catch (error) {
    console.error('Failed to parse or decrypt credentials:', error)
    return null
  }
}

/**
 * Clears stored API credentials
 */
export function clearCredentials(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

/**
 * Tests the API connection
 */
export async function testConnection(config: OpenAIConfig): Promise<boolean> {
  try {
    const request: OpenAIRequest = {
      model: config.model,
      messages: [
        {
          role: 'user',
          content: 'Hello',
        },
      ],
      max_tokens: 5,
    }

    await makeOpenAIRequest(config, request)
    return true
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[OpenAIClient] Connection test failed:', error)
    }
    return false
  }
}

/**
 * Fetches available models from the API
 */
export async function fetchAvailableModels(
  config: Pick<OpenAIConfig, 'baseURL' | 'apiKey'>
): Promise<string[]> {
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
      return data.models
        .map((model: { name: string }) => model.name.replace('models/', ''))
        .sort()
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

/**
 * Validates if the provided text is a valid job description
 */
export function validateJobDescription(text: string): boolean {
  const MIN_JD_LENGTH = 100
  if (!text) return false
  return text.trim().length >= MIN_JD_LENGTH
}
