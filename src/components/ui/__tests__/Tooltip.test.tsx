import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tooltip, CustomTooltip } from '../Tooltip'
import '@testing-library/jest-dom'

// Mock react-tooltip
jest.mock('react-tooltip', () => ({
  Tooltip: ({ id }: any) => <div data-testid={`mock-tooltip-${id}`} />,
}))

describe('Tooltip Components', () => {
  const originalInnerWidth = window.innerWidth

  beforeEach(() => {
    jest.clearAllMocks()
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })
  })

  afterAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  describe('Tooltip', () => {
    it('renders on desktop', () => {
      render(<Tooltip />)
      expect(screen.getByTestId('mock-tooltip-app-tooltip')).toBeInTheDocument()
    })

    it('does not render on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      render(<Tooltip />)
      expect(
        screen.queryByTestId('mock-tooltip-app-tooltip')
      ).not.toBeInTheDocument()
    })

    it('updates visibility on window resize', () => {
      render(<Tooltip />)
      expect(screen.getByTestId('mock-tooltip-app-tooltip')).toBeInTheDocument()

      // Resize to mobile
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 500 })
        window.dispatchEvent(new Event('resize'))
      })

      expect(
        screen.queryByTestId('mock-tooltip-app-tooltip')
      ).not.toBeInTheDocument()

      // Resize back to desktop
      act(() => {
        Object.defineProperty(window, 'innerWidth', { value: 1024 })
        window.dispatchEvent(new Event('resize'))
      })

      expect(screen.getByTestId('mock-tooltip-app-tooltip')).toBeInTheDocument()
    })
  })

  describe('CustomTooltip', () => {
    it('renders with default props on desktop', () => {
      render(<CustomTooltip />)
      expect(
        screen.getByTestId('mock-tooltip-custom-tooltip')
      ).toBeInTheDocument()
    })

    it('renders with custom id and place', () => {
      render(<CustomTooltip id="my-tip" place="bottom" />)
      expect(screen.getByTestId('mock-tooltip-my-tip')).toBeInTheDocument()
    })

    it('does not render on mobile', () => {
      Object.defineProperty(window, 'innerWidth', { value: 500 })
      render(<CustomTooltip />)
      expect(
        screen.queryByTestId('mock-tooltip-custom-tooltip')
      ).not.toBeInTheDocument()
    })

    it('renders different variants', () => {
      const { rerender } = render(<CustomTooltip variant="info" />)
      expect(
        screen.getByTestId('mock-tooltip-custom-tooltip')
      ).toBeInTheDocument()

      rerender(<CustomTooltip variant="success" />)
      rerender(<CustomTooltip variant="warning" />)
      rerender(<CustomTooltip variant="error" />)
      rerender(<CustomTooltip variant="default" />)

      expect(
        screen.getByTestId('mock-tooltip-custom-tooltip')
      ).toBeInTheDocument()
    })

    it('cleans up event listener on unmount', () => {
      const removeSpy = jest.spyOn(window, 'removeEventListener')
      const { unmount } = render(<CustomTooltip />)
      unmount()
      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    })
  })
})
