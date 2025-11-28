/**
 * OpenAI API types for client-side integration
 * Compatible with OpenAI-compatible APIs (like local LM Studio)
 */

export interface OpenAIConfig {
  baseURL: string
  apiKey: string
  model: string
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

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

export interface OpenAIChoice {
  index: number
  message: OpenAIMessage
  finish_reason: string
}

export interface OpenAIUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: OpenAIChoice[]
  usage?: OpenAIUsage
}

export interface OpenAIError {
  error: {
    message: string
    type: string
    code?: string
  }
}

export interface StoredCredentials {
  apiUrl: string
  apiKey: string
  model?: string
  providerName?: string
  rememberCredentials: boolean
  lastJobDescription?: string
}

// Streaming types
export interface OpenAIStreamDelta {
  role?: 'system' | 'user' | 'assistant'
  content?: string
}

export interface OpenAIStreamChoice {
  index: number
  delta: OpenAIStreamDelta
  finish_reason: string | null
}

export interface OpenAIStreamChunk {
  id: string
  object: string
  created: number
  model: string
  choices: OpenAIStreamChoice[]
}

// Callback for streaming progress
export type StreamCallback = (chunk: {
  reasoning?: string
  content?: string
  done: boolean
}) => void
