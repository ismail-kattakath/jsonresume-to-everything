import React, { useContext, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import FormButton from '@/components/ui/form-button'
import { FormInput } from '@/components/ui/form-input'
import { FormTextarea } from '@/components/ui/form-textarea'
import { AccordionCard, AccordionHeader } from '@/components/ui/accordion-card'
import { useArrayForm } from '@/hooks/use-array-form'
import { useAccordion } from '@/hooks/use-accordion'
import { ResumeContext } from '@/lib/contexts/document-context'
import { DnDContext, DnDDroppable, DnDDraggable } from '@/components/ui/drag-and-drop'
import KeyAchievements from '@/components/resume/forms/key-achievements'
import SortableTagInput from '@/components/ui/sortable-tag-input'
import AIActionButton from '@/components/ui/ai-action-button'
import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { sortSkillsGraph, sortTechStackGraph } from '@/lib/ai/strands/agent'
import { AILoadingToast } from '@/components/ui/ai-loading-toast'
import AIContentGenerator from '@/components/document-builder/shared-forms/ai-content-generator'
import type { DropResult } from '@hello-pangea/dnd'
import type { WorkExperience as WorkExperienceType, Achievement } from '@/types'

/**
 * Sort button for Tech Stack
 */
const TechStackSortButton = ({ workExperienceIndex }: { workExperienceIndex: number }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const { settings, isConfigured } = useAISettings()
  const [isSorting, setIsSorting] = useState(false)

  const workExperience = resumeData.workExperience[workExperienceIndex]
  if (!workExperience) return null

  const technologies = workExperience.technologies || []

  // Only show if there are 2+ technologies
  if (technologies.length < 2) return null

  /* istanbul ignore next */
  const handleAISort = async () => {
    if (!isConfigured || isSorting) return

    setIsSorting(true)
    let toastId: string | number | undefined

    const sortPromise = sortTechStackGraph(
      technologies,
      settings.jobDescription,
      {
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey,
        model: settings.model,
        providerType: settings.providerType,
      },
      (chunk) => {
        if (chunk.content) {
          console.log('[Tech Stack Sort Graph]', chunk.content)
          // Update toast with progress - scrub emojis if present
          const cleanMessage = chunk.content.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()

          if (!toastId) {
            toastId = toast(<AILoadingToast message={cleanMessage} />, {
              duration: Infinity,
            })
          } else {
            toast(<AILoadingToast message={cleanMessage} />, {
              id: toastId,
              duration: Infinity,
            })
          }
        }
      }
    )

    try {
      const sortedTechnologies = await sortPromise
      if (toastId) toast.dismiss(toastId)

      const newWorkExperience = [...resumeData.workExperience]
      newWorkExperience[workExperienceIndex] = {
        ...workExperience,
        technologies: sortedTechnologies,
      }
      setResumeData({ ...resumeData, workExperience: newWorkExperience })
      setIsSorting(false)
      toast.success('Tech stack sorted by job relevance')
    } catch (err: unknown) {
      if (toastId) toast.dismiss(toastId)
      setIsSorting(false)
      toast.error(`Failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <AIActionButton
      onClick={handleAISort}
      isLoading={isSorting}
      isConfigured={isConfigured}
      label={isSorting ? 'Sorting...' : 'Sort by JD'}
      showLabel={true}
      size="sm"
      variant="blue"
    />
  )
}
/**
 * Work Experience form component
 * Card-based layout with collapsible entries
 */
const WorkExperience = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const { settings, isConfigured } = useAISettings()
  const { data, handleChange, add, remove } = useArrayForm<WorkExperienceType>(
    'workExperience',
    {
      organization: '',
      url: '',
      position: '',
      description: '',
      keyAchievements: [] as Achievement[],
      startYear: '',
      endYear: '',
      technologies: [] as string[],
      showTechnologies: true, // Default to visible
    },
    { urlFields: ['url'] }
  )

  const { isExpanded, toggleExpanded, expandNew, updateAfterReorder } = useAccordion()

  const toggleTechnologiesVisibility = (index: number) => {
    const workExperience = resumeData.workExperience[index]
    if (!workExperience) return

    const newWorkExperience = [...resumeData.workExperience]
    newWorkExperience[index] = {
      ...workExperience,
      showTechnologies: !workExperience.showTechnologies,
    }
    setResumeData({ ...resumeData, workExperience: newWorkExperience })
  }

  const handleAdd = () => {
    add()
    expandNew(data.length)
  }

  const handleRemove = (index: number) => {
    remove(index)
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination) return
    if (destination.index === source.index) return

    const newWorkExperience = [...resumeData.workExperience]
    const [removed] = newWorkExperience.splice(source.index, 1)
    if (removed) {
      newWorkExperience.splice(destination.index, 0, removed)
      setResumeData({ ...resumeData, workExperience: newWorkExperience })
      updateAfterReorder(source.index, destination.index)
    }
  }

  const handleAddTechnology = (index: number, technology: string) => {
    const workExperience = resumeData.workExperience[index]
    if (!workExperience) return

    const newWorkExperience = [...resumeData.workExperience]
    const technologies = workExperience.technologies || []
    newWorkExperience[index] = {
      ...workExperience,
      technologies: [...technologies, technology],
    }
    setResumeData({ ...resumeData, workExperience: newWorkExperience })
  }

  const handleRemoveTechnology = (index: number, techIndex: number) => {
    const workExperience = resumeData.workExperience[index]
    if (!workExperience) return

    const newWorkExperience = [...resumeData.workExperience]
    const technologies = [...(workExperience.technologies || [])]
    technologies.splice(techIndex, 1)
    newWorkExperience[index] = {
      ...workExperience,
      technologies,
    }
    setResumeData({ ...resumeData, workExperience: newWorkExperience })
  }

  const handleReorderTechnology = (index: number, startIndex: number, endIndex: number) => {
    const workExperience = resumeData.workExperience[index]
    if (!workExperience) return

    const newWorkExperience = [...resumeData.workExperience]
    const technologies = [...(workExperience.technologies || [])]
    const [removed] = technologies.splice(startIndex, 1)
    if (removed) {
      technologies.splice(endIndex, 0, removed)
      newWorkExperience[index] = {
        ...workExperience,
        technologies,
      }
      setResumeData({ ...resumeData, workExperience: newWorkExperience })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DnDContext onDragEnd={onDragEnd}>
        <DnDDroppable droppableId="work-experience">
          {(provided) => (
            <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
              {data.map((workExperience, index) => (
                <DnDDraggable key={`WORK-${index}`} draggableId={`WORK-${index}`} index={index}>
                  {(dragProvided, snapshot) => (
                    <AccordionCard
                      isDragging={snapshot.isDragging}
                      isExpanded={isExpanded(index)}
                      theme="teal"
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      header={
                        <AccordionHeader
                          title={workExperience.organization}
                          subtitle={workExperience.position}
                          placeholder="New Experience"
                          isExpanded={isExpanded(index)}
                          onToggle={() => toggleExpanded(index)}
                          onDelete={() => handleRemove(index)}
                          deleteTitle="Delete experience"
                          dragHandleProps={dragProvided.dragHandleProps}
                        />
                      }
                    >
                      <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <FormInput
                          label="Organization Name"
                          name="organization"
                          value={workExperience.organization}
                          onChange={(e) => handleChange(e, index)}
                          variant="teal"
                          className="flex-1"
                        />

                        <FormInput
                          label="Organization Website URL"
                          name="url"
                          type="url"
                          value={workExperience.url}
                          onChange={(e) => handleChange(e, index)}
                          variant="teal"
                          className="flex-1"
                        />
                      </div>

                      <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <FormInput
                          label="Start Date"
                          name="startYear"
                          type="date"
                          value={workExperience.startYear}
                          onChange={(e) => handleChange(e, index)}
                          variant="teal"
                          className="flex-1"
                        />

                        <FormInput
                          label="End Date"
                          name="endYear"
                          type="date"
                          value={workExperience.endYear}
                          onChange={(e) => handleChange(e, index)}
                          variant="teal"
                          className="flex-1"
                        />
                      </div>

                      <FormInput
                        label="Job Title"
                        name="position"
                        value={workExperience.position}
                        onChange={(e) => handleChange(e, index)}
                        variant="teal"
                      />

                      <AIContentGenerator
                        label="Description"
                        name="description"
                        placeholder="Brief company/role description..."
                        value={workExperience.description}
                        onChange={(e) => {
                          if (typeof e === 'string') {
                            const newWorkExperience = [...resumeData.workExperience]
                            newWorkExperience[index] = { ...workExperience, description: e }
                            setResumeData({ ...resumeData, workExperience: newWorkExperience })
                          } else {
                            handleChange(e as any, index)
                          }
                        }}
                        onGenerated={(val) => {
                          const newWorkExperience = [...resumeData.workExperience]
                          newWorkExperience[index] = { ...workExperience, description: val }
                          setResumeData({ ...resumeData, workExperience: newWorkExperience })
                        }}
                        variant="teal"
                        maxLength={250}
                        showCharacterCount={false}
                        minHeight="100px"
                        mode="workExperience"
                        experienceData={{
                          organization: workExperience.organization,
                          position: workExperience.position,
                          achievements: (workExperience.keyAchievements || []).map((a) => a.text),
                        }}
                      />

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <label className="text-sm font-medium text-white">Key Achievements</label>
                        </div>
                        <KeyAchievements workExperienceIndex={index} variant="teal" />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <label className="text-sm font-medium text-white">Tech Stack</label>
                          <TechStackSortButton workExperienceIndex={index} />
                          <button
                            type="button"
                            onClick={() => toggleTechnologiesVisibility(index)}
                            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/60"
                            title={
                              workExperience.showTechnologies !== false
                                ? 'Hide technologies in preview'
                                : 'Show technologies in preview'
                            }
                          >
                            {workExperience.showTechnologies !== false ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {workExperience.showTechnologies !== false && (
                          <SortableTagInput
                            tags={workExperience.technologies || []}
                            onAdd={(tech) => handleAddTechnology(index, tech)}
                            onRemove={(techIndex) => handleRemoveTechnology(index, techIndex)}
                            onReorder={(startIndex, endIndex) => handleReorderTechnology(index, startIndex, endIndex)}
                            placeholder="Add tech stack..."
                            variant="teal"
                          />
                        )}
                      </div>
                    </AccordionCard>
                  )}
                </DnDDraggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </DnDDroppable>
      </DnDContext>

      <FormButton size={data.length} add={handleAdd} label="Experience" />
    </div>
  )
}

export default WorkExperience
