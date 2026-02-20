// @ts-nocheck
import { render, act } from '@testing-library/react'
import { Tooltip, CustomTooltip } from '@/components/ui/Tooltip'

// Override the global react-tooltip mock from jest.setup.js for this file
// since we need to test our wrapper component behavior
jest.mock('react-tooltip', () => ({
  Tooltip: (props: any) => <div data-testid="react-tooltip" {...props} />,
}))

describe('Tooltip', () => {
  let addEventListenerSpy: jest.SpyInstance
  let removeEventListenerSpy: jest.SpyInstance

  beforeEach(() => {
    addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })

  it('renders tooltip on desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    })

    const { container } = render(<Tooltip />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).toBeInTheDocument()
  })

  it('returns null on mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true,
      configurable: true,
    })

    const { container } = render(<Tooltip />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).not.toBeInTheDocument()
  })

  it('listens for resize events', () => {
    render(<Tooltip />)
    expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('cleans up resize listener on unmount', () => {
    const { unmount } = render(<Tooltip />)
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('updates mobile state on resize', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    })

    const { container, rerender } = render(<Tooltip />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).toBeInTheDocument()

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true,
      configurable: true,
    })

    act(() => {
      window.dispatchEvent(new Event('resize'))
    })

    rerender(<Tooltip />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).not.toBeInTheDocument()
  })
})

describe('CustomTooltip', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    })
  })

  it('renders with default props', () => {
    const { container } = render(<CustomTooltip />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).toBeInTheDocument()
  })

  it('renders with custom id', () => {
    const { container } = render(<CustomTooltip id="my-tooltip" />)
    const tooltip = container.querySelector('[data-testid="react-tooltip"]')
    expect(tooltip).toHaveAttribute('id', 'my-tooltip')
  })

  it('renders with custom variant (info)', () => {
    const { container } = render(<CustomTooltip variant="info" />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).toBeInTheDocument()
  })

  it('renders with custom variant (success)', () => {
    const { container } = render(<CustomTooltip variant="success" />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).toBeInTheDocument()
  })

  it('renders with custom variant (warning)', () => {
    const { container } = render(<CustomTooltip variant="warning" />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).toBeInTheDocument()
  })

  it('renders with custom variant (error)', () => {
    const { container } = render(<CustomTooltip variant="error" />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).toBeInTheDocument()
  })

  it('renders with custom placement', () => {
    const { container } = render(<CustomTooltip place="bottom" />)
    const tooltip = container.querySelector('[data-testid="react-tooltip"]')
    expect(tooltip).toHaveAttribute('place', 'bottom')
  })

  it('returns null on mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true,
      configurable: true,
    })

    const { container } = render(<CustomTooltip />)
    expect(container.querySelector('[data-testid="react-tooltip"]')).not.toBeInTheDocument()
  })

  it('cleans up resize listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    const { unmount } = render(<CustomTooltip />)
    unmount()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })
})
