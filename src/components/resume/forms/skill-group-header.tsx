'use client'

import React, { useState, useEffect, useRef } from 'react'
import { GripVertical, Pencil, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { tooltips } from '@/config/tooltips'

/**
 * Skill Group Header Component
 * Displays group name with expand/collapse and edit/delete controls
 */
export function SkillGroupHeader({
  title,
  isExpanded,
  onToggle,
  onRename,
  onDelete,
  dragHandleProps,
}: {
  title: string
  isExpanded: boolean
  onToggle: () => void
  onRename: (newTitle: string) => void
  onDelete: () => void
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleRename = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      onRename(editedTitle.trim())
    } else {
      setEditedTitle(title)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRename()
    } else if (e.key === 'Escape') {
      setEditedTitle(title)
      setIsEditing(false)
    }
  }

  const handleDeleteClick = () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This will remove all skills in this group.`
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
            data-tooltip-id="app-tooltip"
            data-tooltip-content={tooltips.skills.dragGroup}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}

        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="rounded border border-pink-400 bg-white/10 px-2 py-1 text-sm font-semibold text-white outline-none focus:ring-2 focus:ring-pink-400/20"
          />
        ) : (
          <button type="button" onClick={onToggle} className="flex min-w-0 items-center gap-1.5 text-left">
            <span className="truncate text-sm font-semibold tracking-wide text-white/80">{title}</span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                setIsEditing(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation()
                  setIsEditing(true)
                }
              }}
              className="rounded p-0.5 text-white/30 transition-all hover:bg-white/10 hover:text-blue-400"
              data-tooltip-id="app-tooltip"
              data-tooltip-content={tooltips.skills.renameGroup}
            >
              <Pencil className="h-3 w-3" />
            </span>
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-white/60"
            data-tooltip-id="app-tooltip"
            data-tooltip-content={isExpanded ? tooltips.actions.collapse : tooltips.actions.expand}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="rounded p-1.5 text-white/40 transition-all hover:bg-white/10 hover:text-red-400"
            data-tooltip-id="app-tooltip"
            data-tooltip-content={tooltips.skills.deleteGroup}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
