import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import AITextAreaWithButton from '@/components/document-builder/shared-forms/AITextAreaWithButton'

const Summary = () => {
  const { resumeData, setResumeData, handleChange } = useContext(ResumeContext)

  const handleGenerate = (generatedSummary: string) => {
    setResumeData({ ...resumeData, summary: generatedSummary })
  }

  return (
    <div className="flex flex-col gap-4">
      <AITextAreaWithButton
        value={resumeData.summary}
        onChange={handleChange}
        onGenerated={handleGenerate}
        placeholder="Write a compelling professional summary highlighting your key strengths, experience, and career objectives..."
        name="summary"
        rows={8}
        minHeight="160px"
        maxLength={1200}
        showCharacterCount={true}
        mode="summary"
      />
    </div>
  )
}

export default Summary
