// @ts-nocheck
import { renderHook, act } from '@testing-library/react'
import { useAccordion } from '@/hooks/useAccordion'

describe('useAccordion', () => {
  it('initializes with no item expanded (null)', () => {
    const { result } = renderHook(() => useAccordion(5))
    expect(result.current.expandedIndex).toBeNull()
  })

  it('uses default initialLength of 0 when not provided', () => {
    const { result } = renderHook(() => useAccordion())
    expect(result.current.expandedIndex).toBeNull()
  })

  describe('toggleExpanded', () => {
    it('expands an item when none is expanded', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.toggleExpanded(2))
      expect(result.current.expandedIndex).toBe(2)
    })

    it('collapses the currently expanded item when toggled again', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.toggleExpanded(2))
      act(() => result.current.toggleExpanded(2))
      expect(result.current.expandedIndex).toBeNull()
    })

    it('switches to the new item when a different item is toggled', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.toggleExpanded(1))
      act(() => result.current.toggleExpanded(3))
      expect(result.current.expandedIndex).toBe(3)
    })
  })

  describe('isExpanded', () => {
    it('returns true for the currently expanded index', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.toggleExpanded(1))
      expect(result.current.isExpanded(1)).toBe(true)
    })

    it('returns false for a non-expanded index', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.toggleExpanded(1))
      expect(result.current.isExpanded(2)).toBe(false)
    })

    it('returns false when nothing is expanded', () => {
      const { result } = renderHook(() => useAccordion())
      expect(result.current.isExpanded(0)).toBe(false)
    })
  })

  describe('expandNew', () => {
    it('sets expandedIndex to the given new index', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.expandNew(4))
      expect(result.current.expandedIndex).toBe(4)
    })
  })

  describe('updateAfterReorder', () => {
    it('returns null when nothing is expanded', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.updateAfterReorder(0, 2))
      expect(result.current.expandedIndex).toBeNull()
    })

    it('moves expanded item when its index is the source', () => {
      const { result } = renderHook(() => useAccordion())
      act(() => result.current.toggleExpanded(1))
      act(() => result.current.updateAfterReorder(1, 3))
      expect(result.current.expandedIndex).toBe(3)
    })

    it('shifts expanded item down (-1) when dragging from before it to its position (drag down)', () => {
      const { result } = renderHook(() => useAccordion())
      // Expand item 3. Then drag item 1 to position 4 — items 2,3,4 shift down by 1
      act(() => result.current.toggleExpanded(3))
      act(() => result.current.updateAfterReorder(1, 4))
      expect(result.current.expandedIndex).toBe(2)
    })

    it('shifts expanded item up (+1) when dragging from after it to before it (drag up)', () => {
      const { result } = renderHook(() => useAccordion())
      // Expand item 2. Drag item 4 to position 1 — items 1,2,3 shift up by 1
      act(() => result.current.toggleExpanded(2))
      act(() => result.current.updateAfterReorder(4, 1))
      expect(result.current.expandedIndex).toBe(3)
    })

    it('keeps expanded index unchanged when reorder does not affect it', () => {
      const { result } = renderHook(() => useAccordion())
      // Expand item 0. Drag item 3 to position 5 — item 0 not affected
      act(() => result.current.toggleExpanded(0))
      act(() => result.current.updateAfterReorder(3, 5))
      expect(result.current.expandedIndex).toBe(0)
    })

    it('keeps expanded index unchanged when drag is from lower to higher but item is outside range', () => {
      const { result } = renderHook(() => useAccordion())
      // Expand item 5. Drag item 1 to 3 — items 2,3 shift: expanded is 5 (outside range)
      act(() => result.current.toggleExpanded(5))
      act(() => result.current.updateAfterReorder(1, 3))
      expect(result.current.expandedIndex).toBe(5)
    })
  })
})
