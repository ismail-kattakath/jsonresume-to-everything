/**
 * OpenAI API types for client-side integration
 * Compatible with OpenAI-compatible APIs (like local LM Studio)
 */

/**
 * Configuration for connecting to an OpenAI-compatible API.
 */
export interface OpenAIConfig {
  baseURL: string
  apiKey: string
  model: string
}

/**
 * A single message in a chat completion conversation.
 */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Parameters for a chat completion request.
 */
export interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string[]
  stream?: boolean
}

/**
 * A single choice in a chat completion response.
 */
export interface OpenAIChoice {
  index: number
  message: OpenAIMessage
  finish_reason: string
}

/**
 * Token usage information for an API request.
 */
export interface OpenAIUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

/**
 * The complete response from a chat completion API.
 */
export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: OpenAIChoice[]
  usage?: OpenAIUsage
}

/**
 * Error details from an API failure.
 */
export interface OpenAIError {
  error: {
    message: string
    type: string
    code?: string
  }
}

import type { AIProviderType } from './ai-provider'

/**
 * Persistent storage structure for AI provider credentials.
 */
export interface StoredCredentials {
  apiUrl: string
  apiKey: string
  model?: string
  providerName?: string
  providerType?: AIProviderType // Type of provider (openai-compatible or gemini)
  providerKeys?: Record<string, string> // Map of provider name/URL to API key
  rememberCredentials: boolean
  lastJobDescription?: string
  skillsToHighlight?: string
}

// Streaming types
/**
 * Incremental content chunk in a streaming response.
 */
export interface OpenAIStreamDelta {
  role?: 'system' | 'user' | 'assistant'
  content?: string
}

/**
 * Choice object for a streaming response chunk.
 */
export interface OpenAIStreamChoice {
  index: number
  delta: OpenAIStreamDelta
  finish_reason: string | null
}

/**
 * A single data chunk in a streaming API response.
 */
export interface OpenAIStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: OpenAIStreamChoice[]
}

// Callback for streaming progress
/**
 * Function called when new streaming content is available.
 */
export type StreamCallback = (chunk: { reasoning?: string; content?: string; done: boolean }) => void
