'use client'

import React, { useState, useEffect, useContext, useRef } from 'react'
import '@/styles/document-builder.css'
import '@/styles/resume-preview.css'
import { registerServiceWorker } from '@/lib/pwa/registerServiceWorker'

// Import components
import AdditionalSections from '@/components/resume/forms/AdditionalSections'
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
import CoverLetterContent from '@/components/cover-letter/forms/CoverLetterContent'
import PrintButton from '@/components/document-builder/ui/PrintButton'
import CollapsibleSection from '@/components/document-builder/ui/CollapsibleSection'
import { AccordionCard } from '@/components/ui/AccordionCard'
import AISettings from '@/components/document-builder/shared-forms/AISettings'
import ScaledPreviewWrapper from '@/components/document-builder/ui/ScaledPreviewWrapper'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  AISettingsProvider,
  useAISettings,
} from '@/lib/contexts/AISettingsContext'
import { CheckCircle, XCircle } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { useDocumentHandlers } from '@/hooks/useDocumentHandlers'
import { useSkillGroupsManagement } from '@/hooks/useSkillGroupsManagement'
import { useAccordion } from '@/hooks/useAccordion'
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
  Layers,
  Pencil,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  ArrowDownUp,
  Sparkles,
} from 'lucide-react'
import { MdAddCircle } from 'react-icons/md'
import {
  DnDContext,
  DnDDroppable,
  DnDDraggable,
} from '@/components/ui/DragAndDrop'
import type { DropResult } from '@hello-pangea/dnd'
import { Tooltip } from '@/components/ui/Tooltip'
import { tooltips } from '@/config/tooltips'
import { OnboardingTour } from '@/components/onboarding'
import AISortButton from '@/components/ui/AISortButton'
import { requestAISort } from '@/lib/ai/openai-client'
import {
  buildSkillsSortPrompt,
  parseSkillsSortResponse,
  applySortedSkills,
} from '@/lib/ai/sorting-prompts'

// Default cover letter content
const DEFAULT_COVER_LETTER_CONTENT =
  "I'm a Toronto-based Principal Software Engineer with 7+ years delivering production-ready full-stack applications using React, React Native, Node.js, and MongoDB—the exact stack you're seeking. At Homewood Health, I transformed an abandoned MEAN application into a nationally-deployed platform serving 100,000+ users with 99.5% uptime, implemented enterprise OAuth/SAML authentication, and led the AngularJS-to-Next.js migration while reducing deployment time by 92%. My experience architecting REST APIs with Express.js, integrating external SDKs, implementing security protocols, and managing agile sprints directly aligns with your requirements. Having built FDA-compliant healthcare systems and worked with cross-functional teams across multiple countries, I understand the rigorous standards and fast-paced environment of innovative startups like Speer. I'm excited to leverage my proven track record in building scalable, testable code to help deliver your groundbreaking technologies—let's discuss how I can contribute to your mission this week."

type EditorMode = 'resume' | 'coverLetter'

/**
 * AI Settings Status Indicator
 * Shows valid/invalid status in the section header
 */
function AISettingsStatusIndicator() {
  const { isConfigured } = useAISettings()

  return isConfigured ? (
    <CheckCircle
      className="mr-1 h-4 w-4 text-green-400"
      data-tooltip-id="app-tooltip"
      data-tooltip-content={tooltips.aiSettings.validStatus}
    />
  ) : (
    <XCircle
      className="mr-1 h-4 w-4 text-red-400"
      data-tooltip-id="app-tooltip"
      data-tooltip-content={tooltips.aiSettings.invalidStatus}
    />
  )
}

/**
 * Skill Group Header Component
 * Displays group name with expand/collapse and edit/delete controls
 */
function SkillGroupHeader({
  title,
  isExpanded,
  onToggle,
  onRename,
  onDelete,
  dragHandleProps,
}: {
  title: string
  isExpanded: boolean
  onToggle: () => void
  onRename: (newTitle: string) => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleRename = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onRename(editedTitle.trim())
    } else {
      setEditedTitle(title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditedTitle(title)
      setIsEditing(false)
    }
  }

  const handleDeleteClick = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This will remove all skills in this group.`
    )
    if (confirmed) {
      onDelete()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            className="cursor-grab text-white/40 hover:text-white/60 active:cursor-grabbing"
            data-tooltip-id="app-tooltip"
            data-tooltip-content={tooltips.skills.dragGroup}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="rounded border border-pink-400 bg-white/10 px-2 py-1 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-pink-400/20"
          />
        ) : (
          <button
            type="button"
            onClick={onToggle}
            className="flex min-w-0 items-center gap-1.5 text-left"
          >
            <span className="truncate text-sm font-semibold tracking-wide text-white/80">
              {title}
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  setIsEditing(true)
                }
              }}
              className="rounded p-0.5 text-white/30 transition-all hover:bg-white/10 hover:text-blue-400"
              data-tooltip-id="app-tooltip"
              data-tooltip-content={tooltips.skills.renameGroup}
            >
              <Pencil className="h-3 w-3" />
            </span>
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60"
            data-tooltip-id="app-tooltip"
            data-tooltip-content={
              isExpanded ? tooltips.actions.collapse : tooltips.actions.expand
            }
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-red-400"
            data-tooltip-id="app-tooltip"
            data-tooltip-content={tooltips.skills.deleteGroup}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Skills Section Component
 * Contains all skill groups (now rendered inside external CollapsibleSection)
 */
function SkillsSection() {
  const context = useContext(ResumeContext)
  const { settings, isConfigured } = useAISettings()
  const [isSorting, setIsSorting] = useState(false)

  if (!context) return null

  const { resumeData, setResumeData } = context
  const { addGroup, removeGroup, renameGroup, reorderGroups } =
    useSkillGroupsManagement()
  const [isAdding, setIsAdding] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const { isExpanded, toggleExpanded, expandNew, updateAfterReorder } =
    useAccordion()

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result
    if (!destination) return
    if (destination.index === source.index) return
    reorderGroups(source.index, destination.index)
    updateAfterReorder(source.index, destination.index)
  }

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      addGroup(newGroupName)
      expandNew(resumeData.skills.length)
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

  /* istanbul ignore next */
  const handleAISort = /* istanbul ignore next */ async () => {
    /* istanbul ignore next */
    if (!isConfigured || isSorting) return

    /* istanbul ignore next */
    setIsSorting(true)
    /* istanbul ignore next */
    try {
      const prompt = buildSkillsSortPrompt(
        resumeData.skills,
        settings.jobDescription
      )

      const response = await requestAISort(
        {
          baseURL: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model,
        },
        prompt
      )

      const sortResult = parseSkillsSortResponse(response, resumeData.skills)

      if (sortResult) {
        const sortedSkills = applySortedSkills(resumeData.skills, sortResult)
        setResumeData({ ...resumeData, skills: sortedSkills })
        toast.success('Skills sorted by job relevance')
      } else {
        toast.error('Failed to parse AI response. Please try again.')
      }
    } catch (error) {
      console.error('AI Skills sort error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to sort skills'
      )
    } finally {
      setIsSorting(false)
    }
  }

  return (
    <div className="space-y-6">
      <DnDContext onDragEnd={handleDragEnd}>
        <DnDDroppable droppableId="skill-groups">
          {(provided) => (
            <div
              className="space-y-5"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {resumeData.skills.map((skillGroup, index) => (
                <DnDDraggable
                  key={`skill-group-${skillGroup.title}`}
                  draggableId={`skill-group-${skillGroup.title}`}
                  index={index}
                >
                  {(dragProvided, snapshot) => (
                    <AccordionCard
                      isDragging={snapshot.isDragging}
                      isExpanded={isExpanded(index)}
                      theme="pink"
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      header={
                        <SkillGroupHeader
                          title={skillGroup.title}
                          isExpanded={isExpanded(index)}
                          onToggle={() => toggleExpanded(index)}
                          onRename={(newTitle) =>
                            renameGroup(skillGroup.title, newTitle)
                          }
                          onDelete={() => removeGroup(skillGroup.title)}
                          dragHandleProps={dragProvided.dragHandleProps}
                        />
                      }
                    >
                      <Skill title={skillGroup.title} />
                    </AccordionCard>
                  )}
                </DnDDraggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </DnDDroppable>
      </DnDContext>

      {/* Add Skill Group and Sort by JD buttons on same line */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g., Frontend, Backend, DevOps..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (!newGroupName.trim()) setIsAdding(false)
            }}
            autoFocus
            className="flex-1 rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
          />
          <button
            type="button"
            onClick={handleAddGroup}
            className="inline-flex cursor-pointer items-center gap-2 rounded bg-red-800 px-3 py-1.5 text-sm text-white transition-colors hover:opacity-90"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => {
              setNewGroupName('')
              setIsAdding(false)
            }}
            className="rounded px-2 py-1.5 text-sm text-white/40 transition-all hover:bg-white/10 hover:text-white/60"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            aria-label="Add Skill Group"
            className="inline-flex cursor-pointer items-center gap-2 rounded bg-red-800 px-3 py-1.5 text-sm text-white transition-colors hover:opacity-90"
            data-tooltip-id="app-tooltip"
            data-tooltip-content={tooltips.skills.addGroup}
          >
            <MdAddCircle className="text-lg" />
            <span>Add Skill Group</span>
          </button>
          <AISortButton
            isConfigured={isConfigured}
            isLoading={isSorting}
            onClick={handleAISort}
            label="Sort by JD"
            size="sm"
          />
        </div>
      )}
    </div>
  )
}

function UnifiedEditor() {
  // Editor mode state
  const [mode, setMode] = useState<EditorMode>('resume')

  // Accordion state - track which section is expanded
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  // Helper function to create accordion toggle handler
  const createToggleHandler = (sectionId: string) => () => {
    setExpandedSection((prev) => (prev === sectionId ? null : sectionId))
  }

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

  // Register service worker for PWA functionality
  useEffect(() => {
    registerServiceWorker()
  }, [])

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <Tooltip />
      <AISettingsProvider>
        <ResumeContext.Provider value={currentContext}>
          <MainLayout
            className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900"
            excludeFooterFromPrint
          >
            <div className="relative flex flex-1 flex-col md:grid md:grid-cols-[1fr_auto]">
              {/* Floating Action Button - Hidden on print */}
              <div
                id="print-button"
                className="exclude-print fixed right-8 bottom-8 z-50 flex flex-row items-center overflow-hidden rounded-full shadow-2xl md:top-8 md:bottom-auto"
              >
                <PrintButton
                  name={
                    mode === 'resume' ? resumeData.name : coverLetterData.name
                  }
                  position={
                    mode === 'resume'
                      ? resumeData.position
                      : coverLetterData.position
                  }
                  documentType={mode === 'resume' ? 'Resume' : 'CoverLetter'}
                />
              </div>

              <form
                onSubmit={(e) => e.preventDefault()}
                className="exclude-print flex-1 space-y-4 overflow-y-scroll p-4 md:h-0 md:min-h-full md:flex-none md:space-y-5 md:p-6 lg:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-white/5"
              >
                {/* Header */}
                <div
                  id="editor-header"
                  className="space-y-3 border-b border-white/10 pb-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">
                        AI Resume Builder
                      </h1>
                      <p className="text-xs text-white/60">
                        Tailor Resumes to Any Job Description
                      </p>
                    </div>
                  </div>

                  {/* Preview Mode Switcher */}
                  <div
                    id="mode-switcher"
                    className="flex overflow-hidden rounded-lg bg-white/5"
                  >
                    <button
                      type="button"
                      onClick={() => setMode('resume')}
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
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
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
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

                {/* Form Sections - Conditionally rendered based on mode */}
                <div id="section-import-export">
                  <CollapsibleSection
                    title="Import / Export"
                    icon={<ArrowDownUp className="h-4 w-4 text-amber-400" />}
                    isExpanded={expandedSection === 'import-export'}
                    onToggle={createToggleHandler('import-export')}
                    variant="utility"
                    tooltip={tooltips.sections.importExport}
                  >
                    <ImportExport preserveContent={mode === 'coverLetter'} />
                  </CollapsibleSection>
                </div>

                <div id="section-ai-settings">
                  <CollapsibleSection
                    title="Generative AI Settings"
                    icon={<Sparkles className="h-4 w-4 text-amber-400" />}
                    isExpanded={expandedSection === 'ai-settings'}
                    onToggle={createToggleHandler('ai-settings')}
                    action={<AISettingsStatusIndicator />}
                    variant="utility"
                    tooltip={tooltips.sections.aiSettings}
                  >
                    <AISettings />
                  </CollapsibleSection>
                </div>

                <div id="section-personal-info">
                  <CollapsibleSection
                    title="Personal Information"
                    icon={<User className="h-4 w-4 text-blue-400" />}
                    isExpanded={expandedSection === 'personal-info'}
                    onToggle={createToggleHandler('personal-info')}
                    tooltip={tooltips.sections.personalInfo}
                  >
                    <PersonalInformation />
                  </CollapsibleSection>
                </div>

                <CollapsibleSection
                  title="Social Media"
                  icon={<Share2 className="h-4 w-4 text-blue-400" />}
                  isExpanded={expandedSection === 'social-media'}
                  onToggle={createToggleHandler('social-media')}
                  tooltip={tooltips.sections.socialMedia}
                >
                  <SocialMedia />
                </CollapsibleSection>

                {/* Resume-only sections */}
                {mode === 'resume' && (
                  <>
                    <CollapsibleSection
                      title="Summary"
                      icon={<FileText className="h-4 w-4 text-blue-400" />}
                      isExpanded={expandedSection === 'summary'}
                      onToggle={createToggleHandler('summary')}
                      tooltip={tooltips.sections.summary}
                    >
                      <Summary />
                    </CollapsibleSection>

                    <CollapsibleSection
                      title="Education"
                      icon={<GraduationCap className="h-4 w-4 text-blue-400" />}
                      isExpanded={expandedSection === 'education'}
                      onToggle={createToggleHandler('education')}
                      tooltip={tooltips.sections.education}
                    >
                      <Education />
                    </CollapsibleSection>

                    <div id="section-work-experience">
                      <CollapsibleSection
                        title="Experience"
                        icon={<Briefcase className="h-4 w-4 text-blue-400" />}
                        isExpanded={expandedSection === 'work-experience'}
                        onToggle={createToggleHandler('work-experience')}
                        tooltip={tooltips.sections.workExperience}
                      >
                        <WorkExperience />
                      </CollapsibleSection>
                    </div>

                    {/* Skills Section - All groups in single collapsible */}
                    <div id="section-skills">
                      <CollapsibleSection
                        title="Skills"
                        icon={<Code className="h-4 w-4 text-blue-400" />}
                        isExpanded={expandedSection === 'skills'}
                        onToggle={createToggleHandler('skills')}
                        tooltip={tooltips.sections.skills}
                      >
                        <SkillsSection />
                      </CollapsibleSection>
                    </div>

                    <CollapsibleSection
                      title="Additional Info"
                      icon={<Layers className="h-4 w-4 text-blue-400" />}
                      isExpanded={expandedSection === 'additional-info'}
                      onToggle={createToggleHandler('additional-info')}
                      tooltip={tooltips.sections.additionalInfo}
                    >
                      <AdditionalSections />
                    </CollapsibleSection>
                  </>
                )}

                {/* Cover Letter-only sections */}
                {mode === 'coverLetter' && (
                  <CollapsibleSection
                    title="Content"
                    icon={<Mail className="h-4 w-4 text-blue-400" />}
                    isExpanded={expandedSection === 'cover-letter'}
                    onToggle={createToggleHandler('cover-letter')}
                    tooltip={tooltips.sections.coverLetterContent}
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
                )}
              </form>

              {/* Preview Section - Scaled for mobile, fixed width for desktop */}
              <div id="preview-pane" className="flex flex-col md:w-[8.5in]">
                <ScaledPreviewWrapper>
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
                    <div
                      className={mode === 'coverLetter' ? 'block' : 'hidden'}
                    >
                      <CoverLetterPreview />
                    </div>
                  </ResumeContext.Provider>
                </ScaledPreviewWrapper>
              </div>
            </div>
          </MainLayout>
        </ResumeContext.Provider>
      </AISettingsProvider>
    </>
  )
}

export default function ResumeEditPage() {
  return (
    <PasswordProtection>
      <OnboardingTour>
        <UnifiedEditor />
      </OnboardingTour>
    </PasswordProtection>
  )
}
