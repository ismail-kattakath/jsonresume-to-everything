import { AIProviderType } from '@/types/ai-provider'

/**
 * Interface for agent configuration pulled from AISettings
 */
export interface AgentConfig {
    apiUrl: string
    apiKey: string
    model: string
    providerType: AIProviderType
}
