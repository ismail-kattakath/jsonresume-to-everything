'use client'

import React from 'react'
import { FormTextarea } from '@/components/ui/FormTextarea'

interface JobDescriptionInputProps {
  value: string
  onChange: (value: string) => void
  onRefine: () => void
  isAnalyzing: boolean
  isConfigured: boolean
  disabled?: boolean
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  onRefine,
  isAnalyzing,
  isConfigured,
  disabled,
}) => {
  return (
    <FormTextarea
      label="Job Description"
      name="jobDescription"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Paste the job description here..."
      variant="blue"
      minHeight="160px"
      onAIAction={onRefine}
      isAILoading={isAnalyzing}
      isAIConfigured={isConfigured}
      aiButtonTitle="Refine with AI"
      aiShowLabel={false}
      aiVariant="amber"
      disabled={disabled}
      showCounter={false}
    />
  )
}

export default JobDescriptionInput
