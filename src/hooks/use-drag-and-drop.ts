import { useCallback } from 'react'
import type { DropResult } from '@hello-pangea/dnd'

/**
 * Hook for handling drag-and-drop reordering of array items
 * @param items - The array of items to reorder
 * @param onReorder - Callback function to update the reordered items
 * @returns onDragEnd handler for DragDropContext
 */
export function useDragAndDrop<T>(items: T[], onReorder: (reorderedItems: T[]) => void) {
  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, source } = result

      // Dropped outside the list
      if (!destination) return

      // Dropped in the same position
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return
      }

      // Reorder items
      const newItems = [...items]
      const [removed] = newItems.splice(source.index, 1)
      if (removed !== undefined) {
        newItems.splice(destination.index, 0, removed)
        onReorder(newItems)
      }
    },
    [items, onReorder]
  )

  return { onDragEnd }
}
