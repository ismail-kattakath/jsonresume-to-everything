'use client'

import React from 'react'
import { FormSelect } from '@/components/ui/FormSelect'
import { FormInput } from '@/components/ui/FormInput'

interface ProviderSelectorProps {
  selectedProvider: string
  onProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  providerOptions: { value: string; label: string }[]
  showCustomURL: boolean
  customURL: string
  onCustomURLChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const ProviderSelector = ({
  selectedProvider,
  onProviderChange,
  providerOptions,
  showCustomURL,
  customURL,
  onCustomURLChange,
}: ProviderSelectorProps) => {
  return (
    <>
      <FormSelect
        label="AI Provider"
        name="provider"
        value={selectedProvider}
        onChange={onProviderChange}
        options={providerOptions}
        variant="blue"
        helpText="Select a preset or enter a custom OpenAI-compatible URL"
      />

      {showCustomURL && (
        <FormInput
          label="API URL"
          name="customApiUrl"
          value={customURL}
          onChange={onCustomURLChange}
          placeholder="http://localhost:1234/v1"
          variant="blue"
          helpText="Enter the base URL for your OpenAI-compatible API"
        />
      )}
    </>
  )
}

export default ProviderSelector
