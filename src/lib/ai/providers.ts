import { AIProviderType } from '@/types/ai-provider'

/**
 * Configuration for a specific AI provider preset.
 */
export interface ProviderPreset {
  name: string
  baseURL: string
  providerType: AIProviderType
  description: string
  requiresAuth: boolean
  apiKeyURL?: string
  supportsModels: boolean
  commonModels?: string[]
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    providerType: 'openai-compatible',
    description: 'Fast and reliable. Best for the highest quality results.',
    requiresAuth: true,
    apiKeyURL: 'https://platform.openai.com/api-keys',
    supportsModels: true,
    commonModels: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
  },
  {
    name: 'Google Gemini',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    providerType: 'gemini',
    description: "Google's state-of-the-art multimodal models.",
    requiresAuth: true,
    apiKeyURL: 'https://aistudio.google.com/app/apikey',
    supportsModels: true,
    commonModels: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash-exp'],
  },
  {
    name: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    providerType: 'openai-compatible',
    description: 'Ultra-fast inference (ideal for rapid generation).',
    requiresAuth: true,
    apiKeyURL: 'https://console.groq.com/keys',
    supportsModels: true,
    commonModels: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  },
  {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    providerType: 'openai-compatible',
    description: 'Access 100+ models via a single API.',
    requiresAuth: true,
    apiKeyURL: 'https://openrouter.ai/keys',
    supportsModels: true,
    commonModels: [
      'google/gemini-2.0-flash-exp:free',
      'google/gemini-2.0-flash-exp',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.1-405b-instruct',
    ],
  },
  {
    name: 'LM Studio',
    baseURL: 'http://localhost:1234/v1',
    providerType: 'openai-compatible',
    description: 'Local LLM inference on your own machine.',
    requiresAuth: false,
    supportsModels: true,
    commonModels: ['llama-3.1-8b-instruct', 'qwen2.5-7b-instruct'],
  },
  {
    name: 'Ollama',
    baseURL: 'http://localhost:11434/v1',
    providerType: 'openai-compatible',
    description: 'Run open-source models locally.',
    requiresAuth: false,
    supportsModels: true,
    commonModels: ['llama3.1:8b', 'gemma2:9b', 'mistral:latest'],
  },
]

export const CUSTOM_PROVIDER: ProviderPreset = {
  name: 'OpenAI Compatible',
  baseURL: '',
  providerType: 'openai-compatible',
  description: 'Connect to any OpenAI-compatible API (Ollama, LM Studio, etc.)',
  requiresAuth: true,
  supportsModels: true,
}

/**
 * Finds a provider preset that matches the given API base URL.
 * @param url The API base URL to search for.
 * @returns The matching provider preset or null.
 */
export function getProviderByURL(url: string): ProviderPreset | null {
  if (!url) return null
  return PROVIDER_PRESETS.find((p) => url.startsWith(p.baseURL)) || null
}
