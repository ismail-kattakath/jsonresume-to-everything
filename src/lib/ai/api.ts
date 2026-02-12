import {
    OpenAIRequest,
    OpenAIResponse,
    OpenAIError,
    OpenAIConfig,
} from '@/types/openai'

const REQUEST_TIMEOUT = 120000 // 120 seconds (2 minutes)

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
