import { render, screen } from '@testing-library/react'
import ScaledPreviewWrapper from '../ScaledPreviewWrapper'
import * as usePreviewScalingModule from '@/hooks/usePreviewScaling'

// Mock the usePreviewScaling hook
jest.mock('@/hooks/usePreviewScaling')

describe('ScaledPreviewWrapper', () => {
  const mockUsePreviewScaling =
    usePreviewScalingModule.usePreviewScaling as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render children without scaling on desktop', () => {
    mockUsePreviewScaling.mockReturnValue({
      scale: 1,
      isScaling: false,
    })

    const { container } = render(
      <ScaledPreviewWrapper>
        <div data-testid="preview-content">Preview Content</div>
      </ScaledPreviewWrapper>
    )

    const content = screen.getByTestId('preview-content')
    expect(content).toBeInTheDocument()

    // Should render children directly without wrapper divs
    expect(container.firstChild).toBe(content)
  })

  it('should render children with scaling wrapper on mobile', () => {
    mockUsePreviewScaling.mockReturnValue({
      scale: 0.42,
      isScaling: true,
    })

    const { container } = render(
      <ScaledPreviewWrapper>
        <div data-testid="preview-content">Preview Content</div>
      </ScaledPreviewWrapper>
    )

    const content = screen.getByTestId('preview-content')
    expect(content).toBeInTheDocument()

    // Should have wrapper divs
    const outerWrapper = container.firstChild as HTMLElement
    expect(outerWrapper).toHaveClass(
      'flex',
      'w-full',
      'justify-center',
      'overflow-x-hidden',
      'p-4'
    )
  })

  it('should apply correct transform scale on mobile', () => {
    const testScale = 0.353
    mockUsePreviewScaling.mockReturnValue({
      scale: testScale,
      isScaling: true,
    })

    const { container } = render(
      <ScaledPreviewWrapper>
        <div data-testid="preview-content">Preview Content</div>
      </ScaledPreviewWrapper>
    )

    // Get the inner wrapper (second div) that has the transform
    const outerWrapper = container.firstChild as HTMLElement
    const innerWrapper = outerWrapper.firstChild as HTMLElement
    expect(innerWrapper).not.toBeNull()

    // Check that style attribute contains the expected values
    const styleAttr = innerWrapper.getAttribute('style') || ''
    expect(styleAttr).toContain(`transform: scale(${testScale})`)
    expect(styleAttr).toContain('transform-origin: top center')
    expect(styleAttr).toContain('width: 816px')
  })

  it('should calculate correct minHeight based on scale factor', () => {
    const testScale = 0.468
    const expectedMinHeight = 1056 * testScale // ~494px

    mockUsePreviewScaling.mockReturnValue({
      scale: testScale,
      isScaling: true,
    })

    const { container } = render(
      <ScaledPreviewWrapper>
        <div data-testid="preview-content">Preview Content</div>
      </ScaledPreviewWrapper>
    )

    const outerWrapper = container.firstChild as HTMLElement
    expect(outerWrapper.style.minHeight).toBe(`${expectedMinHeight}px`)
  })

  it('should handle scale of 1 when isScaling is true (edge case)', () => {
    // This shouldn't happen in practice, but test defensive behavior
    mockUsePreviewScaling.mockReturnValue({
      scale: 1,
      isScaling: true,
    })

    const { container } = render(
      <ScaledPreviewWrapper>
        <div data-testid="preview-content">Preview Content</div>
      </ScaledPreviewWrapper>
    )

    // Get the inner wrapper (second div) that has the transform
    const outerWrapper = container.firstChild as HTMLElement
    const innerWrapper = outerWrapper.firstChild as HTMLElement
    expect(innerWrapper).not.toBeNull()

    const styleAttr = innerWrapper.getAttribute('style') || ''
    expect(styleAttr).toContain('transform: scale(1)')
    expect(styleAttr).toContain('width: 816px')
  })

  it('should render multiple children correctly', () => {
    mockUsePreviewScaling.mockReturnValue({
      scale: 0.42,
      isScaling: true,
    })

    render(
      <ScaledPreviewWrapper>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ScaledPreviewWrapper>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })
})
