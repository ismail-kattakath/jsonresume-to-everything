import { renderHook, act } from '@testing-library/react'
import { usePreviewScaling } from '../usePreviewScaling'

describe('usePreviewScaling', () => {
  const PREVIEW_BASE_WIDTH = 816

  beforeEach(() => {
    // Reset window size before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterEach(() => {
    // Clean up event listeners
    window.removeEventListener('resize', () => {})
  })

  it('should return scale of 1 and isScaling false on desktop (≥768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => usePreviewScaling())

    expect(result.current.scale).toBe(1)
    expect(result.current.isScaling).toBe(false)
  })

  it('should calculate correct scale factor on mobile (iPhone SE - 320px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 320,
    })

    const { result } = renderHook(() => usePreviewScaling())

    // Available width = 320 - 32 (padding) = 288
    // Scale = 288 / 816 ≈ 0.353
    expect(result.current.scale).toBeCloseTo(0.353, 2)
    expect(result.current.isScaling).toBe(true)
  })

  it('should calculate correct scale factor on mobile (iPhone - 375px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    })

    const { result } = renderHook(() => usePreviewScaling())

    // Available width = 375 - 32 = 343
    // Scale = 343 / 816 ≈ 0.420
    expect(result.current.scale).toBeCloseTo(0.42, 2)
    expect(result.current.isScaling).toBe(true)
  })

  it('should calculate correct scale factor on mobile (iPhone Plus - 414px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 414,
    })

    const { result } = renderHook(() => usePreviewScaling())

    // Available width = 414 - 32 = 382
    // Scale = 382 / 816 ≈ 0.468
    expect(result.current.scale).toBeCloseTo(0.468, 2)
    expect(result.current.isScaling).toBe(true)
  })

  it('should recalculate scale on window resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => usePreviewScaling())

    expect(result.current.scale).toBe(1)
    expect(result.current.isScaling).toBe(false)

    // Simulate resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.scale).toBeCloseTo(0.42, 2)
    expect(result.current.isScaling).toBe(true)
  })

  it('should never scale beyond 1 (no upscaling)', () => {
    // Test with very large screen
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 2560,
    })

    const { result } = renderHook(() => usePreviewScaling())

    expect(result.current.scale).toBe(1)
    expect(result.current.isScaling).toBe(false)
  })

  it('should handle edge case at md breakpoint (767px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => usePreviewScaling())

    // Should still scale since < 768
    const expectedScale = (767 - 32) / PREVIEW_BASE_WIDTH
    expect(result.current.scale).toBeCloseTo(expectedScale, 2)
    expect(result.current.isScaling).toBe(true)
  })

  it('should handle edge case at md breakpoint (768px)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => usePreviewScaling())

    // Should NOT scale since >= 768
    expect(result.current.scale).toBe(1)
    expect(result.current.isScaling).toBe(false)
  })
})
