/**
 * OpenAI-Compatible Provider Adapter
 * Adapts existing OpenAI client to IAIProvider interface
 */

import type {
  OpenAICompatibleConfig,
  AIRequest,
  AIResponse,
  IAIProvider,
} from '@/types/ai-provider'
import type { StreamCallback, OpenAIConfig } from '@/types/openai'
import {
  generateCoverLetter,
  generateSummary,
  testConnection as testOpenAIConnection,
  fetchAvailableModels,
  OpenAIAPIError,
} from './openai-client'
import type { ResumeData } from '@/types'

/**
 * OpenAI-Compatible Provider (wraps existing openai-client.ts)
 */
export class OpenAICompatibleProvider implements IAIProvider {
  private config: OpenAICompatibleConfig

  constructor(config: OpenAICompatibleConfig) {
    this.config = config
  }

  /**
   * Convert to OpenAIConfig format
   */
  private toOpenAIConfig(): OpenAIConfig {
    return {
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey,
      model: this.config.model,
    }
  }

  /**
   * Generate content (non-streaming)
   * Note: This is a simplified implementation
   * For full functionality, use the existing functions in openai-client.ts
   */
  async generateContent(request: AIRequest): Promise<AIResponse> {
    // This is a basic implementation
    // Real usage should use generateCoverLetterWithAI or generateSummaryWithAI
    throw new OpenAIAPIError(
      'Direct content generation not supported. Use generateCoverLetterWithAI or generateSummaryWithAI instead.',
      'not_implemented'
    )
  }

  /**
   * Generate content (streaming)
   * Note: This is a simplified implementation
   * For full functionality, use the existing streaming functions in openai-client.ts
   */
  async generateContentStream(
    request: AIRequest,
    onProgress: StreamCallback
  ): Promise<string> {
    // This is a basic implementation
    // Real usage should use the streaming functions in openai-client.ts
    throw new OpenAIAPIError(
      'Direct streaming not supported. Use the streaming functions in openai-client.ts instead.',
      'not_implemented'
    )
  }

  /**
   * Test connection to OpenAI-compatible API
   */
  async testConnection(): Promise<boolean> {
    return testOpenAIConnection(this.toOpenAIConfig())
  }

  /**
   * Fetch available models from OpenAI-compatible API
   */
  async fetchModels(): Promise<string[]> {
    return fetchAvailableModels(this.toOpenAIConfig())
  }
}

/**
 * Helper: Generate cover letter using OpenAI-compatible API
 */
export async function generateCoverLetterWithProvider(
  config: OpenAICompatibleConfig,
  resumeData: ResumeData,
  jobDescription: string,
  onProgress: StreamCallback
): Promise<string> {
  const openAIConfig: OpenAIConfig = {
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    model: config.model,
  }
  return generateCoverLetter(
    openAIConfig,
    resumeData,
    jobDescription,
    onProgress
  )
}

/**
 * Helper: Generate summary using OpenAI-compatible API
 */
export async function generateSummaryWithProvider(
  config: OpenAICompatibleConfig,
  resumeData: ResumeData,
  jobDescription: string,
  onProgress: StreamCallback
): Promise<string> {
  const openAIConfig: OpenAIConfig = {
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    model: config.model,
  }
  return generateSummary(openAIConfig, resumeData, jobDescription, onProgress)
}
