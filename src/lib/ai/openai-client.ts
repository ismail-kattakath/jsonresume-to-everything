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
} from '@/lib/ai/document-prompts'

const STORAGE_KEY = 'ai_cover_letter_credentials'
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
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
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
    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
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
    if (!response.choices || response.choices.length === 0) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try again.',
        'empty_response'
      )
    }

    generatedContent = response.choices[0].message.content

    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try rephrasing the job description.',
        'empty_content'
      )
    }
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
    temperature: 0.7,
    max_tokens: 600, // Summaries are typically shorter than cover letters
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
    if (!response.choices || response.choices.length === 0) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try again.',
        'empty_response'
      )
    }

    generatedContent = response.choices[0].message.content

    if (!generatedContent || generatedContent.trim().length === 0) {
      throw new OpenAIAPIError(
        'AI generated an empty response. Please try rephrasing the job description.',
        'empty_content'
      )
    }
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
 * Saves API credentials and job description to localStorage
 */
export function saveCredentials(credentials: StoredCredentials): void {
  if (typeof window === 'undefined') return

  if (credentials.rememberCredentials) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
  } else {
    // Clear credentials but keep job description and model if provided
    if (credentials.lastJobDescription || credentials.model) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          apiUrl: '',
          apiKey: '',
          model: credentials.model,
          rememberCredentials: false,
          lastJobDescription: credentials.lastJobDescription,
        })
      )
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

/**
 * Loads API credentials from localStorage
 */
export function loadCredentials(): StoredCredentials | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null

    const credentials: StoredCredentials = JSON.parse(stored)
    return credentials
  } catch (error) {
    console.error('Failed to load credentials:', error)
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
  } catch {
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
    // Validate inputs
    if (!config.baseURL || !config.apiKey) {
      return []
    }

    // All providers: baseURL already includes /v1 or /api/v1, just append /models
    const endpoint = `${config.baseURL}/models`
    const isOpenRouter = config.baseURL.includes('openrouter.ai')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        ...(isOpenRouter && {
          'HTTP-Referer':
            'https://github.com/ismail-kattakath/jsonresume-to-everything',
          'X-Title': 'JSON Resume to Everything',
        }),
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return []
    }

    const data = await response.json()

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

  if (!response.choices || response.choices.length === 0) {
    throw new OpenAIAPIError(
      'AI generated an empty response. Please try again.',
      'empty_response'
    )
  }

  const content = response.choices[0].message.content

  if (!content || content.trim().length === 0) {
    throw new OpenAIAPIError(
      'AI generated an empty response. Please try again.',
      'empty_content'
    )
  }

  return content
}
