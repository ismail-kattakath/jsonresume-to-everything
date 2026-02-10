import type {
  OpenAIConfig,
  OpenAIRequest,
  OpenAIResponse,
  OpenAIError,
  StoredCredentials,
  StreamCallback,
  OpenAIStreamChunk,
} from '@/types/openai'
import type { ResumeData } from '@/types'
import {
  buildCoverLetterPrompt,
  validateCoverLetter,
  postProcessCoverLetter,
  buildSummaryPrompt,
  validateSummary,
  buildJobTitlePrompt,
  validateJobTitle,
  postProcessJobTitle,
  buildSkillsToHighlightPrompt,
} from '@/lib/ai/document-prompts'

const STORAGE_KEY = 'jsonresume_ai_credentials'
const REQUEST_TIMEOUT = 120000 // 120 seconds (2 minutes) - increased for thinking models like OLMo-3

/**
 * Custom error class for OpenAI API errors
 */
export class OpenAIAPIError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly type?: string
  ) {
    super(message)
    this.name = 'OpenAIAPIError'
  }
}

/**
 * Makes a request to OpenAI-compatible API
 */
async function makeOpenAIRequest(
  config: OpenAIConfig,
  request: OpenAIRequest
): Promise<OpenAIResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Try to parse error response
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
        // If can't parse error, throw generic error
        if (parseError instanceof OpenAIAPIError) {
          throw parseError
        }
        throw new OpenAIAPIError(errorMessage)
      }
    }

    const data: OpenAIResponse = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    if (error instanceof OpenAIAPIError) {
      throw error
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new OpenAIAPIError(
          'Request timed out after 2 minutes. The model may be too slow or the server is overloaded. Try using a faster model or check your server status.',
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
 * Makes a streaming request to OpenAI-compatible API
 */
async function makeOpenAIStreamRequest(
  config: OpenAIConfig,
  request: OpenAIRequest,
  onProgress: StreamCallback
): Promise<string> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (config.apiKey) {
      headers['Authorization'] = `Bearer ${config.apiKey}`
    }

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...request, stream: true }),
    })

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

    if (!response.body) {
      throw new OpenAIAPIError('No response body received', 'no_body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onProgress({ done: true })
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || '' // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue

        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6)
          try {
            const chunk: OpenAIStreamChunk = JSON.parse(jsonStr)
            const delta = chunk.choices[0]?.delta

            if (delta?.content) {
              fullContent += delta.content

              // Send progress update
              onProgress({
                content: delta.content,
                done: false,
              })
            }
          } catch {
            console.warn('Failed to parse SSE chunk:', jsonStr)
          }
        }
      }
    }

    if (!fullContent || fullContent.trim().length === 0) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try again.',
        'empty_response'
      )
    }

    return fullContent
  } catch (error) {
    if (error instanceof OpenAIAPIError) {
      throw error
    }

    if (error instanceof Error) {
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
 * Generates a cover letter using OpenAI API with streaming support
 */
export async function generateCoverLetter(
  config: OpenAIConfig,
  resumeData: ResumeData,
  jobDescription: string,
  onProgress?: StreamCallback
): Promise<string> {
  // Build the prompt
  const prompt = buildCoverLetterPrompt(resumeData, jobDescription)

  // Prepare the request
  const request: OpenAIRequest = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional cover letter writer with expertise in highlighting candidate strengths and tailoring content to job requirements. You write compelling, specific, and achievement-focused cover letters.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 800,
    top_p: 0.9,
  }

  // Use streaming if callback provided, otherwise use regular request
  let generatedContent: string

  if (onProgress) {
    generatedContent = await makeOpenAIStreamRequest(
      config,
      request,
      onProgress
    )
  } else {
    // Make the API request (non-streaming for backward compatibility)
    const response = await makeOpenAIRequest(config, request)

    // Extract the generated text
    const choice = response.choices[0]
    if (
      !choice ||
      !choice.message.content ||
      choice.message.content.trim().length === 0
    ) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try rephrasing the job description.',
        'empty_content'
      )
    }

    generatedContent = choice.message.content
  }

  // Post-process the content
  const processedContent = postProcessCoverLetter(generatedContent)

  // Validate the content
  const validation = validateCoverLetter(processedContent)
  if (!validation.isValid) {
    console.warn('Cover letter validation warnings:', validation.errors)
    // Still return the content, but log warnings
  }

  return processedContent
}

/**
 * Generates a professional summary using OpenAI API with streaming support
 */
export async function generateSummary(
  config: OpenAIConfig,
  resumeData: ResumeData,
  jobDescription: string,
  onProgress?: StreamCallback
): Promise<string> {
  // Build the comprehensive system prompt with resume data and job description
  const systemPrompt = buildSummaryPrompt(resumeData, jobDescription)

  // Prepare the request
  const request: OpenAIRequest = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: 'Generate the professional summary now.',
      },
    ],
    temperature: 0.5, // Lower temperature for consistent output
    max_tokens: 150, // Constrained to enforce ~500 char output
    top_p: 0.9,
  }

  // Use streaming if callback provided, otherwise use regular request
  let generatedContent: string

  if (onProgress) {
    generatedContent = await makeOpenAIStreamRequest(
      config,
      request,
      onProgress
    )
  } else {
    // Make the API request (non-streaming for backward compatibility)
    const response = await makeOpenAIRequest(config, request)

    // Extract the generated text
    const choice = response.choices[0]
    if (
      !choice ||
      !choice.message.content ||
      choice.message.content.trim().length === 0
    ) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try rephrasing the job description.',
        'empty_content'
      )
    }

    generatedContent = choice.message.content
  }

  // Validate the content (informational only - do not modify AI output)
  const validation = validateSummary(generatedContent)
  if (!validation.isValid) {
    console.warn('Summary validation warnings:', validation.errors)
    // Still return the content as-is, but log warnings
  }

  return generatedContent
}

/**
 * Generates a job title using OpenAI API with streaming support
 */
export async function generateJobTitle(
  config: OpenAIConfig,
  resumeData: ResumeData,
  jobDescription: string,
  onProgress?: StreamCallback
): Promise<string> {
  // Build the prompt
  const prompt = buildJobTitlePrompt(resumeData, jobDescription)

  // Prepare the request
  const request: OpenAIRequest = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional resume writer specializing in job title optimization. You generate concise, professional job titles that match target roles.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5, // Lower temperature for more consistent titles
    max_tokens: 50, // Job titles are short
    top_p: 0.9,
  }

  // Use streaming if callback provided, otherwise use regular request
  let generatedContent: string

  if (onProgress) {
    generatedContent = await makeOpenAIStreamRequest(
      config,
      request,
      onProgress
    )
  } else {
    // Make the API request (non-streaming for backward compatibility)
    const response = await makeOpenAIRequest(config, request)

    // Extract the generated text
    const choice = response.choices[0]
    if (
      !choice ||
      !choice.message.content ||
      choice.message.content.trim().length === 0
    ) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try again.',
        'empty_content'
      )
    }

    generatedContent = choice.message.content
  }

  // Post-process the content
  const processedContent = postProcessJobTitle(generatedContent)

  // Validate the content
  const validation = validateJobTitle(processedContent)
  if (!validation.isValid) {
    console.warn('Job title validation warnings:', validation.errors)
    // Still return the content, but log warnings
  }

  return processedContent
}

/**
 * Generates skills to highlight based on JD using OpenAI-compatible API
 */
export async function generateSkillsToHighlight(
  config: OpenAIConfig,
  jobDescription: string,
  onProgress?: StreamCallback
): Promise<string> {
  // Build the prompt
  const prompt = buildSkillsToHighlightPrompt(jobDescription)

  // Prepare the request
  const request: OpenAIRequest = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional resume writer specializing in technical skills optimization. You identify key keywords from job descriptions to highlight on a resume.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 200, // Comma separated list is short
    top_p: 0.9,
  }

  // Use streaming if callback provided, otherwise use regular request
  if (onProgress) {
    return await makeOpenAIStreamRequest(config, request, onProgress)
  } else {
    const response = await makeOpenAIRequest(config, request)
    const choice = response.choices[0]
    if (
      !choice ||
      !choice.message.content ||
      choice.message.content.trim().length === 0
    ) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try again.',
        'empty_content'
      )
    }
    const content = choice.message.content
    return content.trim()
  }
}

import {
  encryptData,
  decryptData,
  generateVaultKey,
} from '@/lib/utils/encryption'

const VAULT_KEY = 'jsonresume_vault_key'

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
        providerKeys: encryptedProviderKeys, // We still encrypt these
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
 * Uses the standard OpenAI-compatible /models endpoint
 * Note: baseURL should already include /v1 or /api/v1
 */
export async function fetchAvailableModels(
  config: Pick<OpenAIConfig, 'baseURL' | 'apiKey'>
): Promise<string[]> {
  try {
    // Validate inputs - only baseURL is required
    if (!config.baseURL) {
      return []
    }

    const isGemini = config.baseURL.includes(
      'generativelanguage.googleapis.com'
    )
    const isOpenRouter = config.baseURL.includes('openrouter.ai')

    // Prepare endpoint and headers
    let endpoint: string
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (isGemini) {
      // Gemini format: baseURL/models?key=apiKey
      if (!config.apiKey) {
        return [] // Gemini requires API key
      }
      endpoint = `${config.baseURL}/models?key=${config.apiKey}`
    } else {
      // OpenAI/standard format: baseURL/models with Authorization header
      endpoint = `${config.baseURL}/models`

      // Only add Authorization header if apiKey is provided
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`
      }

      if (isOpenRouter) {
        headers['HTTP-Referer'] =
          'https://github.com/ismail-kattakath/jsonresume-to-everything'
        headers['X-Title'] = 'JSON Resume to Everything'
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(endpoint, {
      method: 'GET',
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return []
    }

    const data = await response.json()

    // Gemini format: { models: [{ name: "models/gemini-1.5-flash", ... }, ...] }
    if (isGemini && data.models && Array.isArray(data.models)) {
      return data.models
        .map((model: { name: string }) => model.name.replace('models/', ''))
        .sort()
    }

    // OpenAI/most providers format: { data: [{ id: "model-name" }, ...] }
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((model: { id: string }) => model.id).sort()
    }

    // Fallback for other formats
    if (Array.isArray(data)) {
      return data.map((model: { id: string }) => model.id).sort()
    }

    return []
  } catch (error) {
    // Don't log network errors - they're expected during typing
    if (error instanceof Error && error.name !== 'AbortError') {
      console.debug(
        'Model fetch failed (expected during typing):',
        error.message
      )
    }
    return []
  }
}

/**
 * Validates if the provided text is a valid job description
 * Returns true if text is non-empty and has reasonable length
 */
export function validateJobDescription(text: string): boolean {
  const MIN_JD_LENGTH = 100 // Minimum characters for a valid job description

  if (!text) {
    return false
  }

  const trimmed = text.trim()
  return trimmed.length >= MIN_JD_LENGTH
}

/**
 * Generic AI sorting request - sends a sorting prompt and returns raw response
 * Used by both skills and achievements sorting
 */
export async function requestAISort(
  config: OpenAIConfig,
  sortPrompt: string
): Promise<string> {
  const request: OpenAIRequest = {
    model: config.model,
    messages: [
      {
        role: 'system',
        content:
          'You are a JSON-only response bot. You return valid JSON without any explanation, markdown, or code blocks.',
      },
      {
        role: 'user',
        content: sortPrompt,
      },
    ],
    temperature: 0.3, // Lower temperature for more consistent sorting
    max_tokens: 2000, // Sufficient for sorting responses
    top_p: 0.9,
  }

  const response = await makeOpenAIRequest(config, request)

  const choice = response.choices[0]
  if (
    !choice ||
    !choice.message.content ||
    choice.message.content.trim().length === 0
  ) {
    throw new OpenAIAPIError(
      'AI generated an empty response. Please try again.',
      'empty_content'
    )
  }

  const content = choice.message.content

  return content
}
