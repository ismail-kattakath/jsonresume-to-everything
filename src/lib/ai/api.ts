import {
    OpenAIRequest,
    OpenAIResponse,
    OpenAIError,
    OpenAIConfig,
} from '@/types/openai'

const REQUEST_TIMEOUT = 120000 // 120 seconds (2 minutes)

/**
 * Custom error class for AI API errors
 */
export class AIAPIError extends Error {
    constructor(
        public override message: string,
        public code?: string,
        public type?: string
    ) {
        super(message)
        this.name = 'AIAPIError'
    }
}

/**
 * Backward compatibility alias
 */
export const OpenAIAPIError = AIAPIError

/**
 * Helper to sanitize AI errors into user-friendly messages
 */
export function sanitizeAIError(error: any): string {
    // 1. Handle string errors directly
    if (typeof error === 'string') {
        // Check if the string itself is a JSON error from Gemini
        if (error.includes('{') && error.includes('}')) {
            try {
                const parsed = JSON.parse(error)
                if (parsed.error?.message) return sanitizeAIError(parsed.error.message)
            } catch (e) { /* ignore */ }
        }
        return error
    }

    // 2. Handle standard Error objects
    const message = error.message || error.toString()

    // 3. Check for specific provider error patterns (LiteLLM, Google, etc.)

    // Rate limits / Quota
    if (
        message.includes('RateLimitError') ||
        message.includes('429') ||
        message.includes('quota') ||
        message.includes('Resource has been exhausted') ||
        message.includes('RESOURCE_EXHAUSTED')
    ) {
        return 'Rate limit exceeded. Please try again later or check your AI API quota.'
    }

    // Overloaded server / Service Unavailable
    if (
        message.includes('ServiceUnavailableError') ||
        message.includes('503') ||
        message.includes('Overloaded')
    ) {
        return 'AI Service is currently overloaded. Please try again in a few moments.'
    }

    // Context length exceeded
    if (
        message.includes('context_length_exceeded') ||
        message.includes('maximum context length')
    ) {
        return 'The document is too long for this AI model. Please try shortening your input.'
    }

    // Invalid API Key
    if (
        message.includes('InvalidAuthenticationError') ||
        message.includes('401') ||
        message.includes('invalid api key')
    ) {
        return 'Invalid API Key. Please check your settings.'
    }

    // Common raw JSON dumps (try to extract meaningful message)
    if (message.includes('{') && message.includes('}')) {
        try {
            // Attempt to find a nested "message" field in the raw string
            const match = message.match(/"message":\s*"([^"]+)"/)
            if (match && match[1]) {
                // If the extracted message is also encoded JSON, recurse
                return sanitizeAIError(match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'))
            }

            // Try direct JSON parse if it looks like a complete object
            const jsonPart = message.substring(message.indexOf('{'))
            const parsed = JSON.parse(jsonPart)
            if (parsed.error?.message) return sanitizeAIError(parsed.error.message)
            if (parsed.message) return sanitizeAIError(parsed.message)
        } catch (e) {
            // ignore parsing errors
        }
    }

    return message
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

                // Sanitize the message before throwing
                const sanitizedMessage = sanitizeAIError(errorMessage)

                throw new AIAPIError(
                    sanitizedMessage,
                    errorData.error?.code,
                    errorData.error?.type
                )
            } catch (parseError) {
                if (parseError instanceof AIAPIError) {
                    throw parseError
                }
                throw new AIAPIError(sanitizeAIError(errorMessage))
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

            // Sanitize generic errors
            throw new AIAPIError(sanitizeAIError(error))
        }

        throw new AIAPIError('An unexpected error occurred')
    }
}

import { getProviderByURL } from './providers'

/**
 * Tests the API connection and returns the actual model being used by the server
 */
export async function testConnection(config: OpenAIConfig): Promise<{
    success: boolean
    modelId?: string
}> {
    try {
        // Detect if it's Gemini - it has a different API structure
        const provider = getProviderByURL(config.baseURL)
        if (provider?.providerType === 'gemini') {
            // For Gemini, we do a basic reachability test by fetching available models
            const response = await fetch(`${config.baseURL}/models?key=${config.apiKey}`)
            return {
                success: response.ok,
                modelId: config.model,
            }
        }

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

        const response = await makeOpenAIRequest(config, request)
        return {
            success: true,
            modelId: response.model,
        }
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            // Use warn instead of error to avoid triggering the development overlay for expected test failures
            console.warn('[OpenAIClient] Connection test failed:', error)
        }
        return { success: false }
    }
}
