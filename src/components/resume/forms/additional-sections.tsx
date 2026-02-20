import React, { useState } from 'react'
import { AccordionCard } from '@/components/ui/accordion-card'
import { useAccordion } from '@/hooks/use-accordion'
import Language from '@/components/resume/forms/language'
import Certification from '@/components/resume/forms/certification'
import { Languages, Award, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'
import { DnDContext, DnDDroppable, DnDDraggable } from '@/components/ui/drag-and-drop'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Section configuration for additional resume sections
 */
interface SectionConfig {
  id: string
  title: string
  icon: React.ReactNode
  component: React.ReactNode
}

/**
 * Default sections configuration
 */
const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: 'languages',
    title: 'Languages',
    icon: <Languages className="h-4 w-4 text-emerald-400" />,
    component: <Language />,
  },
  {
    id: 'certifications',
    title: 'Certifications',
    icon: <Award className="h-4 w-4 text-violet-400" />,
    component: <Certification />,
  },
]

/**
 * Additional Sections component
 * Combines Languages and Certifications into a single collapsible section
 * with accordion behavior (one expanded at a time) and drag-and-drop reordering
 */
const AdditionalSections = () => {
  const [sections, setSections] = useState<SectionConfig[]>(DEFAULT_SECTIONS)
  const { isExpanded, toggleExpanded, updateAfterReorder } = useAccordion()

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result
    if (!destination) return
    if (destination.index === source.index) return

    const newSections = [...sections]
    const [removed] = newSections.splice(source.index, 1)
    if (removed) {
      newSections.splice(destination.index, 0, removed)
      setSections(newSections)
    }
    updateAfterReorder(source.index, destination.index)
  }

  return (
    <DnDContext onDragEnd={handleDragEnd}>
      <DnDDroppable droppableId="additional-sections">
        {(provided) => (
          <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
            {sections.map((section, index) => (
              <DnDDraggable key={section.id} draggableId={`additional-${section.id}`} index={index}>
                {(dragProvided, snapshot) => (
                  <AccordionCard
                    isDragging={snapshot.isDragging}
                    isExpanded={isExpanded(index)}
                    theme="teal"
                    innerRef={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    header={
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div
                            {...dragProvided.dragHandleProps}
                            className="cursor-grab text-white/40 hover:text-white/60 active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleExpanded(index)}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            {section.icon}
                            <span className="truncate text-sm font-semibold tracking-wide text-white/80">
                              {section.title}
                            </span>
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(index)}
                          className="rounded p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60"
                          title={isExpanded(index) ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded(index) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    }
                  >
                    {section.component}
                  </AccordionCard>
                )}
              </DnDDraggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </DnDDroppable>
    </DnDContext>
  )
}

export default AdditionalSections
