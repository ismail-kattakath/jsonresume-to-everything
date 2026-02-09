'use client'

import { useEffect, useState } from 'react'
import Preview from '@/components/resume/preview/Preview'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { AISettingsProvider } from '@/lib/contexts/AISettingsContext'
import defaultResumeData from '@/lib/resumeAdapter'
import PrintButton from '@/components/document-builder/ui/PrintButton'
import ScaledPreviewWrapper from '@/components/document-builder/ui/ScaledPreviewWrapper'
import { generatePDFFilename } from '@/lib/filenameGenerator'
import '@/styles/document-builder.css'
import '@/styles/resume-preview.css'

export default function ResumeDownloadPage() {
  const [resumeData, setResumeData] = useState(defaultResumeData)

  useEffect(() => {
    // Load resume data from localStorage if available
    const storedData = localStorage.getItem('resumeData')
    let loadedData = defaultResumeData
    if (storedData) {
      loadedData = JSON.parse(storedData)
      setResumeData(loadedData)
    }

    // Set document title for PDF filename
    if (loadedData.name && loadedData.position) {
      document.title = generatePDFFilename(
        loadedData.name,
        loadedData.position,
        'Resume'
      )
    }

    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        handleProfilePicture: () => {},
        handleChange: () => {},
        editable: false,
      }}
    >
      <AISettingsProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 print:bg-white">
          {/* Floating Print Button - Hidden on print */}
          <div className="exclude-print fixed right-8 bottom-8 z-50">
            <PrintButton
              name={resumeData.name}
              position={resumeData.position}
              documentType="Resume"
            />
          </div>

          {/* Resume Content */}
          <div className="flex min-h-screen items-start justify-center md:px-4 md:py-8 print:px-0 print:py-0">
            <ScaledPreviewWrapper>
              <Preview />
            </ScaledPreviewWrapper>
          </div>
        </div>
      </AISettingsProvider>
    </ResumeContext.Provider>
  )
}
