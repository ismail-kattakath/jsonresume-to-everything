import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import AIContentGenerator from '@/components/document-builder/shared-forms/AIContentGenerator'

const Summary = () => {
  const { resumeData, setResumeData, handleChange } = useContext(ResumeContext)
  const { isPipelineActive } = useAISettings()


  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
    if (typeof e === 'string') {
      setResumeData({ ...resumeData, summary: e })
    } else if (handleChange) {
      handleChange(e)
    } else {
      setResumeData({ ...resumeData, summary: e.target.value })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AIContentGenerator
        name="summary"
        value={resumeData.summary || ''}
        onChange={handleSummaryChange}
        onGenerated={handleSummaryChange}
        placeholder="Write a compelling professional summary..."
        rows={8}
        mode="summary"
        disabled={isPipelineActive}
      />
    </div>
  )
}

export default Summary
