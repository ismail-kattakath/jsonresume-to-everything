'use client'

import React, { useState, useEffect } from 'react'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { FormInput } from '@/components/ui/FormInput'
import { FormSelect } from '@/components/ui/FormSelect'
import { FormTextarea } from '@/components/ui/FormTextarea'
import {
  PROVIDER_PRESETS,
  CUSTOM_PROVIDER,
  getProviderByURL,
} from '@/lib/ai/providers'
import { fetchAvailableModels } from '@/lib/ai/openai-client'
import { Loader2 } from 'lucide-react'

const AISettings: React.FC = () => {
  const { settings, updateSettings } = useAISettings()

  // State for provider selection
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    const provider = getProviderByURL(settings.apiUrl)
    return provider?.name || 'Custom'
  })

  // State for custom URL input
  const [customURL, setCustomURL] = useState<string>(() => {
    const provider = getProviderByURL(settings.apiUrl)
    return provider ? '' : settings.apiUrl
  })

  // State for available models
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  // Handle provider change
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerName = e.target.value
    setSelectedProvider(providerName)

    if (providerName === 'Custom') {
      // User selected custom - don't change URL yet
      return
    }

    // Find the preset and update URL
    const preset = PROVIDER_PRESETS.find((p) => p.name === providerName)
    if (preset) {
      updateSettings({ apiUrl: preset.baseURL })
      setCustomURL('')
      setAvailableModels([]) // Clear models when changing provider
    }
  }

  // Handle custom URL change
  const handleCustomURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setCustomURL(url)
    updateSettings({ apiUrl: url })
  }

  // Fetch available models when API URL or API Key changes
  useEffect(() => {
    const fetchModels = async () => {
      // Only fetch if we have both URL and key
      if (!settings.apiUrl.trim() || !settings.apiKey.trim()) {
        setAvailableModels([])
        setLoadingModels(false)
        setModelsError(null)
        return
      }

      // Validate URL format before attempting fetch
      try {
        new URL(settings.apiUrl) // Throws if invalid URL
      } catch {
        setAvailableModels([])
        setLoadingModels(false)
        setModelsError(null) // Don't show error for invalid URL - user might be typing
        return
      }

      // For custom providers, we'll try anyway
      setLoadingModels(true)
      setModelsError(null)

      try {
        const models = await fetchAvailableModels({
          baseURL: settings.apiUrl,
          apiKey: settings.apiKey,
        })

        if (models.length > 0) {
          setAvailableModels(models)
          setModelsError(null)
        } else {
          setModelsError(
            'No models found or API does not support model listing'
          )
        }
      } catch (error) {
        console.error('Failed to fetch models:', error)
        setModelsError('Failed to fetch models from API')
        setAvailableModels([])
      } finally {
        setLoadingModels(false)
      }
    }

    // Debounce the fetch
    const timeoutId = setTimeout(fetchModels, 500)
    return () => clearTimeout(timeoutId)
  }, [settings.apiUrl, settings.apiKey])

  // Provider dropdown options
  const providerOptions = [
    ...PROVIDER_PRESETS.map((p) => ({
      value: p.name,
      label: p.name,
      description: p.description,
    })),
    {
      value: CUSTOM_PROVIDER.name,
      label: CUSTOM_PROVIDER.name,
      description: CUSTOM_PROVIDER.description,
    },
  ]

  // Model dropdown options
  const modelOptions = availableModels.map((model) => ({
    value: model,
    label: model,
  }))

  const showCustomURL = selectedProvider === 'Custom'
  const showModelDropdown = availableModels.length > 0 && !loadingModels

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-white/60">
        Connect to an OpenAI-compatible API to generate tailored cover letters
        and professional summaries based on the job description.
      </p>

      {/* Provider Selection */}
      <FormSelect
        label="AI Provider"
        name="provider"
        value={selectedProvider}
        onChange={handleProviderChange}
        options={providerOptions}
        variant="blue"
        helpText="Choose a preset provider or select Custom for your own URL"
      />

      {/* API URL (only show if Custom is selected) */}
      {showCustomURL && (
        <FormInput
          label="Custom API URL"
          name="customApiUrl"
          value={customURL}
          onChange={handleCustomURLChange}
          placeholder="https://api.example.com/v1"
          variant="blue"
          helpText="Enter the base URL for your OpenAI-compatible API"
        />
      )}

      {/* API Key */}
      <FormInput
        label="API Key"
        name="apiKey"
        type="password"
        value={settings.apiKey}
        onChange={(e) => updateSettings({ apiKey: e.target.value })}
        placeholder="sk-..."
        variant="blue"
        helpText="Get from your AI provider (required for model fetching)"
      />

      {/* Model Selection */}
      {showModelDropdown ? (
        <FormSelect
          label="Model"
          name="model"
          value={settings.model}
          onChange={(e) => updateSettings({ model: e.target.value })}
          options={modelOptions}
          variant="blue"
          helpText={`${availableModels.length} models available from API`}
        />
      ) : (
        <FormInput
          label="Model"
          name="model"
          value={settings.model}
          onChange={(e) => updateSettings({ model: e.target.value })}
          placeholder="gpt-4o-mini"
          variant="blue"
          helpText={
            loadingModels
              ? 'Loading models from API...'
              : modelsError
                ? 'Enter model name manually'
                : 'Enter API key to load available models'
          }
        />
      )}

      {/* Loading indicator for models */}
      {loadingModels && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Fetching available models from API...</span>
        </div>
      )}

      {/* Job Description */}
      <FormTextarea
        label="Job Description"
        name="jobDescription"
        value={settings.jobDescription}
        onChange={(e) => updateSettings({ jobDescription: e.target.value })}
        placeholder="Paste the job description here to tailor your resume and cover letter..."
        variant="blue"
        minHeight="160px"
      />
    </div>
  )
}

export default AISettings
