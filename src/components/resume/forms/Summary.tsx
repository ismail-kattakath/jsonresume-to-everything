import React, { useContext, useState } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import AIGenerateSummaryModal from '@/components/resume/forms/AIGenerateSummaryModal'
import AITextAreaWithButton from '@/components/document-builder/shared-forms/AITextAreaWithButton'

const Summary = () => {
  const { resumeData, setResumeData, handleChange } = useContext(ResumeContext)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleToggleSummary = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeData({ ...resumeData, showSummary: e.target.checked })
  }

  const handleGenerate = (generatedSummary: string) => {
    setResumeData({ ...resumeData, summary: generatedSummary })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-amber-500 to-orange-500"></div>
          <h2 className="text-lg font-semibold text-white">
            Professional Summary
          </h2>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10">
          <input
            type="checkbox"
            id="showSummary"
            checked={resumeData.showSummary}
            onChange={handleToggleSummary}
            className="h-4 w-4 cursor-pointer rounded accent-amber-500"
          />
          <span className="text-sm text-white/90">Display Section</span>
        </label>
      </div>

      <AITextAreaWithButton
        value={resumeData.summary}
        onChange={handleChange}
        onGenerateClick={() => setIsModalOpen(true)}
        placeholder="Write a compelling professional summary highlighting your key strengths, experience, and career objectives..."
        name="summary"
        rows={8}
        minHeight="160px"
        maxLength={1200}
        showCharacterCount={true}
      />

      <AIGenerateSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
        resumeData={resumeData}
      />
    </div>
  )
}

export default Summary
