import React, { useContext } from 'react'
import FormButton from '@/components/ui/form-button'
import { FormInput } from '@/components/ui/form-input'
import { AccordionCard, AccordionHeader } from '@/components/ui/accordion-card'
import { useArrayForm } from '@/hooks/use-array-form'
import { useAccordion } from '@/hooks/use-accordion'
import { ResumeContext } from '@/lib/contexts/document-context'
import { DnDContext, DnDDroppable, DnDDraggable } from '@/components/ui/drag-and-drop'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Education form component
 * Card-based layout with collapsible entries
 */
const Education = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const { data, handleChange, add, remove } = useArrayForm(
    'education',
    {
      school: '',
      url: '',
      studyType: '',
      area: '',
      startYear: '',
      endYear: '',
    },
    { urlFields: ['url'] }
  )

  const { isExpanded, toggleExpanded, expandNew, updateAfterReorder } = useAccordion()

  const handleAdd = () => {
    add()
    expandNew(data.length)
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination) return
    if (destination.index === source.index) return

    const newEducation = [...resumeData.education]
    const [removed] = newEducation.splice(source.index, 1)
    if (removed) {
      newEducation.splice(destination.index, 0, removed)
      setResumeData({ ...resumeData, education: newEducation })
    }

    updateAfterReorder(source.index, destination.index)
  }

  return (
    <div className="flex flex-col gap-4">
      <DnDContext onDragEnd={onDragEnd}>
        <DnDDroppable droppableId="education">
          {(provided) => (
            <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
              {data.map((education, index) => (
                <DnDDraggable key={`EDUCATION-${index}`} draggableId={`EDUCATION-${index}`} index={index}>
                  {(dragProvided, snapshot) => (
                    <AccordionCard
                      isDragging={snapshot.isDragging}
                      isExpanded={isExpanded(index)}
                      theme="indigo"
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      header={
                        <AccordionHeader
                          title={education.school}
                          subtitle={
                            education.studyType && education.area
                              ? `${education.studyType} in ${education.area}`
                              : education.studyType || education.area
                          }
                          placeholder="New Education"
                          isExpanded={isExpanded(index)}
                          onToggle={() => toggleExpanded(index)}
                          onDelete={() => remove(index)}
                          deleteTitle="Delete education"
                          dragHandleProps={dragProvided.dragHandleProps}
                        />
                      }
                    >
                      <FormInput
                        label="Institution Name"
                        name="school"
                        value={education.school}
                        onChange={(e) => handleChange(e, index)}
                        variant="indigo"
                      />

                      <FormInput
                        label="Website URL"
                        name="url"
                        type="url"
                        placeholder="Website URL (optional)"
                        value={education.url}
                        onChange={(e) => handleChange(e, index)}
                        variant="indigo"
                      />

                      <FormInput
                        label="Degree Type"
                        name="studyType"
                        placeholder="e.g., Bachelor's Degree, Master's Degree"
                        value={education.studyType}
                        onChange={(e) => handleChange(e, index)}
                        variant="indigo"
                      />

                      <FormInput
                        label="Field of Study"
                        name="area"
                        placeholder="e.g., Computer Science and Engineering"
                        value={education.area}
                        onChange={(e) => handleChange(e, index)}
                        variant="indigo"
                      />

                      <div className="flex w-full flex-col gap-3 sm:flex-row">
                        <FormInput
                          label="Start Date"
                          name="startYear"
                          type="date"
                          value={education.startYear}
                          onChange={(e) => handleChange(e, index)}
                          variant="indigo"
                          className="flex-1"
                        />

                        <FormInput
                          label="End Date"
                          name="endYear"
                          type="date"
                          value={education.endYear}
                          onChange={(e) => handleChange(e, index)}
                          variant="indigo"
                          className="flex-1"
                        />
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

      <FormButton size={data.length} add={handleAdd} label="Education" />
    </div>
  )
}

export default Education
