import React, { useState, useContext } from 'react'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { useKeyAchievementsForm } from '@/hooks/useKeyAchievementsForm'
import {
  DnDContext,
  DnDDroppable,
  DnDDraggable,
} from '@/components/ui/DragAndDrop'
import type { DropResult } from '@hello-pangea/dnd'
import AISortButton from '@/components/ui/AISortButton'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { sortAchievementsGraph, AchievementsSortResult } from '@/lib/ai/strands/agent'
import { AILoadingToast } from '@/components/ui/AILoadingToast'

interface KeyAchievementsProps {
  workExperienceIndex: number
  variant?: 'teal' | 'pink'
}

/**
 * KeyAchievements form component - displays achievements as a vertical list
 * with inline add, click-to-edit, drag-to-reorder, and AI-sort functionality
 */
const KeyAchievements = ({
  workExperienceIndex,
  variant = 'teal',
}: KeyAchievementsProps) => {
  const { achievements, add, remove, handleChange, reorder, setAchievements } =
    useKeyAchievementsForm(workExperienceIndex)
  const [inputValue, setInputValue] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [isSorting, setIsSorting] = useState(false)

  // AI settings and resume context for sorting
  const { settings, isConfigured } = useAISettings()
  const context = useContext(ResumeContext)
  const workExperience = context?.resumeData.workExperience[workExperienceIndex]

  const handleAddKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        add(inputValue)
        setInputValue('')
      }
    }
  }

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (editValue.trim()) {
        handleChange(index, editValue)
      }
      setEditingIndex(null)
      setEditValue('')
    } else if (e.key === 'Escape') {
      setEditingIndex(null)
      setEditValue('')
    }
  }

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index)
    setEditValue(currentText)
  }

  const handleEditBlur = (index: number) => {
    const achievement = achievements[index]
    if (editValue.trim() && achievement && editValue !== achievement.text) {
      handleChange(index, editValue)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const handleAISort = async () => {
    if (
      !isConfigured ||
      isSorting ||
      !workExperience ||
      achievements.length < 2
    )
      return

    setIsSorting(true)
    let toastId: string | number | undefined

    try {
      const achievementTexts = achievements.map((a) => a.text)

      const sortResult = await sortAchievementsGraph(
        achievementTexts,
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
            console.log('[Achievements Sort Graph]', chunk.content)
            // Update toast with progress
            if (!toastId) {
              toastId = toast(<AILoadingToast message={chunk.content} />, { duration: Infinity })
            } else {
              toast(<AILoadingToast message={chunk.content} />, { id: toastId, duration: Infinity })
            }
          }
        }
      )

      if (toastId) toast.dismiss(toastId)

      // Apply the sorted order
      const sortedAchievements = sortResult.rankedIndices
        .map((index) => achievements[index])
        .filter((a): a is typeof achievements[0] => a !== undefined)
      setAchievements(sortedAchievements)
      toast.success('Achievements sorted by job relevance')
    } catch (error: any) {
      if (toastId) toast.dismiss(toastId)
      console.error('AI Achievements sort error:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to sort achievements'
      )
    } finally {
      setIsSorting(false)
    }
  }

  const borderColor =
    variant === 'teal' ? 'border-teal-400/30' : 'border-pink-400/30'
  const focusBorderColor =
    variant === 'teal' ? 'focus:border-teal-400' : 'focus:border-pink-400'

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index) return

    reorder(result.source.index, result.destination.index)
  }

  // Only show AI sort button if there are 2+ achievements
  const showAISort = (achievements || []).length >= 2

  return (
    <div className="space-y-2">
      {/* Existing achievements with drag-and-drop */}
      <DnDContext onDragEnd={onDragEnd}>
        <DnDDroppable droppableId={`achievements-${workExperienceIndex}`}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-2"
            >
              {(achievements || []).map((achievement, index) => (
                <DnDDraggable
                  key={`ACHIEVEMENT-${workExperienceIndex}-${index}`}
                  draggableId={`ACHIEVEMENT-${workExperienceIndex}-${index}`}
                  index={index}
                >
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      className={`group flex items-start gap-3 rounded-lg border ${borderColor} bg-white/5 p-3 transition-all hover:bg-white/10 ${snapshot.isDragging ? 'bg-white/20 shadow-lg' : ''
                        }`}
                    >
                      {/* Drag handle */}
                      <div
                        {...dragProvided.dragHandleProps}
                        className="mt-0.5 flex-shrink-0 cursor-grab text-white/40 hover:text-white/60 active:cursor-grabbing"
                        title="Drag to reorder"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Achievement text or edit input */}
                      {editingIndex === index ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => handleEditKeyDown(e, index)}
                          onBlur={() => handleEditBlur(index)}
                          autoFocus
                          className={`flex-1 rounded border ${borderColor} bg-white/5 px-2 py-1 text-sm text-white outline-none ${focusBorderColor}`}
                        />
                      ) : (
                        <p
                          onClick={() => startEditing(index, achievement.text)}
                          className="flex-1 cursor-pointer text-sm leading-relaxed text-white hover:text-white/80"
                          title="Click to edit"
                        >
                          {achievement.text}
                        </p>
                      )}

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className={`flex-shrink-0 cursor-pointer text-white/40 opacity-0 transition-all group-hover:opacity-100 hover:text-red-400`}
                        title="Remove achievement"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </DnDDraggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </DnDDroppable>
      </DnDContext>

      {/* Add new achievement input and AI Sort button */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleAddKeyDown}
          placeholder="Add key achievement... (Press Enter to save)"
          className={`flex-1 rounded-lg border border-dashed ${borderColor} bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 ${focusBorderColor}`}
        />
        {showAISort && (
          <AISortButton
            isConfigured={isConfigured}
            isLoading={isSorting}
            onClick={handleAISort}
            label="Sort by JD"
            showLabel={true}
            size="sm"
            variant="amber"
          />
        )}
      </div>
    </div>
  )
}

export default KeyAchievements
