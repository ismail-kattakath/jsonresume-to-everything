import React from 'react'
import dynamic from 'next/dynamic'
import type { DragDropContextProps, DroppableProps, DraggableProps } from '@hello-pangea/dnd'

// Dynamic imports for drag-and-drop (SSR disabled)
const DragDropContext = dynamic(() => import('@hello-pangea/dnd').then((mod) => mod.DragDropContext), { ssr: false })
const Droppable = dynamic(() => import('@hello-pangea/dnd').then((mod) => mod.Droppable), { ssr: false })
const Draggable = dynamic(() => import('@hello-pangea/dnd').then((mod) => mod.Draggable), { ssr: false })

/**
 * Wrapper for DragDropContext with SSR disabled
 */
export const DnDContext: React.FC<DragDropContextProps> = ({ children, ...props }) => {
  return <DragDropContext {...props}>{children}</DragDropContext>
}

/**
 * Wrapper for Droppable with SSR disabled
 */
export const DnDDroppable: React.FC<DroppableProps> = ({ children, ...props }) => {
  return <Droppable {...props}>{children}</Droppable>
}

/**
 * Wrapper for Draggable with SSR disabled
 */
export const DnDDraggable: React.FC<DraggableProps> = ({ children, ...props }) => {
  return <Draggable {...props}>{children}</Draggable>
}

/**
 * Props for DraggableCard component
 */
interface DraggableCardProps {
  /** Unique ID for the draggable item */
  draggableId: string
  /** Index of the item in the list */
  index: number
  /** Tailwind color for the outline when dragging (e.g., 'indigo', 'teal', 'purple') */
  outlineColor?: 'indigo' | 'teal' | 'purple' | 'emerald' | 'violet' | 'pink' | 'fuchsia'
  /** Content to render inside the card */
  children: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Reusable draggable card component with consistent styling
 */
export const DraggableCard: React.FC<DraggableCardProps> = ({
  draggableId,
  index,
  outlineColor = 'purple',
  children,
  className = '',
}) => {
  const outlineColorClass = `outline-${outlineColor}-400`

  return (
    <DnDDraggable draggableId={draggableId} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group flex cursor-grab flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 active:cursor-grabbing ${
            snapshot.isDragging ? `bg-white/20 outline-2 ${outlineColorClass} outline-dashed` : ''
          } ${className}`}
        >
          {children}
        </div>
      )}
    </DnDDraggable>
  )
}
