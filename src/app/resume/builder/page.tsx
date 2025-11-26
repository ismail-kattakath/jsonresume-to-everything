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
import CollapsibleSection from '@/components/document-builder/ui/CollapsibleSection'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { Toaster } from 'sonner'
import { useDocumentHandlers } from '@/hooks/useDocumentHandlers'
import PasswordProtection from '@/components/auth/PasswordProtection'
import Footer from '@/components/layout/Footer'
import type { CoverLetterData } from '@/types'
import {
  User,
  Share2,
  FileText,
  Mail,
  GraduationCap,
  Briefcase,
  Code,
  Languages,
  Award,
} from 'lucide-react'

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
        // Always merge with default data to ensure all fields exist
        setCoverLetterData({
          ...defaultResumeData,
          content: DEFAULT_COVER_LETTER_CONTENT,
          showSummary: false,
          showLanguages: false,
          ...parsedData,
          // Ensure content is never empty - use default if saved content is empty
          content:
            parsedData.content && parsedData.content.trim()
              ? parsedData.content
              : DEFAULT_COVER_LETTER_CONTENT,
        })
      } catch (error) {
        console.error('Error loading saved cover letter data:', error)
      }
    }
  }, [])

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <ResumeContext.Provider value={currentContext}>
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
          <div className="relative flex flex-1 flex-col overflow-hidden md:h-screen md:flex-row">
            {/* Floating Print Button - Hidden on print */}
            <div className="exclude-print fixed right-8 bottom-8 z-50">
              <PrintButton
                name={
                  mode === 'resume' ? resumeData.name : coverLetterData.name
                }
                documentType={mode === 'resume' ? 'Resume' : 'CoverLetter'}
              />
            </div>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="exclude-print flex-1 space-y-6 overflow-y-auto p-4 md:h-screen md:space-y-8 md:p-6 lg:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-white/5"
            >
              {/* Header */}
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
                      Build your targeted resume and cover letter
                    </p>
                  </div>
                </div>
              </div>

              {/* All Form Sections - Always Visible */}
              <ImportExport preserveContent={mode === 'coverLetter'} />

              <CollapsibleSection
                title="Personal Information"
                icon={<User className="h-5 w-5 text-blue-400" />}
              >
                <PersonalInformation />
              </CollapsibleSection>

              <CollapsibleSection
                title="Social Media"
                icon={<Share2 className="h-5 w-5 text-blue-400" />}
              >
                <SocialMedia />
              </CollapsibleSection>

              <CollapsibleSection
                title="Professional Summary"
                icon={<FileText className="h-5 w-5 text-blue-400" />}
              >
                <Summary />
              </CollapsibleSection>

              <CollapsibleSection
                title="Cover Letter"
                icon={<Mail className="h-5 w-5 text-blue-400" />}
              >
                <ResumeContext.Provider
                  value={{
                    resumeData: coverLetterData as ResumeData,
                    setResumeData: setCoverLetterData as React.Dispatch<
                      React.SetStateAction<ResumeData>
                    >,
                    handleProfilePicture:
                      coverLetterHandlers.handleProfilePicture,
                    handleChange: coverLetterHandlers.handleChange,
                  }}
                >
                  <CoverLetterContent />
                </ResumeContext.Provider>
              </CollapsibleSection>

              <CollapsibleSection
                title="Education"
                icon={<GraduationCap className="h-5 w-5 text-blue-400" />}
              >
                <Education />
              </CollapsibleSection>

              <CollapsibleSection
                title="Work Experience"
                icon={<Briefcase className="h-5 w-5 text-blue-400" />}
              >
                <WorkExperience />
              </CollapsibleSection>

              {resumeData.skills.map((skill, index) => (
                <CollapsibleSection
                  key={index}
                  title={skill.title}
                  icon={<Code className="h-5 w-5 text-blue-400" />}
                >
                  <Skill title={skill.title} />
                </CollapsibleSection>
              ))}

              <CollapsibleSection
                title="Languages"
                icon={<Languages className="h-5 w-5 text-blue-400" />}
              >
                <Language />
              </CollapsibleSection>

              <CollapsibleSection
                title="Certifications"
                icon={<Award className="h-5 w-5 text-blue-400" />}
              >
                <Certification />
              </CollapsibleSection>
            </form>

            {/* Preview Section with Switcher */}
            <div className="flex flex-col md:w-[8.5in]">
              {/* Preview Mode Switcher */}
              <div className="exclude-print flex bg-gradient-to-br from-gray-900 via-black to-gray-900">
                <button
                  type="button"
                  onClick={() => setMode('resume')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                    mode === 'resume'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <span>📄</span>
                  Resume
                </button>
                <button
                  type="button"
                  onClick={() => setMode('coverLetter')}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all ${
                    mode === 'coverLetter'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white/80'
                  }`}
                >
                  <span>✉️</span>
                  Cover Letter
                </button>
              </div>

              {/* Both Previews - Toggle visibility with CSS */}
              <ResumeContext.Provider
                value={{
                  resumeData,
                  setResumeData,
                  handleProfilePicture: resumeHandlers.handleProfilePicture,
                  handleChange: resumeHandlers.handleChange,
                }}
              >
                <div className={mode === 'resume' ? 'block' : 'hidden'}>
                  <Preview />
                </div>
              </ResumeContext.Provider>
              <ResumeContext.Provider
                value={{
                  resumeData: coverLetterData as ResumeData,
                  setResumeData: setCoverLetterData as React.Dispatch<
                    React.SetStateAction<ResumeData>
                  >,
                  handleProfilePicture:
                    coverLetterHandlers.handleProfilePicture,
                  handleChange: coverLetterHandlers.handleChange,
                }}
              >
                <div className={mode === 'coverLetter' ? 'block' : 'hidden'}>
                  <CoverLetterPreview />
                </div>
              </ResumeContext.Provider>
            </div>
          </div>

          {/* Footer - Hidden on print */}
          <div className="exclude-print">
            <Footer />
          </div>
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
