'use client'

import React from 'react'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { FormInput } from '@/components/ui/FormInput'
import { FormTextarea } from '@/components/ui/FormTextarea'

const AISettings: React.FC = () => {
  const { settings, updateSettings } = useAISettings()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-white/60">
        Connect to an OpenAI-compatible API to generate tailored cover letters
        and professional summaries based on the job description.
      </p>

      {/* API URL and Key - Same line */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormInput
          label="API URL"
          name="apiUrl"
          value={settings.apiUrl}
          onChange={(e) => updateSettings({ apiUrl: e.target.value })}
          placeholder="https://api.openai.com/v1"
          variant="blue"
        />
        <FormInput
          label="API Key"
          name="apiKey"
          type="password"
          value={settings.apiKey}
          onChange={(e) => updateSettings({ apiKey: e.target.value })}
          placeholder="sk-..."
          variant="blue"
        />
      </div>

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
