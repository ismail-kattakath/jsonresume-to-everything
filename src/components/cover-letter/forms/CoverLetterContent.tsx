import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import AIContentGenerator from '@/components/document-builder/shared-forms/AIContentGenerator'

const CoverLetterContent = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
    if (typeof e === 'string') {
      setResumeData({ ...resumeData, content: e })
    } else {
      setResumeData({ ...resumeData, content: e.target.value })
    }
  }

  const handleGenerate = (generatedContent: string) => {
    setResumeData({ ...resumeData, content: generatedContent })
  }

  return (
    <div className="flex flex-col gap-4">
      <AIContentGenerator
        name="content"
        value={resumeData.content || ''}
        onChange={handleContentChange}
        onGenerated={handleGenerate}
        placeholder="Write your cover letter content..."
        rows={12}
        minHeight="400px"
        mode="coverLetter"
      />
    </div>
  )
}

export default CoverLetterContent
