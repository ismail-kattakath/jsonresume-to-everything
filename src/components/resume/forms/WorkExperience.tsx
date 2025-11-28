import React, { useContext, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
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
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Work Experience form component
 * Card-based layout with collapsible entries
 */
const WorkExperience = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const { data, handleChange, add, remove } = useArrayForm(
    'workExperience',
    {
      organization: '',
      url: '',
      position: '',
      description: '',
      keyAchievements: [],
      startYear: '',
      endYear: '',
      technologies: [],
    },
    { urlFields: ['url'] }
  )

  const { isExpanded, toggleExpanded, expandNew, updateAfterReorder } =
    useAccordion()

  // Track visibility of Technologies section for each work experience
  const [technologiesVisible, setTechnologiesVisible] = useState<boolean[]>(
    data.map(() => true)
  )

  const toggleTechnologiesVisibility = (index: number) => {
    setTechnologiesVisible((prev) => {
      const newVisible = [...prev]
      newVisible[index] = !newVisible[index]
      return newVisible
    })
  }

  const handleAdd = () => {
    add()
    expandNew(data.length)
    // Add visibility state for new entry (default: visible)
    setTechnologiesVisible((prev) => [...prev, true])
  }

  const handleRemove = (index: number) => {
    remove(index)
    // Remove corresponding visibility state
    setTechnologiesVisible((prev) => {
      const newVisible = [...prev]
      newVisible.splice(index, 1)
      return newVisible
    })
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination) return
    if (destination.index === source.index) return

    const newWorkExperience = [...resumeData.workExperience]
    const [removed] = newWorkExperience.splice(source.index, 1)
    newWorkExperience.splice(destination.index, 0, removed)
    setResumeData({ ...resumeData, workExperience: newWorkExperience })

    // Reorder visibility state to match
    setTechnologiesVisible((prev) => {
      const newVisible = [...prev]
      const [removedVisible] = newVisible.splice(source.index, 1)
      newVisible.splice(destination.index, 0, removedVisible)
      return newVisible
    })

    updateAfterReorder(source.index, destination.index)
  }

  const handleAddTechnology = (index: number, technology: string) => {
    const newWorkExperience = [...resumeData.workExperience]
    const technologies = newWorkExperience[index].technologies || []
    newWorkExperience[index] = {
      ...newWorkExperience[index],
      technologies: [...technologies, technology],
    }
    setResumeData({ ...resumeData, workExperience: newWorkExperience })
  }

  const handleRemoveTechnology = (index: number, techIndex: number) => {
    const newWorkExperience = [...resumeData.workExperience]
    const technologies = [...(newWorkExperience[index].technologies || [])]
    technologies.splice(techIndex, 1)
    newWorkExperience[index] = {
      ...newWorkExperience[index],
      technologies,
    }
    setResumeData({ ...resumeData, workExperience: newWorkExperience })
  }

  const handleReorderTechnology = (
    index: number,
    startIndex: number,
    endIndex: number
  ) => {
    const newWorkExperience = [...resumeData.workExperience]
    const technologies = [...(newWorkExperience[index].technologies || [])]
    const [removed] = technologies.splice(startIndex, 1)
    technologies.splice(endIndex, 0, removed)
    newWorkExperience[index] = {
      ...newWorkExperience[index],
      technologies,
    }
    setResumeData({ ...resumeData, workExperience: newWorkExperience })
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

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                          Key Achievements
                        </label>
                        <KeyAchievements
                          workExperienceIndex={index}
                          variant="teal"
                        />
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <label className="text-sm font-medium text-white">
                            Technologies
                          </label>
                          <button
                            type="button"
                            onClick={() => toggleTechnologiesVisibility(index)}
                            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/60"
                            title={
                              technologiesVisible[index]
                                ? 'Hide technologies'
                                : 'Show technologies'
                            }
                          >
                            {technologiesVisible[index] ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {technologiesVisible[index] && (
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
                            placeholder="Add technology..."
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
