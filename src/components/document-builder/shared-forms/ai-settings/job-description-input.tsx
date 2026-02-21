'use client'

import React from 'react'
import AIContentGenerator from '@/components/document-builder/shared-forms/ai-content-generator'

interface JobDescriptionInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ value, onChange, disabled }) => {
  return (
    <AIContentGenerator
      label="Job Description"
      name="jobDescription"
      value={value}
      onChange={(val) => onChange(typeof val === 'string' ? val : val.target.value)}
      placeholder="Paste the job description here..."
      variant="blue"
      minHeight="160px"
      mode="jobDescription"
      disabled={disabled}
      showCharacterCount={false}
      onGenerated={(val) => onChange(val)}
    />
  )
}

export default JobDescriptionInput
