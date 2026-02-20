'use client'
import React, { useContext, useState, useEffect, useCallback } from 'react'
import FormButton from '@/components/ui/FormButton'
import { FormInput } from '@/components/ui/FormInput'
import { AccordionCard, AccordionHeader } from '@/components/ui/AccordionCard'
import { useArrayForm } from '@/hooks/useArrayForm'
import { useAccordion } from '@/hooks/useAccordion'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { DnDContext, DnDDroppable, DnDDraggable } from '@/components/ui/DragAndDrop'
import type { DropResult } from '@hello-pangea/dnd'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

type ValidationStatus = 'empty' | 'checking' | 'valid' | 'invalid'

/**
 * URL Status Indicator Component
 * Shows a subtle pill indicator for URL validation status
 */
function UrlStatusIndicator({ status }: { status: ValidationStatus }) {
  switch (status) {
    case 'valid':
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-400"
          title="URL is reachable"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Valid</span>
        </span>
      )
    case 'invalid':
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs text-red-400"
          title="URL may be unreachable"
        >
          <XCircle className="h-3 w-3" />
          <span>Check URL</span>
        </span>
      )
    case 'checking':
      return (
        <span
          className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400"
          title="Validating URL..."
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Checking</span>
        </span>
      )
    case 'empty':
    default:
      return null
  }
}

/**
 * Social Media form component
 * Card-based layout with collapsible entries, matching WorkExperience/Education pattern
 */
const SocialMedia = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const { data, handleChange, add, remove } = useArrayForm(
    'socialMedia',
    { socialMedia: '', link: '' },
    { urlFields: ['link'] }
  )

  const { isExpanded, toggleExpanded, expandNew, updateAfterReorder } = useAccordion()

  const [validationStatus, setValidationStatus] = useState<Record<number, ValidationStatus>>({})

  // Validate URL
  const validateUrl = useCallback(async (url: string, index: number) => {
    if (!url || url.trim() === '') {
      setValidationStatus((prev) => ({ ...prev, [index]: 'empty' }))
      return
    }

    setValidationStatus((prev) => ({ ...prev, [index]: 'checking' }))

    try {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`
      await fetch(fullUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
      })
      setValidationStatus((prev) => ({ ...prev, [index]: 'valid' }))
    } catch {
      setValidationStatus((prev) => ({ ...prev, [index]: 'invalid' }))
    }
  }, [])

  // Debounce URL validation
  useEffect(() => {
    const timeouts: Record<number, NodeJS.Timeout> = {}
    data.forEach((socialMedia, index) => {
      if (socialMedia.link) {
        timeouts[index] = setTimeout(() => {
          validateUrl(socialMedia.link, index)
        }, 1000)
      } else {
        setValidationStatus((prev) => ({ ...prev, [index]: 'empty' }))
      }
    })

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout))
    }
  }, [data, validateUrl])

  const handleAdd = () => {
    add()
    expandNew(data.length)
  }

  const handleRemove = (index: number) => {
    remove(index)
    // Reindex validation status
    setValidationStatus((prev) => {
      const newStatus: Record<number, ValidationStatus> = {}
      Object.keys(prev).forEach((key) => {
        const keyIndex = parseInt(key)
        const status = prev[keyIndex]
        if (!status) return

        if (keyIndex < index) {
          newStatus[keyIndex] = status
        } else if (keyIndex > index) {
          newStatus[keyIndex - 1] = status
        }
      })
      return newStatus
    })
  }

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result

    if (!destination) return
    if (destination.index === source.index) return

    const newSocialMedia = [...resumeData.socialMedia]
    const [removed] = newSocialMedia.splice(source.index, 1)
    if (removed) {
      newSocialMedia.splice(destination.index, 0, removed)
      setResumeData({ ...resumeData, socialMedia: newSocialMedia })
    }

    updateAfterReorder(source.index, destination.index)

    // Reindex validation status for drag
    setValidationStatus((prev) => {
      const newStatus: Record<number, ValidationStatus> = {}
      Object.keys(prev).forEach((key) => {
        const keyIndex = parseInt(key)
        const status = prev[keyIndex]
        if (!status) return

        if (keyIndex === source.index) {
          newStatus[destination.index] = status
        } else if (keyIndex > source.index && keyIndex <= destination.index && source.index < destination.index) {
          newStatus[keyIndex - 1] = status
        } else if (keyIndex < source.index && keyIndex >= destination.index && source.index > destination.index) {
          newStatus[keyIndex + 1] = status
        } else {
          newStatus[keyIndex] = status
        }
      })
      return newStatus
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <DnDContext onDragEnd={onDragEnd}>
        <DnDDroppable droppableId="social-media">
          {(provided) => (
            <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
              {data.map((socialMedia, index) => (
                <DnDDraggable key={`SOCIAL-${index}`} draggableId={`SOCIAL-${index}`} index={index}>
                  {(dragProvided, snapshot) => (
                    <AccordionCard
                      isDragging={snapshot.isDragging}
                      isExpanded={isExpanded(index)}
                      theme="pink"
                      innerRef={dragProvided.innerRef}
                      draggableProps={dragProvided.draggableProps}
                      header={
                        <AccordionHeader
                          title={socialMedia.socialMedia}
                          subtitle={socialMedia.link}
                          placeholder="New Social Link"
                          isExpanded={isExpanded(index)}
                          onToggle={() => toggleExpanded(index)}
                          onDelete={() => handleRemove(index)}
                          deleteTitle="Delete social media"
                          dragHandleProps={dragProvided.dragHandleProps}
                          titleExtra={<UrlStatusIndicator status={validationStatus[index] || 'empty'} />}
                        />
                      }
                    >
                      <FormInput
                        label="Platform Name"
                        name="socialMedia"
                        placeholder="e.g., LinkedIn, GitHub, Twitter..."
                        value={socialMedia.socialMedia}
                        onChange={(e) => handleChange(e, index)}
                        variant="pink"
                      />

                      <div className="space-y-1">
                        <FormInput
                          label="URL"
                          name="link"
                          type="url"
                          placeholder="e.g., linkedin.com/in/username"
                          value={socialMedia.link}
                          onChange={(e) => handleChange(e, index)}
                          variant="pink"
                        />
                        {validationStatus[index] === 'invalid' && (
                          <p className="text-xs text-amber-400/80">
                            This URL may not be reachable. Double-check the spelling.
                          </p>
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

      <FormButton size={data.length} add={handleAdd} label="Social Media" />
    </div>
  )
}

export default SocialMedia
