'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { FormTextarea } from '@/components/ui/FormTextarea'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { fetchAvailableModels } from '@/lib/ai/models'
import {
  PROVIDER_PRESETS,
  getProviderByURL,
  CUSTOM_PROVIDER,
} from '@/lib/ai/providers'
import { runAIGenerationPipeline, analyzeJobDescriptionGraph } from '@/lib/ai/strands/agent'

// Sub-components
import ConnectionStatusIndicator from './ai-settings/ConnectionStatusIndicator'
import ProviderSelector from './ai-settings/ProviderSelector'
import APIKeyInput from './ai-settings/APIKeyInput'
import ModelSelector from './ai-settings/ModelSelector'
import AIPipelineButton from './ai-settings/AIPipelineButton'
import JobDescriptionInput from './ai-settings/JobDescriptionInput'

const AISettings = () => {
  const { resumeData, setResumeData } = React.useContext(ResumeContext)
  const {
    settings,
    updateSettings,
    isConfigured,
    connectionStatus,
    jobDescriptionStatus,
  } = useAISettings()

  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [modelsError, setModelsError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPipelineRunning, setIsPipelineRunning] = useState(false)

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
  const currentProvider = useMemo(() =>
    PROVIDER_PRESETS.find((p) => p.name === selectedProvider) ||
    (selectedProvider === CUSTOM_PROVIDER.name ? CUSTOM_PROVIDER : null)
    , [selectedProvider])

  const requiresKey = currentProvider ? currentProvider.requiresAuth : true

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

    const preset = PROVIDER_PRESETS.find((p) => p.name === providerName)
    if (preset) {
      updateSettings({
        apiUrl: preset.baseURL,
        providerType: preset.providerType,
      })
      if (preset.commonModels && preset.commonModels.length > 0) {
        updateSettings({ model: preset.commonModels[0] })
      }
    }
  }

  const handleCustomURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setCustomURL(url)
    updateSettings({ apiUrl: url })
  }

  const handleRefineJD = async () => {
    if (!isConfigured || !settings.jobDescription || settings.jobDescription.length < 50) {
      toast.error('Add more detail to your job description first (min 50 chars)')
      return
    }

    setIsAnalyzing(true)
    const toastId = toast.loading('Refining job description...')

    try {
      const refinedJD = await analyzeJobDescriptionGraph(
        settings.jobDescription,
        {
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model || 'gpt-4o-mini',
          providerType: 'openai-compatible',
        }
      )

      updateSettings({ jobDescription: refinedJD })
      toast.success('Job description refined successfully!', { id: toastId })
    } catch (error) {
      console.error('[AISettings] Refinement error:', error)
      toast.error(`Refinement failed: ${(error as Error).message}`, { id: toastId })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRunPipeline = async () => {
    if (!isConfigured || !settings.jobDescription) return

    setIsPipelineRunning(true)
    const toastId = toast.loading('Running AI optimization pipeline...')

    try {
      const result = await runAIGenerationPipeline(
        resumeData,
        settings.jobDescription,
        {
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model || 'gpt-4o-mini',
          providerType: 'openai-compatible',
        }
      )

      // Update resume with results
      setResumeData({
        ...resumeData,
        summary: result.summary,
        workExperience: result.workExperiences,
      })
      toast.success('Resume optimized successfully!', { id: toastId })
    } catch (error) {
      console.error('[AISettings] Pipeline error:', error)
      toast.error(`Optimization failed: ${(error as Error).message}`, { id: toastId })
    } finally {
      setIsPipelineRunning(false)
    }
  }

  const providerOptions = useMemo(() => [
    ...PROVIDER_PRESETS.map((p) => ({ value: p.name, label: p.name })),
    { value: CUSTOM_PROVIDER.name, label: CUSTOM_PROVIDER.name },
  ], [])

  const modelOptions = useMemo(() => {
    const hasApiModels = availableModels.length > 0
    const hasCommonModels = currentProvider?.commonModels && currentProvider.commonModels.length > 0
    const shouldUseFallback = hasCommonModels && (!hasApiModels || !currentProvider?.supportsModels)

    if (hasApiModels) {
      return availableModels.map(m => ({ value: m, label: m }))
    }
    if (shouldUseFallback) {
      return currentProvider!.commonModels!.map(m => ({ value: m, label: m }))
    }
    return []
  }, [availableModels, currentProvider])

  const connectionStatusMsg = useMemo(() => {
    switch (connectionStatus) {
      case 'valid': return { text: '✓ Connected', color: 'text-green-400' }
      case 'invalid': return { text: '✗ Invalid Credentials', color: 'text-red-400' }
      default: return { text: '○ Not Configured', color: 'text-white/20' }
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

      {requiresKey && (
        <APIKeyInput
          apiKey={settings.apiKey}
          onAPIKeyChange={(e) => updateSettings({ apiKey: e.target.value })}
          currentProvider={currentProvider}
        />
      )}

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

      {loadingModels && (
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Fetching models...</span>
        </div>
      )}

      <JobDescriptionInput
        value={settings.jobDescription}
        onChange={(val) => updateSettings({ jobDescription: val })}
        onRefine={handleRefineJD}
        isAnalyzing={isAnalyzing}
        isConfigured={isConfigured}
        disabled={isAnalyzing || isPipelineRunning}
      />

      <AIPipelineButton
        onRun={handleRunPipeline}
        disabled={!isConfigured || !settings.jobDescription || isPipelineRunning || isAnalyzing}
        isLoading={isPipelineRunning}
      />
    </div>
  )
}

export default AISettings
