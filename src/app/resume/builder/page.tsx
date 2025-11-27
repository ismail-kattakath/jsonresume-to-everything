'use client'

import React, { useState, useEffect, useContext } from 'react'
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
import { useSkillGroupsManagement } from '@/hooks/useSkillGroupsManagement'
import PasswordProtection from '@/components/auth/PasswordProtection'
import MainLayout from '@/components/layout/MainLayout'
import type { CoverLetterData, ResumeData } from '@/types'
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
  Plus,
} from 'lucide-react'
import {
  DnDContext,
  DnDDroppable,
  DnDDraggable,
} from '@/components/ui/DragAndDrop'
import type { DropResult } from '@hello-pangea/dnd'

// Default cover letter content
const DEFAULT_COVER_LETTER_CONTENT =
  "I'm a Toronto-based Principal Software Engineer with 7+ years delivering production-ready full-stack applications using React, React Native, Node.js, and MongoDB—the exact stack you're seeking. At Homewood Health, I transformed an abandoned MEAN application into a nationally-deployed platform serving 100,000+ users with 99.5% uptime, implemented enterprise OAuth/SAML authentication, and led the AngularJS-to-Next.js migration while reducing deployment time by 92%. My experience architecting REST APIs with Express.js, integrating external SDKs, implementing security protocols, and managing agile sprints directly aligns with your requirements. Having built FDA-compliant healthcare systems and worked with cross-functional teams across multiple countries, I understand the rigorous standards and fast-paced environment of innovative startups like Speer. I'm excited to leverage my proven track record in building scalable, testable code to help deliver your groundbreaking technologies—let's discuss how I can contribute to your mission this week."

type EditorMode = 'resume' | 'coverLetter'

/**
 * Skill Groups Section Component
 * Handles drag-and-drop reordering and CRUD operations for skill groups
 */
function SkillGroupsSection() {
  const context = useContext(ResumeContext)
  if (!context) return null

  const { resumeData } = context
  const { addGroup, removeGroup, renameGroup, reorderGroups } =
    useSkillGroupsManagement()
  const [isAdding, setIsAdding] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result
    if (!destination) return
    if (destination.index === source.index) return
    reorderGroups(source.index, destination.index)
  }

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName)
      setNewGroupName('')
      setIsAdding(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddGroup()
    } else if (e.key === 'Escape') {
      setNewGroupName('')
      setIsAdding(false)
    }
  }

  return (
    <>
      <DnDContext onDragEnd={handleDragEnd}>
        <DnDDroppable droppableId="skill-groups">
          {(provided) => (
            <div
              className="flex flex-col gap-6"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {resumeData.skills.map((skill, index) => (
                <DnDDraggable
                  key={`skill-group-${skill.title}`}
                  draggableId={`skill-group-${skill.title}`}
                  index={index}
                >
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={snapshot.isDragging ? 'opacity-50' : ''}
                    >
                      <CollapsibleSection
                        title={skill.title}
                        icon={<Code className="h-5 w-5 text-blue-400" />}
                        editable={true}
                        onRename={(newTitle) =>
                          renameGroup(skill.title, newTitle)
                        }
                        onDelete={() => removeGroup(skill.title)}
                        dragHandleProps={dragProvided.dragHandleProps}
                      >
                        <Skill title={skill.title} />
                      </CollapsibleSection>
                    </div>
                  )}
                </DnDDraggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </DnDDroppable>
      </DnDContext>

      {/* Add Skill Group Button/Input */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
        {isAdding ? (
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Enter skill group name (e.g., 'Frontend Stack')"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                if (!newGroupName.trim()) setIsAdding(false)
              }}
              autoFocus
              className="flex-1 rounded-lg border border-blue-400 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/40 focus:ring-2 focus:ring-blue-400/20"
            />
            <button
              type="button"
              onClick={handleAddGroup}
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-medium text-white transition-all hover:from-blue-600 hover:to-purple-600"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setNewGroupName('')
                setIsAdding(false)
              }}
              className="rounded-lg bg-white/10 px-6 py-3 font-medium text-white/60 transition-all hover:bg-white/20 hover:text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-4 py-3 text-white/60 transition-all hover:border-blue-400/40 hover:bg-white/10 hover:text-blue-400"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Skill Group</span>
          </button>
        )}
      </div>
    </>
  )
}

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
        <MainLayout
          className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900"
          excludeFooterFromPrint
        >
          <div className="relative flex flex-1 flex-col md:grid md:grid-cols-[1fr_auto]">
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
              className="exclude-print flex-1 space-y-6 overflow-y-auto p-4 md:h-0 md:min-h-full md:flex-none md:space-y-8 md:p-6 lg:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-white/5"
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

                {/* Preview Mode Switcher */}
                <div className="flex overflow-hidden rounded-lg bg-white/5">
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

              {/* Skill Groups Section - Now Editable! */}
              <SkillGroupsSection />

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

            {/* Preview Section */}
            <div className="flex flex-col md:w-[8.5in]">
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
        </MainLayout>
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
