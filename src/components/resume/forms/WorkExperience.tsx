import React, { useContext, useState } from 'react'
import FormButton from '@/components/ui/FormButton'
import { FormInput } from '@/components/ui/FormInput'
import { FormTextarea } from '@/components/ui/FormTextarea'
import { useArrayForm } from '@/hooks/useArrayForm'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { GripVertical, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import {
  DnDContext,
  DnDDroppable,
  DnDDraggable,
} from '@/components/ui/DragAndDrop'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Work Experience Entry Header
 * Shows company/position with expand/collapse and delete controls
 */
function WorkExperienceHeader({
  company,
  position,
  isExpanded,
  onToggle,
  onDelete,
  dragHandleProps,
}: {
  company: string
  position: string
  isExpanded: boolean
  onToggle: () => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null
}) {
  const handleDeleteClick = () => {
    const displayName = company || position || 'this entry'
    const confirmed = window.confirm(
      `Are you sure you want to delete "${displayName}"?`
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
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold tracking-wide text-white/80">
              {company || 'New Experience'}
            </span>
            {position && (
              <span className="block truncate text-xs text-white/50">
                {position}
              </span>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onToggle}
          className="rounded p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60"
          title={isExpanded ? 'Collapse' : 'Expand'}
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
          title="Delete experience"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/**
 * Work Experience form component
 * Card-based layout with collapsible entries
 */
const WorkExperience = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const { data, handleChange, add, remove } = useArrayForm(
    'workExperience',
    {
      company: '',
      url: '',
      position: '',
      description: '',
      keyAchievements: '',
      startYear: '',
      endYear: '',
      technologies: [],
    },
    { urlFields: ['url'] }
  )

  // Track which entries are expanded (new entries start expanded)
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(
    () => new Set(data.map((_, i) => i))
  )

  const toggleExpanded = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleAdd = () => {
    add()
    // Expand the new entry
    setExpandedIndices((prev) => new Set([...prev, data.length]))
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination) return
    if (destination.index === source.index) return

    const newWorkExperience = [...resumeData.workExperience]
    const [removed] = newWorkExperience.splice(source.index, 1)
    newWorkExperience.splice(destination.index, 0, removed)
    setResumeData({ ...resumeData, workExperience: newWorkExperience })

    // Update expanded indices after reorder
    setExpandedIndices((prev) => {
      const next = new Set<number>()
      prev.forEach((i) => {
        if (i === source.index) {
          next.add(destination.index)
        } else if (i > source.index && i <= destination.index) {
          next.add(i - 1)
        } else if (i < source.index && i >= destination.index) {
          next.add(i + 1)
        } else {
          next.add(i)
        }
      })
      return next
    })
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
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`rounded-lg border border-white/10 bg-white/5 p-3 transition-all ${
                        snapshot.isDragging ? 'opacity-50 shadow-lg' : ''
                      }`}
                    >
                      <WorkExperienceHeader
                        company={workExperience.company}
                        position={workExperience.position}
                        isExpanded={expandedIndices.has(index)}
                        onToggle={() => toggleExpanded(index)}
                        onDelete={() => remove(index)}
                        dragHandleProps={dragProvided.dragHandleProps}
                      />

                      {/* Collapsible content */}
                      <div
                        className={`transition-all duration-300 ease-in-out ${
                          expandedIndices.has(index)
                            ? 'mt-3 max-h-[2000px] opacity-100'
                            : 'max-h-0 overflow-hidden opacity-0'
                        }`}
                      >
                        <div className="space-y-3 border-t border-white/10 pt-3">
                          <FormInput
                            label="Company Name"
                            name="company"
                            value={workExperience.company}
                            onChange={(e) => handleChange(e, index)}
                            variant="teal"
                          />

                          <FormInput
                            label="Company Website URL"
                            name="url"
                            type="url"
                            value={workExperience.url}
                            onChange={(e) => handleChange(e, index)}
                            variant="teal"
                          />

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

                          <FormTextarea
                            label="Key Achievements"
                            name="keyAchievements"
                            placeholder="Key achievements and responsibilities..."
                            value={workExperience.keyAchievements}
                            onChange={(e) => handleChange(e, index)}
                            variant="teal"
                            showCounter
                            minHeight="120px"
                          />

                          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
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
                        </div>
                      </div>
                    </div>
                  )}
                </DnDDraggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </DnDDroppable>
      </DnDContext>

      <FormButton size={data.length} add={handleAdd} label="Work Experience" />
    </div>
  )
}

export default WorkExperience
