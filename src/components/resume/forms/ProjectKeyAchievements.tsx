import React, { useState } from 'react'
import { useProjectKeyAchievementsForm } from '@/hooks/useProjectKeyAchievementsForm'

interface ProjectKeyAchievementsProps {
  projectIndex: number
  variant?: 'teal' | 'pink'
}

/**
 * ProjectKeyAchievements form component - displays project achievements as a vertical list
 * with inline add and click-to-edit functionality
 */
const ProjectKeyAchievements = ({
  projectIndex,
  variant = 'teal',
}: ProjectKeyAchievementsProps) => {
  const { achievements, add, remove, handleChange } =
    useProjectKeyAchievementsForm(projectIndex)
  const [inputValue, setInputValue] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

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
    const currentAchievement = achievements[index]
    if (
      editValue.trim() &&
      currentAchievement &&
      editValue !== currentAchievement.text
    ) {
      handleChange(index, editValue)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const borderColor =
    variant === 'teal' ? 'border-teal-400/30' : 'border-pink-400/30'
  const focusBorderColor =
    variant === 'teal' ? 'focus:border-teal-400' : 'focus:border-pink-400'

  return (
    <div className="space-y-2">
      {/* Existing achievements */}
      {(achievements || []).map((achievement, index) => (
        <div
          key={`PROJECT-ACHIEVEMENT-${projectIndex}-${index}`}
          className={`group flex items-start gap-3 rounded-lg border ${borderColor} bg-white/5 p-3 transition-all hover:bg-white/10`}
        >
          {/* Number bullet */}
          <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-white/60">
            {index + 1}
          </span>

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
      ))}

      {/* Add new achievement input */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddKeyDown}
        placeholder="Add key achievement... (Press Enter to save)"
        className={`w-full rounded-lg border border-dashed ${borderColor} bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 ${focusBorderColor}`}
      />
    </div>
  )
}

export default ProjectKeyAchievements
