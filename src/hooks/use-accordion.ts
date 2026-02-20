import { useState, useCallback } from 'react'

/**
 * Hook for managing accordion state with single-item expansion
 * When one item expands, others collapse automatically
 */
export function useAccordion(_initialLength: number = 0) {
  // Track which item is expanded (collapsed by default)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index))
  }, [])

  const isExpanded = useCallback((index: number) => expandedIndex === index, [expandedIndex])

  // Expand newly added item
  const expandNew = useCallback((newIndex: number) => {
    setExpandedIndex(newIndex)
  }, [])

  // Update expanded index after drag reorder
  const updateAfterReorder = useCallback((sourceIndex: number, destinationIndex: number) => {
    setExpandedIndex((prev) => {
      if (prev === null) return null
      if (prev === sourceIndex) return destinationIndex
      if (sourceIndex < destinationIndex) {
        // Dragging down
        if (prev > sourceIndex && prev <= destinationIndex) {
          return prev - 1
        }
      } else {
        // Dragging up
        if (prev >= destinationIndex && prev < sourceIndex) {
          return prev + 1
        }
      }
      return prev
    })
  }, [])

  return {
    expandedIndex,
    toggleExpanded,
    isExpanded,
    expandNew,
    updateAfterReorder,
  }
}
