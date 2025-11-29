/**
 * Unified Document Generator
 * Routes to appropriate provider (OpenAI-compatible or Gemini)
 */

import type { ResumeData } from '@/types'
import type { StreamCallback } from '@/types/openai'
import type { ProviderPreset } from './providers'
import {
  generateCoverLetter as generateCoverLetterOpenAI,
  generateSummary as generateSummaryOpenAI,
  OpenAIAPIError,
} from './openai-client'
import {
  generateCoverLetterWithGemini,
  generateSummaryWithGemini,
} from './gemini-documents'
import { GeminiAPIError } from './gemini-client'

/**
 * Generate cover letter using the appropriate provider
 */
export async function generateCoverLetterWithProvider(
  resumeData: ResumeData,
  jobDescription: string,
  apiUrl: string,
  apiKey: string,
  model: string,
  providerType: 'openai-compatible' | 'gemini',
  onProgress?: StreamCallback
): Promise<string> {
  if (providerType === 'gemini') {
    return generateCoverLetterWithGemini(
      resumeData,
      jobDescription,
      apiKey,
      model,
      onProgress
    )
  }

  // OpenAI-compatible
  return generateCoverLetterOpenAI(
    { baseURL: apiUrl, apiKey, model },
    resumeData,
    jobDescription,
    onProgress
  )
}

/**
 * Generate summary using the appropriate provider
 */
export async function generateSummaryWithProvider(
  resumeData: ResumeData,
  jobDescription: string,
  apiUrl: string,
  apiKey: string,
  model: string,
  providerType: 'openai-compatible' | 'gemini',
  onProgress?: StreamCallback
): Promise<string> {
  if (providerType === 'gemini') {
    return generateSummaryWithGemini(
      resumeData,
      jobDescription,
      apiKey,
      model,
      onProgress
    )
  }

  // OpenAI-compatible
  return generateSummaryOpenAI(
    { baseURL: apiUrl, apiKey, model },
    resumeData,
    jobDescription,
    onProgress
  )
}

/**
 * Determine provider type from provider preset
 */
export function getProviderTypeFromPreset(
  provider: ProviderPreset | null
): 'openai-compatible' | 'gemini' {
  return provider?.providerType || 'openai-compatible'
}

/**
 * Export error types for convenience
 */
export { OpenAIAPIError, GeminiAPIError }
export type AIError = OpenAIAPIError | GeminiAPIError
