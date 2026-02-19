'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react'
import type { AIProviderType } from '@/types/ai-provider'
import {
  loadCredentials,
  saveCredentials,
} from '@/lib/ai/storage'
import {
  testConnection,
} from '@/lib/ai/api'
import {
  validateJobDescription,
} from '@/lib/ai/utils'
import { getProviderByURL } from '@/lib/ai/providers'

const DEFAULT_API_URL = 'https://api.openai.com/v1'
const DEFAULT_API_KEY = ''
const DEFAULT_MODEL = 'gpt-4o-mini'
const DEFAULT_JOB_DESCRIPTION = `At Supademo, we're reimagining how people experience products. Our AI-powered platform makes it effortless to create conversion-focused interactive demos at scale, with the platform already trusted by 100,000 professionals at top companies for sales, onboarding, and marketing. Since our 2023 launch, we've become G2's #5 fastest-growing software product (2025), hit profitability with 7-figure ARR, and we're just getting started.

What you'll own

Lead frontend experiences in React/Next.js, shipping polished UI that converts
Drive features end‑to‑end: scope → design → build → launch → iterate
Make pragmatic tradeoffs under ambiguity; bias to action and outcomes
Partner with customers to validate problems, gather feedback, and close loops
Shape product decisions directly with the CTO and cross‑functional leads

What makes this role special

High‑ownership builds from scratch, shipped to thousands, fast feedback cycles
Design‑first culture where details, performance, and UX quality matter
Autonomy to choose the right solution: prototype quickly, harden thoughtfully

What you bring

5+ years full‑stack with strong frontend chops in React/Next.js/TypeScript
Fluency across Node.js/APIs/microservices; comfortable working full-stack when needed
Excellent product instincts and judgment on scope, sequencing, and tradeoffs
Customer‑obsessed: can interface with customers, debug, and translate feedback into roadmap
Clear communication; thrives in ambiguity; EST collaboration hours

Nice to have

Built high‑volume, greenfield UX from zero‑to‑one
Experience in interactive, media‑rich, or editor‑style products

Perks

Remote (US/Canada), competitive salary + equity + benefits based on location
Real ownership across roadmap, architecture, and velocity

Ready to build killer products, ship end‑to‑end, and shape a category? Apply now.

Job Type: Full-time
Pay: $135,000.00-$200,000.00 per year

Benefits:
Dental care
Flexible schedule
Paid time off
Vision care

Work Location: Remote`

export interface AISettings {
  apiUrl: string
  apiKey: string
  model: string
  providerType: AIProviderType
  providerKeys: Record<string, string> // Map of provider names to keys
  jobDescription: string
  skillsToHighlight: string
  rememberCredentials: boolean
}

export type ValidationStatus = 'idle' | 'testing' | 'valid' | 'invalid'

export interface AISettingsContextType {
  settings: AISettings
  updateSettings: (updates: Partial<AISettings>) => void
  isConfigured: boolean
  connectionStatus: ValidationStatus
  jobDescriptionStatus: ValidationStatus
  validateAll: () => Promise<boolean>
  isPipelineActive: boolean
  setIsPipelineActive: (active: boolean) => void
}

const defaultSettings: AISettings = {
  apiUrl: DEFAULT_API_URL,
  apiKey: DEFAULT_API_KEY,
  model: DEFAULT_MODEL,
  providerType: 'openai-compatible',
  providerKeys: {},
  jobDescription: DEFAULT_JOB_DESCRIPTION,
  skillsToHighlight: '',
  rememberCredentials: true,
}

export const AISettingsContext = createContext<
  AISettingsContextType | undefined
>(undefined)

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings)
  const [isInitialized, setIsInitialized] = useState(false)
  const [connectionStatus, setConnectionStatus] =
    useState<ValidationStatus>('idle')
  const [jobDescriptionStatus, setJobDescriptionStatus] =
    useState<ValidationStatus>('idle')
  const [isPipelineActive, setIsPipelineActive] = useState(false)

  // Track last validated JD to avoid re-validating the same content
  const lastValidatedJD = useRef<string>('')

  // Define updateSettings FIRST because it's used in validateConnection
  const updateSettings = useCallback((updates: Partial<AISettings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates }

      // If key changed, update it in the provider-specific map
      if (updates.apiKey !== undefined) {
        newSettings.providerKeys = {
          ...newSettings.providerKeys,
          [newSettings.apiUrl]: updates.apiKey,
        }
      }

      // If URL (provider) changed, switch to the key stored for that URL
      if (updates.apiUrl !== undefined && updates.apiUrl !== prev.apiUrl) {
        newSettings.apiKey = newSettings.providerKeys[updates.apiUrl] || ''
      }

      return newSettings
    })
  }, [])

  // Validate API connection
  const validateConnection = useCallback(async () => {
    console.log('[AISettings] Validating connection...', {
      apiUrl: settings.apiUrl,
      apiKey: settings.apiKey,
      model: settings.model,
    })

    // Check if URL is present (always required)
    if (!settings.apiUrl.trim()) {
      console.log('[AISettings] Validation failed: Missing API URL')
      setConnectionStatus('invalid')
      return false
    }

    // Check if API key is required for this provider
    const provider = getProviderByURL(settings.apiUrl)
    const requiresAuth = provider ? provider.requiresAuth : true

    // Only check for API key if the provider explicitly requires it
    if (requiresAuth && !settings.apiKey.trim()) {
      console.log(
        '[AISettings] Validation failed: Missing API Key for auth-required provider'
      )
      setConnectionStatus('invalid')
      return false
    }

    setConnectionStatus('testing')

    try {
      console.log('[AISettings] Testing connection with:', {
        baseURL: settings.apiUrl,
        apiKey: settings.apiKey,
        model: settings.model,
      })

      const result = await testConnection({
        baseURL: settings.apiUrl,
        apiKey: settings.apiKey,
        model: settings.model,
      })
      console.log('[AISettings] Connection test result:', result)

      if (result.success) {
        setConnectionStatus('valid')
        // Sync model if server used a different one - ONLY for local providers
        // Local servers like LM Studio or Ollama often ignore the requested model
        const provider = getProviderByURL(settings.apiUrl)
        const isLocalProvider = provider?.name === 'LM Studio' || provider?.name === 'Ollama'

        if (isLocalProvider && result.modelId && result.modelId !== settings.model) {
          console.log('[AISettings] Local provider forced model sync:', result.modelId)
          updateSettings({ model: result.modelId })
        }
        return true
      } else {
        setConnectionStatus('invalid')
        return false
      }
    } catch (error) {
      console.warn('[AISettings] Validation error:', error)
      setConnectionStatus('invalid')
      return false
    }
  }, [settings.apiUrl, settings.apiKey, settings.model, updateSettings])

  // Validate job description (simple character count check)
  const validateJD = useCallback(() => {
    const jd = settings.jobDescription.trim()

    const isValid = validateJobDescription(jd)

    lastValidatedJD.current = jd
    setJobDescriptionStatus(isValid ? 'valid' : 'invalid')
    return isValid
  }, [settings.jobDescription])

  // Validate all settings
  const validateAll = useCallback(async () => {
    const connectionValid = await validateConnection()
    if (!connectionValid) return false

    const jdValid = validateJD()
    return jdValid
  }, [validateConnection, validateJD])

  // Load saved credentials on mount
  useEffect(() => {
    const init = async () => {
      const saved = await loadCredentials()
      if (saved) {
        setSettings((prev) => ({
          ...prev,
          apiUrl: saved.apiUrl || DEFAULT_API_URL,
          apiKey: saved.apiKey || DEFAULT_API_KEY,
          model: saved.model || DEFAULT_MODEL,
          providerType: saved.providerType || 'openai-compatible',
          providerKeys: saved.providerKeys || {},
          rememberCredentials: saved.rememberCredentials ?? true,
          jobDescription: saved.lastJobDescription || DEFAULT_JOB_DESCRIPTION,
          skillsToHighlight: saved.skillsToHighlight || '',
        }))
      }
      setIsInitialized(true)
    }
    init()
  }, [])

  // Validate connection when credentials change (with debounce)
  useEffect(() => {
    if (!isInitialized) return

    const timeoutId = setTimeout(() => {
      validateConnection()
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [
    settings.apiUrl,
    settings.apiKey,
    settings.model,
    isInitialized,
    validateConnection,
  ])

  // Validate JD when it changes (with debounce)
  useEffect(() => {
    if (!isInitialized) return

    const jd = settings.jobDescription.trim()
    if (jd === lastValidatedJD.current) return

    const timeoutId = setTimeout(() => {
      validateJD()
    }, 300) // Short debounce for simple length check

    return () => clearTimeout(timeoutId)
  }, [settings.jobDescription, isInitialized, validateJD])

  // Save credentials when they change
  useEffect(() => {
    if (!isInitialized) return

    const persist = async () => {
      await saveCredentials({
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
        model: settings.model,
        providerType: settings.providerType,
        providerKeys: settings.providerKeys,
        rememberCredentials: settings.rememberCredentials,
        lastJobDescription: settings.jobDescription,
        skillsToHighlight: settings.skillsToHighlight,
      })
    }
    persist()
  }, [settings, isInitialized])

  // isConfigured requires valid connection AND valid job description
  const isConfigured =
    connectionStatus === 'valid' && jobDescriptionStatus === 'valid'

  return (
    <AISettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isConfigured,
        connectionStatus,
        jobDescriptionStatus,
        validateAll,
        isPipelineActive,
        setIsPipelineActive,
      }}
    >
      {children}
    </AISettingsContext.Provider>
  )
}

export function useAISettings() {
  const context = useContext(AISettingsContext)
  if (!context) {
    throw new Error('useAISettings must be used within an AISettingsProvider')
  }
  return context
}
