'use client'

import React, { useState, useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { useSkillGroupsManagement } from '@/hooks/useSkillGroupsManagement'
import { useAccordion } from '@/hooks/useAccordion'
import { sortSkillsGraph, extractSkillsGraph } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'
import { MdAddCircle } from 'react-icons/md'
import { DnDContext, DnDDroppable, DnDDraggable } from '@/components/ui/DragAndDrop'
import { AccordionCard } from '@/components/ui/AccordionCard'
import { SkillGroupHeader } from './SkillGroupHeader'
import Skill from './Skill'
import AIActionButton from '@/components/ui/AIActionButton'
import { FormTextarea } from '@/components/ui/FormTextarea'
import { AILoadingToast } from '@/components/ui/AILoadingToast'
import { tooltips } from '@/config/tooltips'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Skills Section Component
 * Contains all skill groups
 */
export function SkillsSection() {
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

    const handleAISort = async () => {
        if (!isConfigured || isSorting) return

        setIsSorting(true)
        try {
            let toastId: string | number | undefined

            const sortPromise = sortSkillsGraph(
                resumeData.skills,
                settings.jobDescription,
                {
                    apiUrl: settings.apiUrl,
                    apiKey: settings.apiKey,
                    model: settings.model,
                    providerType: settings.providerType,
                },
                (chunk: {
                    content?: string
                    reasoning?: string
                    done: boolean
                }) => {
                    if (chunk.content) {
                        console.log('[Skills Sort Graph]', chunk.content)
                        if (!toastId) {
                            toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
                        } else {
                            toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
                        }
                    }
                }
            )

            const sortResult = await sortPromise
            if (toastId) toast.dismiss(toastId)

            const sortedSkillNames = sortResult.sortedSkills
            const updatedSkills = resumeData.skills.map((group) => ({
                ...group,
                skills: group.skills
                    .slice()
                    .sort((a, b) => {
                        const aIndex = sortedSkillNames.indexOf(a.text)
                        const bIndex = sortedSkillNames.indexOf(b.text)
                        if (aIndex === -1) return 1
                        if (bIndex === -1) return -1
                        return aIndex - bIndex
                    }),
            }))

            setResumeData({ ...resumeData, skills: updatedSkills })
            toast.success('Skills optimized and sorted by job relevance!')
        } catch (error) {
            console.error('AI Skills sort error:', error)
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
        let toastId: string | number | undefined

        const extractPromise = extractSkillsGraph(
            settings.jobDescription,
            {
                apiUrl: settings.apiUrl,
                apiKey: settings.apiKey,
                model: settings.model,
                providerType: settings.providerType,
            },
            (chunk: { content?: string; done: boolean }) => {
                if (chunk.content) {
                    console.log('[Skills Extraction Graph]', chunk.content)
                    if (!toastId) {
                        toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
                    } else {
                        toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
                    }
                }
            }
        )

        try {
            const skills = await extractPromise
            if (toastId) toast.dismiss(toastId)

            updateSettings({ skillsToHighlight: skills })
            setIsExtractingSkills(false)
            toast.success('Skills extracted and aligned with your resume!')
        } catch (err: any) {
            if (toastId) toast.dismiss(toastId)
            setIsExtractingSkills(false)
            toast.error(`Failed: ${err.message || 'Unknown error'}`)
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
                    <AIActionButton
                        onClick={handleAISort}
                        isLoading={isSorting}
                        isConfigured={isConfigured}
                        label={isSorting ? 'Sorting...' : 'Sort by JD'}
                        showLabel={true}
                    />
                </div>
            )}

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
                    aiVariant="amber"
                    isAIConfigured={isConfigured}
                    showCounter={false}
                />
            </div>
        </div>
    )
}
