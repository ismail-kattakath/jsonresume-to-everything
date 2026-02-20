'use client'

import React from 'react'
import { FormInput } from '@/components/ui/FormInput'
import { ProviderPreset } from '@/lib/ai/providers'

interface APIKeyInputProps {
  apiKey: string
  onAPIKeyChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  currentProvider: ProviderPreset | null
}

const APIKeyInput = ({ apiKey, onAPIKeyChange, currentProvider }: APIKeyInputProps) => {
  return (
    <FormInput
      label="API Key"
      name="apiKey"
      type="password"
      value={apiKey}
      onChange={onAPIKeyChange}
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
  )
}

export default APIKeyInput
