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
  const { settings, updateSettings, connectionStatus } = useAISettings()

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

  // Sync provider selection when settings.apiUrl changes (e.g., loaded from localStorage)
  useEffect(() => {
    const provider = getProviderByURL(settings.apiUrl)
    const detectedProvider = provider?.name || 'Custom'

    if (detectedProvider !== selectedProvider) {
      setSelectedProvider(detectedProvider)
      setCustomURL(provider ? '' : settings.apiUrl)
    }
  }, [settings.apiUrl]) // Only depend on apiUrl, not selectedProvider to avoid loops

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

      // Auto-select first common model if available (will be updated when API models are fetched)
      if (preset.commonModels && preset.commonModels.length > 0) {
        updateSettings({ model: preset.commonModels[0] })
      }
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
      // Reset state first
      setModelsError(null)

      // Only fetch if we have both URL and key
      if (!settings.apiUrl.trim() || !settings.apiKey.trim()) {
        setAvailableModels([])
        setLoadingModels(false)
        return
      }

      // Validate URL format before attempting fetch
      try {
        new URL(settings.apiUrl)
      } catch {
        // Invalid URL - don't show error, user might be typing
        setAvailableModels([])
        setLoadingModels(false)
        return
      }

      // Detect provider mismatch - skip fetch until sync completes
      const detectedProvider = getProviderByURL(settings.apiUrl)
      if (detectedProvider && selectedProvider !== detectedProvider.name) {
        // The sync useEffect will fix this, so skip this fetch
        return
      }

      setLoadingModels(true)

      try {
        const models = await fetchAvailableModels({
          baseURL: settings.apiUrl,
          apiKey: settings.apiKey,
        })

        if (models.length > 0) {
          setAvailableModels(models)
          setModelsError(null)
        } else {
          setAvailableModels([])
          setModelsError(
            'No models found or API does not support model listing'
          )
        }
      } catch (error) {
        console.error('[AISettings] Model fetch error:', error)
        setModelsError('Failed to fetch models from API')
        setAvailableModels([])
      } finally {
        setLoadingModels(false)
      }
    }

    // Debounce to avoid excessive API calls
    const timeoutId = setTimeout(fetchModels, 500)
    return () => clearTimeout(timeoutId)
  }, [settings.apiUrl, settings.apiKey, selectedProvider])

  // Auto-select first model when available models change
  useEffect(() => {
    if (availableModels.length > 0) {
      // Check if current model is in the list, if not, select the first one
      if (!availableModels.includes(settings.model)) {
        console.log(
          '[AISettings] Auto-selecting first model:',
          availableModels[0]
        )
        updateSettings({ model: availableModels[0] })
      }
    }
  }, [availableModels, settings.model, updateSettings])

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

  // Get current provider for common models fallback
  const currentProvider = PROVIDER_PRESETS.find(
    (p) => p.name === selectedProvider
  )

  // Model dropdown options - use API models or fallback to common models
  const hasApiModels = availableModels.length > 0
  const hasCommonModels =
    currentProvider?.commonModels && currentProvider.commonModels.length > 0

  const modelOptions = hasApiModels
    ? availableModels.map((model) => ({
        value: model,
        label: model,
      }))
    : hasCommonModels
      ? currentProvider.commonModels!.map((model) => ({
          value: model,
          label: model,
        }))
      : []

  const showCustomURL = selectedProvider === 'Custom'
  const showModelDropdown = modelOptions.length > 0 && !loadingModels
  const usingFallbackModels = !hasApiModels && hasCommonModels

  // Format status messages
  const getConnectionStatusMessage = () => {
    if (!settings.apiKey || !settings.apiUrl) {
      return { text: 'No credentials configured', color: 'text-white/40' }
    }

    switch (connectionStatus) {
      case 'testing':
        return { text: 'Testing connection...', color: 'text-yellow-400' }
      case 'valid':
        return { text: '✓ Connected successfully', color: 'text-green-400' }
      case 'invalid':
        return { text: '✗ Connection failed', color: 'text-red-400' }
      default:
        return { text: 'Ready to connect', color: 'text-white/60' }
    }
  }

  const getModelStatusMessage = () => {
    if (loadingModels) {
      return { text: 'Fetching models...', color: 'text-yellow-400' }
    }
    if (modelsError) {
      return { text: `✗ ${modelsError}`, color: 'text-red-400' }
    }
    if (hasApiModels) {
      return {
        text: `✓ ${availableModels.length} models loaded from API`,
        color: 'text-green-400',
      }
    }
    if (hasCommonModels) {
      return {
        text: `${currentProvider?.commonModels?.length} common models (enter API key for full list)`,
        color: 'text-blue-400',
      }
    }
    return null
  }

  const connectionStatusMsg = getConnectionStatusMessage()
  const modelStatusMsg = getModelStatusMessage()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-white/60">
        Connect to an OpenAI-compatible API to generate tailored cover letters
        and professional summaries based on the job description.
      </p>

      {/* Connection Status Log */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs">
        <div className="mb-1 font-semibold text-white/80">
          Connection Status
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white/40">API:</span>
            <span className={connectionStatusMsg.color}>
              {connectionStatusMsg.text}
            </span>
          </div>
          {modelStatusMsg && (
            <div className="flex items-center gap-2">
              <span className="text-white/40">Models:</span>
              <span className={modelStatusMsg.color}>
                {modelStatusMsg.text}
              </span>
            </div>
          )}
          {settings.model && (
            <div className="flex items-center gap-2">
              <span className="text-white/40">Selected:</span>
              <span className="text-white/60">{settings.model}</span>
            </div>
          )}
        </div>
      </div>

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
          helpText={
            usingFallbackModels
              ? `Showing common ${selectedProvider} models - enter API key to fetch all available models`
              : `${availableModels.length} models available from API`
          }
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
