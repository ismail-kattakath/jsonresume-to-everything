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
import { Loader2, Sparkles } from 'lucide-react'
import { analyzeJobDescriptionGraph, runAIGenerationPipeline } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'
import { AILoadingToast } from '@/components/ui/AILoadingToast'
import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'

const AISettings: React.FC = () => {
  const { settings, updateSettings, connectionStatus, isConfigured } =
    useAISettings()
  const { resumeData, setResumeData } = useContext(ResumeContext)

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isPipelineRunning, setIsPipelineRunning] = useState(false)

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
    const detectedProvider = provider?.name || 'OpenAI Compatible'

    if (detectedProvider !== selectedProvider) {
      setSelectedProvider(detectedProvider)
      setCustomURL(provider ? '' : settings.apiUrl)
    }
  }, [settings.apiUrl]) // Only depend on apiUrl, not selectedProvider to avoid loops

  // Handle provider change
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const providerName = e.target.value
    setSelectedProvider(providerName)

    if (providerName === 'OpenAI Compatible') {
      // User selected custom - clear models and don't change URL yet
      setAvailableModels([])
      setModelsError(null)
      return
    }

    // Find the preset and update URL
    const preset = PROVIDER_PRESETS.find((p) => p.name === providerName)
    if (preset) {
      updateSettings({
        apiUrl: preset.baseURL,
        providerType: preset.providerType,
      })
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

      const provider = getProviderByURL(settings.apiUrl)
      const requiresKey = provider ? provider.requiresAuth : true

      // Only fetch if we have URL AND (either key or no key needed)
      if (!settings.apiUrl.trim() || (requiresKey && !settings.apiKey.trim())) {
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

  const handleRefineJD = async () => {
    if (!isConfigured) {
      toast.error('AI not configured', {
        description: 'Please complete the API settings above first.',
      })
      return
    }

    if (!settings.jobDescription || settings.jobDescription.length < 50) {
      toast.error('Job description too short', {
        description: 'Please provide more details to analyze.',
      })
      return
    }

    setIsAnalyzing(true)
    let toastId: string | number | undefined

    try {
      const refinedJD = await analyzeJobDescriptionGraph(
        settings.jobDescription,
        {
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model,
          providerType: settings.providerType,
        },
        (chunk) => {
          if (chunk.content) {
            console.log('[Strands Graph]', chunk.content)
            // Update toast with progress
            if (!toastId) {
              toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
            } else {
              toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
            }
          }
        }
      )
      if (toastId) toast.dismiss(toastId)
      updateSettings({ jobDescription: refinedJD })
      toast.success('Job description refined successfully!')
    } catch (error: any) {
      if (toastId) toast.dismiss(toastId)
      console.error('[AISettings] JD analysis error:', error)
      toast.error(`Analysis failed: ${error.message || 'Unknown error occurred'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRunPipeline = async () => {
    if (!isConfigured || !settings.jobDescription) return

    setIsPipelineRunning(true)
    let toastId: string | number | undefined

    try {
      const result = await runAIGenerationPipeline(
        resumeData,
        settings.jobDescription,
        {
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model,
          providerType: settings.providerType,
        },
        (progress) => {
          const message = `Step ${progress.currentStep}/${progress.totalSteps}: ${progress.message}`

          if (!toastId) {
            toastId = toast(<AILoadingToast message={message} />, {
              duration: Infinity,
            })
          } else {
            toast(<AILoadingToast message={message} />, {
              id: toastId,
              duration: Infinity,
            })
          }
        }
      )

      if (toastId) toast.dismiss(toastId)

      // Update all data
      updateSettings({ jobDescription: result.refinedJD })
      setResumeData({
        ...resumeData,
        summary: result.summary,
        workExperience: result.workExperiences,
      })

      toast.success(
        '🎉 AI optimization complete! Your resume has been tailored to the job description.'
      )
    } catch (error: any) {
      if (toastId) toast.dismiss(toastId)
      console.error('Pipeline error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Pipeline failed'
      )
    } finally {
      setIsPipelineRunning(false)
    }
  }

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
  const currentProvider =
    PROVIDER_PRESETS.find((p) => p.name === selectedProvider) ||
    (selectedProvider === CUSTOM_PROVIDER.name ? CUSTOM_PROVIDER : null)

  // Model dropdown options - use API models or fallback to common models
  const hasApiModels = availableModels.length > 0
  const hasCommonModels =
    currentProvider?.commonModels && currentProvider.commonModels.length > 0

  // For providers that support dynamic model fetching, don't use fallback models
  const shouldUseFallback =
    hasCommonModels && (!hasApiModels || !currentProvider?.supportsModels)

  const modelOptions = hasApiModels
    ? availableModels.map((model) => ({
      value: model,
      label: model,
    }))
    : shouldUseFallback
      ? currentProvider.commonModels!.map((model) => ({
        value: model,
        label: model,
      }))
      : []

  const showCustomURL = selectedProvider === 'OpenAI Compatible'
  const showModelDropdown = modelOptions.length > 0 && !loadingModels
  const usingFallbackModels = !hasApiModels && shouldUseFallback
  const requiresKey = currentProvider ? currentProvider.requiresAuth : true

  // Check if provider is unreachable (has supportsModels but fetch failed)
  const isProviderUnreachable =
    currentProvider?.supportsModels &&
    !hasApiModels &&
    !loadingModels &&
    modelsError !== null

  // Format status messages
  const getConnectionStatusMessage = () => {
    if (requiresKey && !settings.apiKey && settings.apiUrl) {
      return { text: 'API Key required', color: 'text-yellow-400' }
    }
    if (!settings.apiUrl) {
      return { text: 'No URL configured', color: 'text-white/40' }
    }

    switch (connectionStatus) {
      case 'testing':
        return { text: 'Testing...', color: 'text-yellow-400' }
      case 'valid':
        return { text: '✓ Connected', color: 'text-green-400' }
      case 'invalid':
        return { text: '✗ Failed', color: 'text-red-400' }
      default:
        return { text: 'Ready', color: 'text-white/60' }
    }
  }

  const getModelStatusMessage = () => {
    if (loadingModels) {
      return { text: 'Fetching...', color: 'text-yellow-400' }
    }
    if (modelsError) {
      return { text: `✗ ${modelsError}`, color: 'text-red-400' }
    }
    if (hasApiModels) {
      return {
        text: `✓ ${availableModels.length} models`,
        color: 'text-green-400',
      }
    }
    return null
  }

  const connectionStatusMsg = getConnectionStatusMessage()
  const modelStatusMsg = getModelStatusMessage()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-white/60">
        Choose an AI provider to generate tailored content. For local or custom
        endpoints, use the OpenAI Compatible option.
      </p>

      {/* Connection Status Log */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-3 font-mono text-xs">
        <div className="mb-1 font-semibold text-white/80">
          Connection Status
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-white/40">Provider:</span>
            <span className="text-white/80">{selectedProvider}</span>
          </div>
          {settings.model && (
            <div className="flex items-center gap-2">
              <span className="text-white/40">Model:</span>
              <span className="text-white/60">{settings.model}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-white/40">Status:</span>
            <span className={connectionStatusMsg.color}>
              {connectionStatusMsg.text}
            </span>
          </div>
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
        helpText="Select a preset or enter a custom OpenAI-compatible URL"
      />

      {/* API URL (only show if Custom is selected) */}
      {showCustomURL && (
        <FormInput
          label="API URL"
          name="customApiUrl"
          value={customURL}
          onChange={handleCustomURLChange}
          placeholder="http://localhost:1234/v1"
          variant="blue"
          helpText="Enter the base URL for your OpenAI-compatible API"
        />
      )}

      {/* API Key */}
      {requiresKey && (
        <FormInput
          label="API Key"
          name="apiKey"
          type="password"
          value={settings.apiKey}
          onChange={(e) => updateSettings({ apiKey: e.target.value })}
          placeholder="sk-..."
          variant="blue"
          helpText={
            currentProvider?.apiKeyURL ? (
              <span>
                Get from{' '}
                <a
                  href={currentProvider.apiKeyURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  {currentProvider.name}
                </a>{' '}
                (required for model fetching)
              </span>
            ) : (
              'Enter key from your AI provider'
            )
          }
        />
      )}

      {/* Model Selection */}
      {showModelDropdown ? (
        <FormSelect
          label="Model"
          name="model"
          value={settings.model}
          onChange={(e) => updateSettings({ model: e.target.value })}
          options={modelOptions}
          variant="blue"
          disabled={usingFallbackModels && !loadingModels && requiresKey}
          helpText={
            usingFallbackModels
              ? requiresKey
                ? 'Enter API key to fetch available models'
                : `Showing common ${selectedProvider} models`
              : `${availableModels.length} models available from API`
          }
        />
      ) : (
        <FormInput
          label="Model"
          name="model"
          value={settings.model}
          onChange={(e) => updateSettings({ model: e.target.value })}
          placeholder={requiresKey ? 'gpt-4o-mini' : ''}
          variant="blue"
          disabled={
            loadingModels ||
            isProviderUnreachable ||
            (requiresKey &&
              !settings.apiKey.trim() &&
              selectedProvider !== 'OpenAI Compatible')
          }
          helpText={
            loadingModels
              ? 'Loading models from API...'
              : isProviderUnreachable
                ? `✗ ${currentProvider?.name} is unreachable. Please start the server and refresh.`
                : modelsError
                  ? 'Enter model name manually'
                  : requiresKey
                    ? 'Enter API key to load available models'
                    : 'Enter model name manually if not detected'
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
        onAIAction={handleRefineJD}
        isAILoading={isAnalyzing}
        isAIConfigured={isConfigured}
        aiButtonTitle="Refine with AI"
        aiShowLabel={false}
        aiVariant="amber"
        disabled={isAnalyzing || isPipelineRunning}
        showCounter={false}
      />

      {/* AI Pipeline Button */}
      <button
        onClick={handleRunPipeline}
        disabled={!isConfigured || !settings.jobDescription || isPipelineRunning || isAnalyzing}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed cursor-pointer text-white font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
      >
        {isPipelineRunning ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            AI-Powered Resume Optimization
          </>
        )}
      </button>
    </div>
  )
}

export default AISettings
