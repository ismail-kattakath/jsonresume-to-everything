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
import Projects from '@/components/resume/forms/Projects'
import PrintButton from '@/components/document-builder/ui/PrintButton'
import CollapsibleSection from '@/components/document-builder/ui/CollapsibleSection'
import { AccordionCard } from '@/components/ui/AccordionCard'
import AISettings from '@/components/document-builder/shared-forms/AISettings'
import ScaledPreviewWrapper from '@/components/document-builder/ui/ScaledPreviewWrapper'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  analyzeJobDescription,
  analyzeJobDescriptionGraph,
  sortSkillsGraph,
  extractSkillsGraph,
} from '@/lib/ai/strands/agent'
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
import { FormTextarea } from '@/components/ui/FormTextarea'
import { requestAISort } from '@/lib/ai/openai-client'
import {
  buildSkillsSortPrompt,
  parseSkillsSortResponse,
  applySortedSkills,
  type SkillsSortResult,
} from '@/lib/ai/sorting-prompts'
import { DEFAULT_COVER_LETTER_CONTENT } from '@/data/cover-letter'
import { generateSkillsToHighlightWithProvider } from '@/lib/ai/document-generator'
import { StreamCallback } from '@/types/openai'

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
  const { settings, updateSettings, isConfigured } = useAISettings()
  const [isSorting, setIsSorting] = useState(false)
  const [isExtractingSkills, setIsExtractingSkills] = useState(false)

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
      const sortPromise = sortSkillsGraph(
        resumeData.skills,
        settings.jobDescription,
        {
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model,
        },
        (chunk: {
          content?: string
          reasoning?: string
          done: boolean
        }) => {
          if (chunk.content) {
            console.log('[Skills Sort Graph]', chunk.content)
          }
        }
      )

      toast.promise(sortPromise, {
        loading: 'AI is sorting and optimizing your skills...',
        success: (sortResult: SkillsSortResult) => {
          const sortedSkills = applySortedSkills(resumeData.skills, sortResult)
          setResumeData({ ...resumeData, skills: sortedSkills })
          return 'Skills optimized and sorted by job relevance!'
        },
        error: (err) =>
          `Failed to sort skills: ${err.message || 'Unknown error occurred'}`,
      })

      await sortPromise
    } catch (error) {
      console.error('AI Skills sort error:', error)
      // toast.error is handled by toast.promise
    } finally {
      setIsSorting(false)
    }
  }

  const handleAIExtractSkills = async () => {
    if (!isConfigured) {
      toast.error('AI not configured', {
        description:
          'Please fill in the API settings and job description in the Generative AI Settings section above.',
      })
      return
    }

    if (
      !settings.jobDescription ||
      settings.jobDescription.trim().length < 50
    ) {
      toast.error('Job description too short', {
        description: 'Please provide a more detailed job description first.',
      })
      return
    }

    setIsExtractingSkills(true)
    const extractPromise = extractSkillsGraph(
      settings.jobDescription,
      resumeData,
      {
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
        model: settings.model,
      },
      (chunk: { content?: string; done: boolean }) => {
        if (chunk.content) {
          console.log('[Skills Extraction Graph]', chunk.content)
        }
      }
    )

    toast.promise(extractPromise, {
      loading: 'Extracting and aligning key skills...',
      success: (skills) => {
        updateSettings({ skillsToHighlight: skills })
        setIsExtractingSkills(false)
        return 'Skills extracted and aligned with your resume!'
      },
      error: (err) => {
        setIsExtractingSkills(false)
        return `Failed: ${err.message || 'Unknown error'}`
      },
    })

    await extractPromise
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

      {/* Skills to Highlight textarea */}
      <div className="pt-2">
        <FormTextarea
          label="Skills to highlight"
          name="skillsToHighlight"
          value={settings.skillsToHighlight}
          onChange={(e) =>
            updateSettings({ skillsToHighlight: e.target.value })
          }
          placeholder="E.g. Focus on cloud architecture, mention leadership experience..."
          variant="blue"
          minHeight="80px"
          helpText="Specify skills to highlight (comma-separated)"
          onAIAction={handleAIExtractSkills}
          isAILoading={isExtractingSkills}
          aiButtonTitle="Extract skills from JD"
          aiShowLabel={false}
          isAIConfigured={isConfigured}
          showCounter={false}
        />
      </div>
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

  // Load saved data on mount
  useEffect(() => {
    // 1. Load resume data
    const savedResumeData = localStorage.getItem('resumeData')
    let initialResumeData = resumeData

    if (savedResumeData) {
      try {
        const parsedResume = JSON.parse(savedResumeData)
        initialResumeData = parsedResume
        setResumeData(parsedResume)
      } catch (error) {
        console.error('Error loading saved resume data:', error)
      }
    }

    // Ensure projects are populated if missing from saved data but present in default
    if (!initialResumeData.projects && defaultResumeData.projects) {
      const dataWithProjects = {
        ...initialResumeData,
        projects: defaultResumeData.projects
      };
      setResumeData(dataWithProjects);
      initialResumeData = dataWithProjects;
    }

    // 2. Migrate skills data if needed
    if (initialResumeData.skills && initialResumeData.skills.length > 0) {
      const needsMigration = initialResumeData.skills.some((skillCategory) =>
        skillCategory.skills.some(
          (skill) =>
            typeof skill === 'string' ||
            ('underline' in skill && skill.highlight === undefined)
        )
      )

      if (needsMigration) {
        const migratedData = {
          ...initialResumeData,
          skills: initialResumeData.skills.map((skillCategory) => ({
            ...skillCategory,
            skills: skillCategory.skills.map((skill) => {
              if (typeof skill === 'string') {
                return { text: skill, highlight: false }
              }
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
        // Keep initialResumeData in sync for CL sync below
        initialResumeData = migratedData
      }
    }

    // 3. Load saved cover letter data
    const savedCLData = localStorage.getItem('coverLetterData')
    if (savedCLData) {
      try {
        const parsedData = JSON.parse(savedCLData)
        setCoverLetterData({
          ...defaultResumeData,
          ...parsedData,
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

  // Save resume data on change
  useEffect(() => {
    if (resumeData !== defaultResumeData) {
      localStorage.setItem('resumeData', JSON.stringify(resumeData))
    }
  }, [resumeData])

  // Save cover letter data on change
  useEffect(() => {
    // Check if it's different from the initial default state (which has default content)
    const isDefaultContent =
      coverLetterData.content === DEFAULT_COVER_LETTER_CONTENT
    const isDefaultData =
      JSON.stringify({ ...coverLetterData, content: '' }) ===
      JSON.stringify({ ...defaultResumeData, content: '' })

    if (!(isDefaultContent && isDefaultData)) {
      localStorage.setItem('coverLetterData', JSON.stringify(coverLetterData))
    }
  }, [coverLetterData])

  // Synchronize shared fields between resume and cover letter
  // Use refs to track the last synced values and prevent infinite loops
  const lastSyncedResumeData = useRef({
    name: resumeData.name,
    position: resumeData.position,
    email: resumeData.email,
    contactInformation: resumeData.contactInformation,
    address: resumeData.address,
    profileImage: resumeData.profileImage,
    socialMedia: resumeData.socialMedia,
  })
  const lastSyncedCoverLetterData = useRef({
    name: coverLetterData.name,
    position: coverLetterData.position,
    email: coverLetterData.email,
    contactInformation: coverLetterData.contactInformation,
    address: coverLetterData.address,
    profileImage: coverLetterData.profileImage,
    socialMedia: coverLetterData.socialMedia,
  })

  // Sync from resume to cover letter
  useEffect(() => {
    const currentResumeFields = {
      name: resumeData.name,
      position: resumeData.position,
      email: resumeData.email,
      contactInformation: resumeData.contactInformation,
      address: resumeData.address,
      profileImage: resumeData.profileImage,
      socialMedia: resumeData.socialMedia,
    }

    // Check if resume data actually changed (not just synced from cover letter)
    const resumeChanged = Object.keys(currentResumeFields).some(
      (key) =>
        JSON.stringify(
          currentResumeFields[key as keyof typeof currentResumeFields]
        ) !==
        JSON.stringify(
          lastSyncedResumeData.current[key as keyof typeof currentResumeFields]
        )
    )

    if (resumeChanged) {
      // Update cover letter with resume data
      setCoverLetterData((prev) => {
        const updated = {
          ...prev,
          ...currentResumeFields,
        }
        // Update last synced cover letter data
        lastSyncedCoverLetterData.current = {
          name: updated.name,
          position: updated.position,
          email: updated.email,
          contactInformation: updated.contactInformation,
          address: updated.address,
          profileImage: updated.profileImage,
          socialMedia: updated.socialMedia,
        }
        return updated
      })
      // Update last synced resume data
      lastSyncedResumeData.current = currentResumeFields
    }
  }, [
    resumeData.name,
    resumeData.position,
    resumeData.email,
    resumeData.contactInformation,
    resumeData.address,
    resumeData.profileImage,
    resumeData.socialMedia,
  ])

  // Sync from cover letter to resume
  useEffect(() => {
    const currentCoverLetterFields = {
      name: coverLetterData.name,
      position: coverLetterData.position,
      email: coverLetterData.email,
      contactInformation: coverLetterData.contactInformation,
      address: coverLetterData.address,
      profileImage: coverLetterData.profileImage,
      socialMedia: coverLetterData.socialMedia,
    }

    // Check if cover letter data actually changed (not just synced from resume)
    const coverLetterChanged = Object.keys(currentCoverLetterFields).some(
      (key) =>
        JSON.stringify(
          currentCoverLetterFields[key as keyof typeof currentCoverLetterFields]
        ) !==
        JSON.stringify(
          lastSyncedCoverLetterData.current[
          key as keyof typeof currentCoverLetterFields
          ]
        )
    )

    if (coverLetterChanged) {
      // Update resume with cover letter data
      setResumeData((prev) => {
        const updated = {
          ...prev,
          ...currentCoverLetterFields,
        }
        // Update last synced resume data
        lastSyncedResumeData.current = {
          name: updated.name,
          position: updated.position,
          email: updated.email,
          contactInformation: updated.contactInformation,
          address: updated.address,
          profileImage: updated.profileImage,
          socialMedia: updated.socialMedia,
        }
        return updated
      })
      // Update last synced cover letter data
      lastSyncedCoverLetterData.current = currentCoverLetterFields
    }
  }, [
    coverLetterData.name,
    coverLetterData.position,
    coverLetterData.email,
    coverLetterData.contactInformation,
    coverLetterData.address,
    coverLetterData.profileImage,
    coverLetterData.socialMedia,
  ])

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
                className="exclude-print fixed right-8 bottom-8 z-50 md:top-8 md:bottom-auto"
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
                  resumeData={
                    mode === 'resume'
                      ? resumeData
                      : (coverLetterData as ResumeData)
                  }
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
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${mode === 'resume'
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
                      className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${mode === 'coverLetter'
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

                <div id="section-social-media">
                  <CollapsibleSection
                    title="Social Media"
                    icon={<Share2 className="h-4 w-4 text-blue-400" />}
                    isExpanded={expandedSection === 'social-media'}
                    onToggle={createToggleHandler('social-media')}
                    tooltip={tooltips.sections.socialMedia}
                  >
                    <SocialMedia />
                  </CollapsibleSection>
                </div>

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

                    <div id="section-education">
                      <CollapsibleSection
                        title="Education"
                        icon={<GraduationCap className="h-4 w-4 text-blue-400" />}
                        isExpanded={expandedSection === 'education'}
                        onToggle={createToggleHandler('education')}
                        tooltip={tooltips.sections.education}
                      >
                        <Education />
                      </CollapsibleSection>
                    </div>

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

                    <div id="section-projects">
                      <CollapsibleSection
                        title="Featured Projects"
                        icon={<Briefcase className="h-4 w-4 text-blue-400" />}
                        isExpanded={expandedSection === 'projects'}
                        onToggle={createToggleHandler('projects')}
                        tooltip={tooltips.sections.projects}
                      >
                        <Projects />
                      </CollapsibleSection>
                    </div>

                    <div id="section-additional-info">
                      <CollapsibleSection
                        title="Additional Info"
                        icon={<Layers className="h-4 w-4 text-blue-400" />}
                        isExpanded={expandedSection === 'additional-info'}
                        onToggle={createToggleHandler('additional-info')}
                        tooltip={tooltips.sections.additionalInfo}
                      >
                        <AdditionalSections />
                      </CollapsibleSection>
                    </div>
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
