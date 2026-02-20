/**
 * AI Provider abstraction types
 * Supports multiple AI providers with different API formats
 */

import type { StreamCallback } from './openai'
export type { StreamCallback }

/**
 * Supported AI provider types
 */
export type AIProviderType = 'openai-compatible' | 'gemini'

/**
 * Base configuration for all AI providers
 */
export interface BaseAIConfig {
  providerType: AIProviderType
  apiKey: string
  model: string
}

/**
 * OpenAI-compatible provider configuration
 */
export interface OpenAICompatibleConfig extends BaseAIConfig {
  providerType: 'openai-compatible'
  baseURL: string
}

/**
 * Gemini provider configuration
 */
export interface GeminiConfig extends BaseAIConfig {
  providerType: 'gemini'
  baseURL?: string // Optional, defaults to Google's endpoint
}

/**
 * Union type for all provider configurations
 */
export type AIConfig = OpenAICompatibleConfig | GeminiConfig

/**
 * Unified message format (provider-agnostic)
 */
export interface AIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Unified request format (provider-agnostic)
 */
export interface AIRequest {
  messages: AIMessage[]
  temperature?: number
  maxTokens?: number
  topP?: number
}

/**
 * Unified response format (provider-agnostic)
 */
export interface AIResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * AI Provider interface - all providers must implement this
 */
export interface IAIProvider {
  /**
   * Generate content (non-streaming)
   */
  generateContent(request: AIRequest): Promise<AIResponse>

  /**
   * Generate content (streaming)
   */
  generateContentStream(request: AIRequest, onProgress: StreamCallback): Promise<string>

  /**
   * Test connection to provider
   */
  testConnection(): Promise<boolean>

  /**
   * Fetch available models (if supported)
   */
  fetchModels?(): Promise<string[]>
}
