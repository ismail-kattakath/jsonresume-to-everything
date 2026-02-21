'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Loader2 } from 'lucide-react'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { fetchAvailableModels } from '@/lib/ai/models'
import { PROVIDER_PRESETS, getProviderByURL, CUSTOM_PROVIDER } from '@/lib/ai/providers'

// Sub-components
import ConnectionStatusIndicator from './ai-settings/connection-status-indicator'
import ProviderSelector from './ai-settings/provider-selector'
import APIKeyInput from './ai-settings/api-key-input'
import ModelSelector from './ai-settings/model-selector'

const AISettings = () => {
  const { settings, updateSettings, isConfigured, connectionStatus } = useAISettings()

  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)

  // Initialize selected provider from URL
  const [selectedProvider, setSelectedProvider] = useState<string>(() => {
    const p = getProviderByURL(settings.apiUrl)
    return p ? p.name : CUSTOM_PROVIDER.name
  })

  const [customURL, setCustomURL] = useState(settings.apiUrl)

  // Sync selected provider when apiUrl changes externally (e.g., from loading saved settings)
  useEffect(() => {
    const detectedProvider = getProviderByURL(settings.apiUrl)
    if (detectedProvider && detectedProvider.name !== selectedProvider) {
      setSelectedProvider(detectedProvider.name)
    }
  }, [settings.apiUrl])

  // Get current provider for common models fallback
  const currentProvider = useMemo(
    () =>
      PROVIDER_PRESETS.find((p) => p.name === selectedProvider) ||
      (selectedProvider === CUSTOM_PROVIDER.name ? CUSTOM_PROVIDER : null),
    [selectedProvider]
  )

  const requiresKey = currentProvider ? currentProvider.requiresAuth : true
  const isOnDevice = selectedProvider === 'On-Device (Gemma 3)'

  // Fetch models logic
  useEffect(() => {
    const fetchModels = async () => {
      setModelsError(null)

      const provider = getProviderByURL(settings.apiUrl)
      const requiresKey = provider ? provider.requiresAuth : true

      if (!settings.apiUrl.trim() || (requiresKey && !settings.apiKey.trim())) {
        setAvailableModels([])
        setLoadingModels(false)
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

          // Auto-select first model if current is empty or if we just switched provider
          // But don't overwrite if the current model is already a valid choice in the list
          const currentModelIsValid = models.includes(settings.model)
          if (!settings.model || !currentModelIsValid) {
            console.log('[AISettings] Auto-selecting first available model:', models[0])
            updateSettings({ model: models[0] })
          }
        } else {
          setAvailableModels([])
          setModelsError('No models found or API does not support model listing')
        }
      } catch (error) {
        console.error('[AISettings] Model fetch error:', error)
        setModelsError('Failed to fetch models from API')
        setAvailableModels([])
      } finally {
        setLoadingModels(false)
      }
    }

    const timeoutId = setTimeout(fetchModels, 500)
    return () => clearTimeout(timeoutId)
  }, [settings.apiUrl, settings.apiKey, selectedProvider])

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerName = e.target.value
    setSelectedProvider(providerName)

    // Clear models immediately to prevent leakage
    setAvailableModels([])
    setModelsError(null)

    const preset = PROVIDER_PRESETS.find((p) => p.name === providerName)
    if (preset) {
      updateSettings({
        apiUrl: preset.baseURL,
        providerType: preset.providerType,
        model: preset.commonModels?.[0] || '',
      })
    } else if (providerName === CUSTOM_PROVIDER.name) {
      // If switching to "OpenAI Compatible", clear URL if it was a preset
      const currentProvider = getProviderByURL(settings.apiUrl)
      if (currentProvider) {
        updateSettings({
          apiUrl: '',
          model: '',
        })
        setCustomURL('')
      }
    }
  }

  const handleCustomURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setCustomURL(url)
    updateSettings({ apiUrl: url })
  }

  const providerOptions = useMemo(
    () => [
      ...PROVIDER_PRESETS.map((p) => ({ value: p.name, label: p.name })),
      { value: CUSTOM_PROVIDER.name, label: CUSTOM_PROVIDER.name },
    ],
    []
  )

  const modelOptions = useMemo(() => {
    const hasApiModels = availableModels.length > 0
    const hasCommonModels = currentProvider?.commonModels && currentProvider.commonModels.length > 0
    const shouldUseFallback = hasCommonModels && (!hasApiModels || !currentProvider?.supportsModels)

    if (hasApiModels) {
      return availableModels.map((m) => ({ value: m, label: m }))
    }
    if (shouldUseFallback) {
      return currentProvider!.commonModels!.map((m) => ({ value: m, label: m }))
    }
    return []
  }, [availableModels, currentProvider])

  const connectionStatusMsg = useMemo(() => {
    switch (connectionStatus) {
      case 'valid':
        return { text: '✓ Connected', color: 'text-green-400' }
      case 'invalid':
        return { text: '✗ Invalid Credentials', color: 'text-red-400' }
      default:
        return { text: '○ Not Configured', color: 'text-white/20' }
    }
  }, [connectionStatus])

  const isProviderUnreachable = connectionStatus === 'invalid' && !isConfigured // Simplified for now
  const usingFallbackModels = availableModels.length === 0 && modelOptions.length > 0

  return (
    <div className="space-y-6">
      <ConnectionStatusIndicator
        providerName={selectedProvider}
        model={settings.model}
        statusText={connectionStatusMsg.text}
        statusColor={connectionStatusMsg.color}
      />

      <ProviderSelector
        selectedProvider={selectedProvider}
        onProviderChange={handleProviderChange}
        providerOptions={providerOptions}
        showCustomURL={selectedProvider === CUSTOM_PROVIDER.name}
        customURL={customURL}
        onCustomURLChange={handleCustomURLChange}
      />

      {!isOnDevice && requiresKey && (
        <APIKeyInput
          apiKey={settings.apiKey}
          onAPIKeyChange={(e) => updateSettings({ apiKey: e.target.value })}
          currentProvider={currentProvider}
        />
      )}

      {!isOnDevice && (
        <ModelSelector
          showModelDropdown={modelOptions.length > 0 && !loadingModels}
          model={settings.model}
          onModelChange={(model) => updateSettings({ model })}
          modelOptions={modelOptions}
          availableModels={availableModels}
          usingFallbackModels={usingFallbackModels}
          loadingModels={loadingModels}
          requiresKey={requiresKey}
          isProviderUnreachable={isProviderUnreachable}
          currentProvider={currentProvider}
          modelsError={modelsError}
        />
      )}

      {isOnDevice && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-white/60">
          <p className="font-medium text-emerald-400">🔒 Private AI — No API key needed</p>
          <p className="mt-1 text-xs">
            Gemma 3 (1B int4) runs entirely in your browser via a Web Worker. Your resume data never leaves your device.
          </p>
        </div>
      )}

      {loadingModels && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Fetching models...</span>
        </div>
      )}
    </div>
  )
}

export default AISettings
