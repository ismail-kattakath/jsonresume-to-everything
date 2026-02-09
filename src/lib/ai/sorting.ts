import type { AIConfig } from '@/types/ai-provider'
import { requestAISort as requestAISortOpenAI } from './openai-client'
import { GeminiClient } from './gemini-client'

/**
 * Unified AI sorting request - routes to the correct provider and enforces JSON output
 * @param config AI configuration (OpenAI-compatible or Gemini)
 * @param sortPrompt The prompt containing sorting instructions and current data
 * @param schema Optional JSON schema or example structure for the AI to follow
 */
export async function requestAISortWithProvider(
  config: {
    apiUrl: string
    apiKey: string
    model: string
    providerType: 'openai-compatible' | 'gemini'
  },
  sortPrompt: string,
  schema?: any
): Promise<string> {
  if (config.providerType === 'gemini') {
    const client = new GeminiClient({
      providerType: 'gemini',
      apiKey: config.apiKey,
      model: config.model,
      baseURL: config.apiUrl,
    })

    const response = await client.generateContent({
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
      temperature: 0.3,
      maxTokens: 2000,
      responseSchema: schema || true, // Signal JSON mode
    })

    return response.content
  }

  // OpenAI-compatible
  return requestAISortOpenAI(
    {
      baseURL: config.apiUrl,
      apiKey: config.apiKey,
      model: config.model,
    },
    sortPrompt
  )
}
