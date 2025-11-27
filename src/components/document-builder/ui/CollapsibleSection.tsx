'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd'

type SectionVariant = 'default' | 'utility'

interface CollapsibleSectionProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  action?: React.ReactNode
  // Visual variant - 'utility' adds subtle amber tint for config/tool sections
  variant?: SectionVariant
  // Editable mode props
  editable?: boolean
  onRename?: (newTitle: string) => void
  onDelete?: () => void
  dragHandleProps?: DraggableProvidedDragHandleProps | null
  // Controlled state props for accordion behavior
  isExpanded?: boolean
  onToggle?: () => void
}

const CollapsibleSection = ({
  title,
  icon,
  children,
  defaultExpanded = false,
  action,
  variant = 'default',
  editable = false,
  onRename,
  onDelete,
  dragHandleProps,
  isExpanded: controlledIsExpanded,
  onToggle,
}: CollapsibleSectionProps) => {
  const [internalIsExpanded, setInternalIsExpanded] = useState(defaultExpanded)

  // Use controlled state if provided, otherwise use internal state
  const isExpanded = controlledIsExpanded ?? internalIsExpanded
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalIsExpanded(!internalIsExpanded)
    }
  }
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleRename = () => {
    if (editedTitle.trim() && editedTitle !== title && onRename) {
      onRename(editedTitle.trim())
    } else {
      setEditedTitle(title) // Reset if unchanged or empty
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
    if (onDelete) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${title}"? This will remove all skills in this group.`
      )
      if (confirmed) {
        onDelete()
      }
    }
  }

  const variantClasses =
    variant === 'utility'
      ? 'border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-transparent hover:border-amber-500/30'
      : 'border-white/10 bg-white/5 hover:border-white/20'

  return (
    <div
      className={`overflow-hidden rounded-2xl border backdrop-blur-sm transition-all ${variantClasses}`}
    >
      {/* Header - Clickable */}
      <button
        type="button"
        onClick={() => !isEditing && handleToggle()}
        className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-white/5"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Drag Handle - Only for editable sections */}
          {editable && dragHandleProps && (
            <div
              {...dragHandleProps}
              className="flex-shrink-0 cursor-grab text-white/40 hover:text-white/60 active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          {icon && (
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              {icon}
            </div>
          )}

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="h-6 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>

            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 rounded-lg border border-blue-400 bg-white/10 px-3 py-1 text-lg font-semibold text-white outline-none focus:ring-2 focus:ring-blue-400/20"
              />
            ) : (
              <h2 className="truncate text-lg font-semibold text-white">
                {title}
              </h2>
            )}
          </div>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2 text-white/60">
          {/* Editable controls - Only show when editable */}
          {editable && !isEditing && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}
                className="rounded-lg p-2 transition-all hover:bg-white/10 hover:text-blue-400"
                title="Rename skill group"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteClick()
                }}
                className="rounded-lg p-2 transition-all hover:bg-white/10 hover:text-red-400"
                title="Delete skill group"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}

          {action && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2"
            >
              {action}
            </div>
          )}

          {!isEditing && (
            <div className="rounded-lg p-1 transition-all hover:bg-white/10 hover:text-white">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 transition-transform hover:scale-110" />
              ) : (
                <ChevronDown className="h-5 w-5 transition-transform hover:scale-110" />
              )}
            </div>
          )}
        </div>
      </button>

      {/* Content - Collapsible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded
            ? 'max-h-[10000px] opacity-100'
            : 'max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <div className="border-t border-white/10 p-6 pt-4">{children}</div>
      </div>
    </div>
  )
}

export default CollapsibleSection
