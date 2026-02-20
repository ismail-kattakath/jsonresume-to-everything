import { renderHook, act } from '@testing-library/react'
import { useAccordion } from '@/hooks/use-accordion'

describe('useAccordion', () => {
  it('initializes with null expandedIndex', () => {
    const { result } = renderHook(() => useAccordion())
    expect(result.current.expandedIndex).toBeNull()
  })

  it('toggles expansion correctly', () => {
    const { result } = renderHook(() => useAccordion())

    act(() => {
      result.current.toggleExpanded(0)
    })
    expect(result.current.isExpanded(0)).toBe(true)
    expect(result.current.expandedIndex).toBe(0)

    act(() => {
      result.current.toggleExpanded(0)
    })
    expect(result.current.isExpanded(0)).toBe(false)
    expect(result.current.expandedIndex).toBeNull()
  })

  it('switches expansion from one index to another', () => {
    const { result } = renderHook(() => useAccordion())

    act(() => {
      result.current.toggleExpanded(0)
    })
    act(() => {
      result.current.toggleExpanded(1)
    })
    expect(result.current.isExpanded(0)).toBe(false)
    expect(result.current.isExpanded(1)).toBe(true)
  })

  it('expands new items', () => {
    const { result } = renderHook(() => useAccordion())
    act(() => {
      result.current.expandNew(5)
    })
    expect(result.current.expandedIndex).toBe(5)
  })

  describe('updateAfterReorder', () => {
    it('handles null expandedIndex', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => {
        result.current.updateAfterReorder(0, 1)
      })
      expect(result.current.expandedIndex).toBeNull()
    })

    it('updates when source is expanded', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => {
        result.current.toggleExpanded(2)
      })
      act(() => {
        result.current.updateAfterReorder(2, 5)
      })
      expect(result.current.expandedIndex).toBe(5)
    })

    it('handles dragging down (source < target)', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => {
        result.current.toggleExpanded(3) // prev = 3
      })
      // source = 1, dest = 5
      // prev > 1 && prev <= 5 -> 3 matches
      act(() => {
        result.current.updateAfterReorder(1, 5)
      })
      expect(result.current.expandedIndex).toBe(2)
    })

    it('ignores dragging down when prev is outside range', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => {
        result.current.toggleExpanded(6) // prev = 6
      })
      act(() => {
        result.current.updateAfterReorder(1, 5)
      })
      expect(result.current.expandedIndex).toBe(6)
    })

    it('handles dragging up (source > target)', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => {
        result.current.toggleExpanded(2) // prev = 2
      })
      // source = 5, dest = 1
      // prev >= 1 && prev < 5 -> 2 matches
      act(() => {
        result.current.updateAfterReorder(5, 1)
      })
      expect(result.current.expandedIndex).toBe(3)
    })

    it('ignores dragging up when prev is outside range', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => {
        result.current.toggleExpanded(0) // prev = 0
      })
      act(() => {
        result.current.updateAfterReorder(5, 1)
      })
      expect(result.current.expandedIndex).toBe(0)
    })
  })
})
