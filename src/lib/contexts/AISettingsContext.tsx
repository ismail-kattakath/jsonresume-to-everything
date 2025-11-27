'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loadCredentials, saveCredentials } from '@/lib/ai/openai-client'

const DEFAULT_API_URL = 'https://api.openai.com'
const DEFAULT_MODEL = 'gpt-4o-mini'

export interface AISettings {
  apiUrl: string
  apiKey: string
  model: string
  jobDescription: string
  rememberCredentials: boolean
}

export interface AISettingsContextType {
  settings: AISettings
  updateSettings: (updates: Partial<AISettings>) => void
  isConfigured: boolean
}

const defaultSettings: AISettings = {
  apiUrl: DEFAULT_API_URL,
  apiKey: '',
  model: DEFAULT_MODEL,
  jobDescription: '',
  rememberCredentials: false,
}

export const AISettingsContext = createContext<AISettingsContextType>({
  settings: defaultSettings,
  updateSettings: () => {},
  isConfigured: false,
})

export function AISettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AISettings>(defaultSettings)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load saved credentials on mount
  useEffect(() => {
    const saved = loadCredentials()
    if (saved) {
      setSettings((prev) => ({
        ...prev,
        apiUrl: saved.rememberCredentials ? saved.apiUrl || DEFAULT_API_URL : DEFAULT_API_URL,
        apiKey: saved.rememberCredentials ? saved.apiKey || '' : '',
        rememberCredentials: saved.rememberCredentials || false,
        jobDescription: saved.lastJobDescription || '',
      }))
    }
    setIsInitialized(true)
  }, [])

  // Save credentials when they change
  useEffect(() => {
    if (!isInitialized) return

    saveCredentials({
      apiUrl: settings.apiUrl,
      apiKey: settings.apiKey,
      rememberCredentials: settings.rememberCredentials,
      lastJobDescription: settings.jobDescription,
    })
  }, [settings, isInitialized])

  const updateSettings = (updates: Partial<AISettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }

  const isConfigured =
    settings.apiUrl.trim() !== '' &&
    settings.apiKey.trim() !== '' &&
    settings.jobDescription.trim() !== ''

  return (
    <AISettingsContext.Provider value={{ settings, updateSettings, isConfigured }}>
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
