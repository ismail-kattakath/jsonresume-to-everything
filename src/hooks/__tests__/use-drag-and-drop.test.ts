import { renderHook } from '@testing-library/react'
import { useDragAndDrop } from '@/hooks/use-drag-and-drop'
import type { DropResult } from '@hello-pangea/dnd'

describe('useDragAndDrop', () => {
  const mockOnReorder = jest.fn()
  const items = ['Item 1', 'Item 2', 'Item 3']

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('reorders items correctly when dropped in a new position', () => {
    const { result } = renderHook(() => useDragAndDrop(items, mockOnReorder))

    const dropResult: any = {
      destination: { droppableId: 'list', index: 2 },
      source: { droppableId: 'list', index: 0 },
      reason: 'DROP',
    }

    result.current.onDragEnd(dropResult as DropResult)

    // Original: ['Item 1', 'Item 2', 'Item 3']
    // Moved index 0 to index 2: ['Item 2', 'Item 3', 'Item 1']
    expect(mockOnReorder).toHaveBeenCalledWith(['Item 2', 'Item 3', 'Item 1'])
  })

  it('does nothing when dropped outside a destination', () => {
    const { result } = renderHook(() => useDragAndDrop(items, mockOnReorder))

    const dropResult: any = {
      destination: null,
      source: { droppableId: 'list', index: 0 },
      reason: 'DROP',
    }

    result.current.onDragEnd(dropResult as DropResult)

    expect(mockOnReorder).not.toHaveBeenCalled()
  })

  it('does nothing when dropped in the same position', () => {
    const { result } = renderHook(() => useDragAndDrop(items, mockOnReorder))

    const dropResult: any = {
      destination: { droppableId: 'list', index: 0 },
      source: { droppableId: 'list', index: 0 },
      reason: 'DROP',
    }

    result.current.onDragEnd(dropResult as DropResult)

    expect(mockOnReorder).not.toHaveBeenCalled()
  })

  it('handles undefined removed items safely', () => {
    // This case is unlikely given how splice works on arrays with items,
    // but we test the branch regardless
    const { result } = renderHook(() => useDragAndDrop([], mockOnReorder))

    const dropResult: any = {
      destination: { droppableId: 'list', index: 0 },
      source: { droppableId: 'list', index: 0 }, // wait, source.index 0 on empty array might return undefined
      reason: 'DROP',
    }

    // We need source.index != destination.index to reach the splice logic
    const dropResultDiff: any = {
      destination: { droppableId: 'list', index: 1 },
      source: { droppableId: 'list', index: 0 },
      reason: 'DROP',
    }

    result.current.onDragEnd(dropResultDiff as DropResult)
    // newItems is []
    // [removed] = [].splice(0, 1) -> removed is undefined
    expect(mockOnReorder).not.toHaveBeenCalled()
  })
})
