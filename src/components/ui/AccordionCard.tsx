import React from 'react'
import { GripVertical, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'

type ColorTheme = 'teal' | 'indigo' | 'pink'

const themeClasses: Record<ColorTheme, string> = {
  teal: 'border-teal-400/50 bg-white/10 shadow-xl shadow-teal-500/20 ring-2 ring-teal-400/30',
  indigo:
    'border-indigo-400/50 bg-white/10 shadow-xl shadow-indigo-500/20 ring-2 ring-indigo-400/30',
  pink: 'border-pink-400/50 bg-white/10 shadow-xl shadow-pink-500/20 ring-2 ring-pink-400/30',
}

interface AccordionHeaderProps {
  /** Primary title text */
  title: string
  /** Secondary subtitle text (optional) */
  subtitle?: string
  /** Placeholder when title is empty */
  placeholder?: string
  /** Whether the accordion is expanded */
  isExpanded: boolean
  /** Toggle expand/collapse */
  onToggle: () => void
  /** Delete handler */
  onDelete: () => void
  /** Delete confirmation message */
  deleteConfirmMessage?: string
  /** Delete button title attribute */
  deleteTitle?: string
  /** Drag handle props from @hello-pangea/dnd */
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null
  /** Optional extra content to render after title (e.g., edit button) */
  titleExtra?: React.ReactNode
}

/**
 * Reusable accordion header with drag handle, title, expand/collapse, and delete
 */
export function AccordionHeader({
  title,
  subtitle,
  placeholder = 'New Item',
  isExpanded,
  onToggle,
  onDelete,
  deleteConfirmMessage,
  deleteTitle = 'Delete',
  dragHandleProps,
  titleExtra,
}: AccordionHeaderProps) {
  const handleDeleteClick = () => {
    const displayName = title || placeholder
    const message =
      deleteConfirmMessage ||
      `Are you sure you want to delete "${displayName}"?`
    const confirmed = window.confirm(message)
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
              {title || placeholder}
            </span>
            {subtitle && (
              <span className="block truncate text-xs text-white/50">
                {subtitle}
              </span>
            )}
          </div>
        </button>
        {titleExtra && <div className="mr-1">{titleExtra}</div>}
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
          title={deleteTitle}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

interface AccordionCardProps {
  /** Whether the item is being dragged */
  isDragging: boolean
  /** Whether the accordion is expanded */
  isExpanded: boolean
  /** Color theme for drag state */
  theme?: ColorTheme
  /** Header content */
  header: React.ReactNode
  /** Collapsible body content */
  children: React.ReactNode
  /** Ref for the draggable element */
  innerRef?: React.Ref<HTMLDivElement>
  /** Draggable props from @hello-pangea/dnd */
  draggableProps?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * Reusable accordion card with drag-and-drop support
 */
export function AccordionCard({
  isDragging,
  isExpanded,
  theme = 'teal',
  header,
  children,
  innerRef,
  draggableProps,
}: AccordionCardProps) {
  return (
    <div
      ref={innerRef}
      {...draggableProps}
      className={`rounded-lg border bg-white/5 p-3 transition-[border-color,background-color,box-shadow] duration-200 ${
        isDragging ? themeClasses[theme] : 'border-white/10'
      }`}
    >
      {header}

      {/* Collapsible content - hidden during drag for cleaner preview */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isDragging
            ? 'hidden'
            : isExpanded
              ? 'mt-3 max-h-[2000px] opacity-100'
              : 'max-h-0 overflow-hidden opacity-0'
        }`}
      >
        <div className="space-y-3 border-t border-white/10 pt-3">
          {children}
        </div>
      </div>
    </div>
  )
}
