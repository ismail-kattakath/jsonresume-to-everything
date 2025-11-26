'use client'

import React, { useState, useEffect } from 'react'
import '@/styles/document-builder.css'
import '@/styles/resume-preview.css'

// Import components
import Language from '@/components/resume/forms/Language'
import ImportExport from '@/components/document-builder/shared-forms/ImportExport'
import Preview from '@/components/resume/preview/Preview'
import CoverLetterPreview from '@/components/cover-letter/preview/CoverLetterPreview'
import defaultResumeData from '@/lib/resumeAdapter'
import SocialMedia from '@/components/document-builder/shared-forms/SocialMedia'
import WorkExperience from '@/components/resume/forms/WorkExperience'
import Skill from '@/components/resume/forms/Skill'
import PersonalInformation from '@/components/document-builder/shared-forms/PersonalInformation'
import Summary from '@/components/resume/forms/Summary'
import Education from '@/components/resume/forms/Education'
import Certification from '@/components/resume/forms/Certification'
import CoverLetterContent from '@/components/cover-letter/forms/CoverLetterContent'
import PrintButton from '@/components/document-builder/ui/PrintButton'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { Toaster } from 'sonner'
import { useDocumentHandlers } from '@/hooks/useDocumentHandlers'
import PasswordProtection from '@/components/auth/PasswordProtection'
import type { CoverLetterData } from '@/types'

// Default cover letter content
const DEFAULT_COVER_LETTER_CONTENT =
  "I'm a Toronto-based Principal Software Engineer with 7+ years delivering production-ready full-stack applications using React, React Native, Node.js, and MongoDB—the exact stack you're seeking. At Homewood Health, I transformed an abandoned MEAN application into a nationally-deployed platform serving 100,000+ users with 99.5% uptime, implemented enterprise OAuth/SAML authentication, and led the AngularJS-to-Next.js migration while reducing deployment time by 92%. My experience architecting REST APIs with Express.js, integrating external SDKs, implementing security protocols, and managing agile sprints directly aligns with your requirements. Having built FDA-compliant healthcare systems and worked with cross-functional teams across multiple countries, I understand the rigorous standards and fast-paced environment of innovative startups like Speer. I'm excited to leverage my proven track record in building scalable, testable code to help deliver your groundbreaking technologies—let's discuss how I can contribute to your mission this week."

type EditorMode = 'resume' | 'coverLetter'

function UnifiedEditor() {
  // Editor mode state
  const [mode, setMode] = useState<EditorMode>('resume')

  // Resume data
  const [resumeData, setResumeData] = useState(defaultResumeData)
  const resumeHandlers = useDocumentHandlers(resumeData, setResumeData)

  // Cover letter data
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    ...defaultResumeData,
    content: DEFAULT_COVER_LETTER_CONTENT,
    showSummary: false,
    showLanguages: false,
  })
  const coverLetterHandlers = useDocumentHandlers(
    coverLetterData as ResumeData,
    setCoverLetterData as React.Dispatch<React.SetStateAction<ResumeData>>
  )

  // Get current context based on mode
  const currentContext =
    mode === 'resume'
      ? {
          resumeData,
          setResumeData,
          handleProfilePicture: resumeHandlers.handleProfilePicture,
          handleChange: resumeHandlers.handleChange,
        }
      : {
          resumeData: coverLetterData as ResumeData,
          setResumeData: setCoverLetterData as React.Dispatch<
            React.SetStateAction<ResumeData>
          >,
          handleProfilePicture: coverLetterHandlers.handleProfilePicture,
          handleChange: coverLetterHandlers.handleChange,
        }

  // Migrate skills data on mount if needed (resume only)
  useEffect(() => {
    if (resumeData.skills && resumeData.skills.length > 0) {
      const needsMigration = resumeData.skills.some((skillCategory) =>
        skillCategory.skills.some(
          (skill) =>
            typeof skill === 'string' ||
            ('underline' in skill && skill.highlight === undefined)
        )
      )

      if (needsMigration) {
        const migratedData = {
          ...resumeData,
          skills: resumeData.skills.map((skillCategory) => ({
            ...skillCategory,
            skills: skillCategory.skills.map((skill) => {
              if (typeof skill === 'string') {
                return { text: skill, highlight: false }
              }
              // Handle old 'underline' property
              if ('underline' in skill && skill.highlight === undefined) {
                return {
                  text: skill.text,
                  highlight: (skill as { underline: boolean }).underline,
                }
              }
              return skill
            }),
          })),
        }
        setResumeData(migratedData)
      }
    }
  }, [])

  // Load saved cover letter data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('coverLetterData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setCoverLetterData(parsedData)
      } catch (error) {
        console.error('Error loading saved cover letter data:', error)
      }
    }
  }, [])

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <ResumeContext.Provider value={currentContext}>
        <div className="relative flex flex-col overflow-x-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 md:h-screen md:flex-row">
          {/* Floating Print Button - Hidden on print */}
          <div className="exclude-print fixed right-8 bottom-8 z-50">
            <PrintButton
              name={mode === 'resume' ? resumeData.name : coverLetterData.name}
              documentType={mode === 'resume' ? 'Resume' : 'CoverLetter'}
            />
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="exclude-print flex-1 space-y-6 p-4 md:h-screen md:space-y-8 md:overflow-y-auto md:p-6 lg:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-white/5"
          >
            {/* Header with Tab Switcher */}
            <div className="space-y-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Resume Generator
                  </h1>
                  <p className="text-sm text-white/60">
                    Build targeted resumes and cover letters
                  </p>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex gap-2 rounded-lg bg-white/5 p-1">
                <button
                  type="button"
                  onClick={() => setMode('resume')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === 'resume'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <span>📄</span>
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => setMode('coverLetter')}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all ${
                    mode === 'coverLetter'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  <span>✉️</span>
                  Cover Letter
                </button>
              </div>
            </div>

            {/* Shared Components */}
            <ImportExport preserveContent={mode === 'coverLetter'} />
            <PersonalInformation />
            <SocialMedia />

            {/* Resume-specific components */}
            {mode === 'resume' && (
              <>
                <Summary />
                <Education />
                <WorkExperience />
                {resumeData.skills.map((skill, index) => (
                  <Skill title={skill.title} key={index} />
                ))}
                <Language />
                <Certification />
              </>
            )}

            {/* Cover Letter-specific components */}
            {mode === 'coverLetter' && <CoverLetterContent />}
          </form>

          {/* Conditional Preview */}
          {mode === 'resume' ? <Preview /> : <CoverLetterPreview />}
        </div>
      </ResumeContext.Provider>
    </>
  )
}

export default function ResumeEditPage() {
  return (
    <PasswordProtection>
      <UnifiedEditor />
    </PasswordProtection>
  )
}
