import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import ProfileHeader from '@/components/document-builder/shared-preview/ProfileHeader'

const CoverLetterPreview = () => {
  const { resumeData } = useContext(ResumeContext)

  // Capitalize name for signature (First Letter Of Each Word)
  const capitalizedName = resumeData.name
    ? resumeData.name
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : ''

  return (
    <div className="preview rm-padding-print w-full bg-white p-6 font-[sans-serif] text-black md:min-h-[11in] md:w-[8.5in]">
      <ProfileHeader />

      {/* Cover Letter Content */}
      <div className="mx-auto mt-4 max-w-2xl">
        <p className="content mb-2">Dear Hiring Manager,</p>
        <p className="content editable whitespace-pre-wrap" contentEditable suppressContentEditableWarning>
          {resumeData.content}
        </p>
        <div className="content mt-4">
          <p>Thanks and regards,</p>
          <p>{capitalizedName}</p>
        </div>
      </div>
    </div>
  )
}

export default CoverLetterPreview
