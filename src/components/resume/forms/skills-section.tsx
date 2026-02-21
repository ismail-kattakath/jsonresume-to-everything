'use client'

import React, { useState, useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/document-context'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { useSkillGroupsManagement } from '@/hooks/use-skill-groups-management'
import { useAccordion } from '@/hooks/use-accordion'
import { sortSkillsGraph, extractSkillsGraph } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'
import { FaPlusCircle } from 'react-icons/fa'
import { DnDContext, DnDDroppable, DnDDraggable } from '@/components/ui/drag-and-drop'
import { AccordionCard } from '@/components/ui/accordion-card'
import { SkillGroupHeader } from './skill-group-header'
import Skill from './skill'
import AIActionButton from '@/components/ui/ai-action-button'
import { AILoadingToast } from '@/components/ui/ai-loading-toast'
import { tooltips } from '@/config/tooltips'
import AIContentGenerator from '@/components/document-builder/shared-forms/ai-content-generator'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Skills Section Component
 * Contains all skill groups
 */
export function SkillsSection() {
  const context = useContext(ResumeContext)
  const { settings, updateSettings, isConfigured, setIsAnyAIActionActive } = useAISettings()
  const [isSorting, setIsSorting] = useState(false)

  if (!context) return null

  const { resumeData, setResumeData } = context
  const { addGroup, removeGroup, renameGroup, reorderGroups } = useSkillGroupsManagement()
  const [isAdding, setIsAdding] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  const { isExpanded, toggleExpanded, expandNew, updateAfterReorder } = useAccordion()

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
    setIsAnyAIActionActive(true)
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
        (chunk: { content?: string; reasoning?: string; done: boolean }) => {
          if (chunk.content) {
            console.log('[Skills Sort Graph]', chunk.content)
            if (!toastId) {
              toastId = toast(<AILoadingToast message={chunk.content} />, {
                duration: Infinity,
              })
            } else {
              toast(<AILoadingToast message={chunk.content} />, {
                id: toastId,
                duration: Infinity,
              })
            }
          }
        }
      )

      const sortResult = await sortPromise
      if (toastId) toast.dismiss(toastId)

      const { groupOrder, skillOrder } = sortResult

      // 1. Sort the skill groups based on groupOrder
      const updatedSkills = [...resumeData.skills]
        .sort((a, b) => {
          const aIndex = groupOrder.indexOf(a.title)
          const bIndex = groupOrder.indexOf(b.title)
          if (aIndex === -1) return 1
          if (bIndex === -1) return -1
          return aIndex - bIndex
        })
        // 2. Sort skills within each group based on skillOrder
        .map((group) => {
          const orderForThisGroup = skillOrder[group.title] || []
          return {
            ...group,
            skills: [...group.skills].sort((a, b) => {
              const aIndex = orderForThisGroup.indexOf(a.text)
              const bIndex = orderForThisGroup.indexOf(b.text)
              if (aIndex === -1) return 1
              if (bIndex === -1) return -1
              return aIndex - bIndex
            }),
          }
        })

      setResumeData({ ...resumeData, skills: updatedSkills })
      toast.success('Skills optimized and sorted by job relevance!')
    } catch (error) {
      console.error('AI Skills sort error:', error)
    } finally {
      setIsSorting(false)
      setIsAnyAIActionActive(false)
    }
  }

  return (
    <div className="space-y-6">
      <DnDContext onDragEnd={handleDragEnd}>
        <DnDDroppable droppableId="skill-groups">
          {(provided) => (
            <div className="space-y-5" {...provided.droppableProps} ref={provided.innerRef}>
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
                          onRename={(newTitle) => renameGroup(skillGroup.title, newTitle)}
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
            <FaPlusCircle className="text-lg" />
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
        <AIContentGenerator
          label="Skills to highlight"
          name="skillsToHighlight"
          value={settings.skillsToHighlight}
          onChange={(val) => updateSettings({ skillsToHighlight: typeof val === 'string' ? val : val.target.value })}
          onGenerated={(val) => updateSettings({ skillsToHighlight: val })}
          placeholder="E.g. Focus on cloud architecture, mention leadership experience..."
          variant="blue"
          minHeight="80px"
          mode="skillsToHighlight"
        />
        <p className="mt-1 text-xs text-white/50">{tooltips.skills.skillsToHighlight}</p>
      </div>
    </div>
  )
}
