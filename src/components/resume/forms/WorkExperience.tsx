import React, { useContext, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import FormButton from '@/components/ui/FormButton'
import { FormInput } from '@/components/ui/FormInput'
import { FormTextarea } from '@/components/ui/FormTextarea'
import { AccordionCard, AccordionHeader } from '@/components/ui/AccordionCard'
import { useArrayForm } from '@/hooks/useArrayForm'
import { useAccordion } from '@/hooks/useAccordion'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  DnDContext,
  DnDDroppable,
  DnDDraggable,
} from '@/components/ui/DragAndDrop'
import KeyAchievements from '@/components/resume/forms/KeyAchievements'
import SortableTagInput from '@/components/ui/SortableTagInput'
import AIActionButton from '@/components/ui/AIActionButton'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import {
  sortSkillsGraph,
  sortTechStackGraph,
  tailorExperienceToJD,
} from '@/lib/ai/strands/agent'
import { AILoadingToast } from '@/components/ui/AILoadingToast'
import type { DropResult } from '@hello-pangea/dnd'
import type { WorkExperience as WorkExperienceType, Achievement } from '@/types'

/**
 * Sort button for Key Achievements
 */
const KeyAchievementsSortButton = ({
  workExperienceIndex,
}: {
  workExperienceIndex: number
}) => {
  return null // Still null because KeyAchievements component should handle its own button now
}

/**
 * Sort button for Tech Stack
 */
const TechStackSortButton = ({
  workExperienceIndex,
}: {
  workExperienceIndex: number
}) => {
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
          // Update toast with progress
          if (!toastId) {
            toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
          } else {
            toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
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
    } catch (err: any) {
      if (toastId) toast.dismiss(toastId)
      setIsSorting(false)
      toast.error(`Failed: ${err.message || 'Unknown error'}`)
    }

    await sortPromise
  }

  return (
    <AIActionButton
      onClick={handleAISort}
      isLoading={isSorting}
      isConfigured={isConfigured}
      label={isSorting ? 'Sorting...' : 'Sort by JD'}
      showLabel={true}
      size="sm"
      variant="amber"
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
  const [isTailoringExperience, setIsTailoringExperience] = useState<Record<number, boolean>>({})

  const { isExpanded, toggleExpanded, expandNew, updateAfterReorder } =
    useAccordion()

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

  const handleReorderTechnology = (
    index: number,
    startIndex: number,
    endIndex: number
  ) => {
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

  const handleTailorToJD = async (index: number) => {
    const workExperience = resumeData.workExperience[index]
    if (!workExperience || !isConfigured || !settings.jobDescription) return

    setIsTailoringExperience(prev => ({ ...prev, [index]: true }))
    let toastId: string | number | undefined

    try {
      const achievements = (workExperience.keyAchievements || []).map(a => a.text)

      const result = await tailorExperienceToJD(
        workExperience.description,
        achievements,
        workExperience.position,
        workExperience.organization,
        settings.jobDescription,
        {
          apiUrl: settings.apiUrl,
          apiKey: settings.apiKey,
          model: settings.model,
          providerType: settings.providerType,
        },
        (chunk) => {
          if (chunk.content) {
            if (!toastId) {
              toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
            } else {
              toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
            }
          }
        }
      )

      if (toastId) toast.dismiss(toastId)

      // Update description and achievements
      const newWorkExperience = [...resumeData.workExperience]
      newWorkExperience[index] = {
        ...workExperience,
        description: result.description,
        keyAchievements: result.achievements.map(text => ({ text })),
      }
      setResumeData({ ...resumeData, workExperience: newWorkExperience })
      toast.success('Experience tailored to job description')
    } catch (error: any) {
      if (toastId) toast.dismiss(toastId)
      console.error('Experience tailoring error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to tailor experience'
      )
    } finally {
      setIsTailoringExperience(prev => ({ ...prev, [index]: false }))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <DnDContext onDragEnd={onDragEnd}>
        <DnDDroppable droppableId="work-experience">
          {(provided) => (
            <div
              className="space-y-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {data.map((workExperience, index) => (
                <DnDDraggable
                  key={`WORK-${index}`}
                  draggableId={`WORK-${index}`}
                  index={index}
                >
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

                      <div className="relative">
                        <FormTextarea
                          label="Description"
                          name="description"
                          placeholder="Brief company/role description..."
                          value={workExperience.description}
                          onChange={(e) => handleChange(e, index)}
                          variant="teal"
                          maxLength={250}
                          showCounter
                          minHeight="100px"
                        />
                        <div className="absolute bottom-2 right-2">
                          <AIActionButton
                            isConfigured={isConfigured && !!settings.jobDescription}
                            isLoading={isTailoringExperience[index] || false}
                            onClick={() => handleTailorToJD(index)}
                            label="Tailor Experience"
                            showLabel={false}
                            size="sm"
                            variant="amber"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <label className="text-sm font-medium text-white">
                            Key Achievements
                          </label>
                          <KeyAchievementsSortButton
                            workExperienceIndex={index}
                          />
                        </div>
                        <KeyAchievements
                          workExperienceIndex={index}
                          variant="teal"
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <label className="text-sm font-medium text-white">
                            Tech Stack
                          </label>
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
                            onRemove={(techIndex) =>
                              handleRemoveTechnology(index, techIndex)
                            }
                            onReorder={(startIndex, endIndex) =>
                              handleReorderTechnology(
                                index,
                                startIndex,
                                endIndex
                              )
                            }
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
