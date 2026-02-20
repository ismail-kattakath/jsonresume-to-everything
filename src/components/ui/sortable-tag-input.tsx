import React, { useState } from 'react'
import { DnDContext, DnDDroppable, DnDDraggable } from '@/components/ui/drag-and-drop'
import type { DropResult } from '@hello-pangea/dnd'

interface SortableTagInputProps {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (index: number) => void
  onReorder: (startIndex: number, endIndex: number) => void
  placeholder?: string
  variant?: 'purple' | 'pink' | 'teal' | 'blue'
}

/**
 * Reusable SortableTagInput component for managing and reordering arrays of strings
 * Used for skills, technologies, etc. with drag-and-drop support
 */
const SortableTagInput: React.FC<SortableTagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  onReorder,
  placeholder = 'Add item...',
  variant = 'purple',
}) => {
  const [inputValue, setInputValue] = useState('')

  const variantStyles = {
    purple: 'border-purple-400/30 focus:border-purple-400 hover:border-purple-400/50',
    pink: 'border-pink-400/30 focus:border-pink-400 hover:border-pink-400/50',
    teal: 'border-teal-400/30 focus:border-teal-400 hover:border-teal-400/50',
    blue: 'border-blue-400/30 focus:border-blue-400 hover:border-blue-400/50',
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        onAdd(inputValue.trim())
        setInputValue('')
      }
    }
  }

  const handleBlur = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue('')
    }
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return
    if (result.destination.index === result.source.index) return

    onReorder(result.source.index, result.destination.index)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <DnDContext onDragEnd={onDragEnd}>
        <DnDDroppable droppableId="sortable-tags" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-2">
              {tags?.map((tag, index) => (
                <DnDDraggable key={`TAG-${index}`} draggableId={`TAG-${index}`} index={index}>
                  {(dragProvided, snapshot) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm text-white ${
                        snapshot.isDragging ? 'border-white/40 bg-white/20 shadow-lg' : 'border-white/20 bg-white/5'
                      } cursor-grab transition-all active:cursor-grabbing`}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="ml-1 cursor-pointer text-white/60 transition-all hover:text-red-400"
                        title="Remove"
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
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`rounded-full border border-dashed bg-transparent px-3 py-1 text-sm text-white outline-none placeholder:text-white/40 ${variantStyles[variant]}`}
      />
    </div>
  )
}

export default SortableTagInput
