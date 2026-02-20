'use client'

import React from 'react'
import { FormSelect } from '@/components/ui/FormSelect'
import { FormInput } from '@/components/ui/FormInput'
import { ProviderPreset } from '@/lib/ai/providers'

interface ModelSelectorProps {
  showModelDropdown: boolean
  model: string
  onModelChange: (model: string) => void
  modelOptions: { value: string; label: string }[]
  availableModels: string[]
  usingFallbackModels: boolean
  loadingModels: boolean
  requiresKey: boolean
  isProviderUnreachable: boolean
  currentProvider: ProviderPreset | null
  modelsError: string | null
}

const ModelSelector = ({
  showModelDropdown,
  model,
  onModelChange,
  modelOptions,
  availableModels,
  usingFallbackModels,
  loadingModels,
  requiresKey,
  isProviderUnreachable,
  currentProvider,
  modelsError,
}: ModelSelectorProps) => {
  // If we are currently loading, show a disabled input with loading text
  if (loadingModels) {
    return (
      <FormInput
        label="Model"
        name="model"
        value=""
        onChange={() => {}}
        placeholder="Fetching models..."
        variant="blue"
        disabled={true}
        helpText="Fetching available models..."
      />
    )
  }

  if (showModelDropdown) {
    return (
      <FormSelect
        label="Model"
        name="model"
        value={model}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onModelChange(e.target.value)}
        options={modelOptions}
        variant="blue"
        disabled={usingFallbackModels && requiresKey}
        helpText={
          availableModels.length > 0
            ? `${availableModels.length} models available from API`
            : currentProvider && !currentProvider.requiresAuth
              ? `Showing common ${currentProvider.name} models`
              : 'Enter API key to fetch available models'
        }
      />
    )
  }

  return (
    <FormInput
      label="Model"
      name="model"
      value={model}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onModelChange(e.target.value)}
      placeholder={requiresKey ? 'gpt-4o-mini' : ''}
      variant="blue"
      disabled={isProviderUnreachable || (requiresKey && !model.trim()) || !currentProvider?.baseURL.trim()}
      helpText={
        isProviderUnreachable
          ? `✗ ${currentProvider?.name} is unreachable. Please start the server and refresh.`
          : modelsError
            ? 'Enter model name manually'
            : !currentProvider?.baseURL.trim()
              ? 'Enter API URL above to load models'
              : requiresKey
                ? 'Enter API key to load available models'
                : 'Enter model name manually if not detected'
      }
    />
  )
}

export default ModelSelector
