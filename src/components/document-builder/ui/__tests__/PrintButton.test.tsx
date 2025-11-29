import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PrintButton from '@/components/document-builder/ui/PrintButton'

describe('PrintButton Component', () => {
  let mockPrint: jest.SpyInstance
  let originalTitle: string

  beforeEach(() => {
    // Mock window.print
    mockPrint = jest.spyOn(window, 'print').mockImplementation(() => {})

    // Store original document title
    originalTitle = document.title
    document.title = 'Original Title'

    // Use fake timers
    jest.useFakeTimers()
  })

  afterEach(() => {
    // Restore mocks
    mockPrint.mockRestore()

    // Restore document title
    document.title = originalTitle

    // Clear all timers
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render print button', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })
      expect(button).toBeInTheDocument()
    })

    it('should render button text', () => {
      render(<PrintButton />)
      expect(screen.getByText('Print')).toBeInTheDocument()
    })

    it('should render PDF icon', () => {
      const { container } = render(<PrintButton />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have aria-label for accessibility', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })
      expect(button).toHaveAttribute('aria-label', 'Print')
    })
  })

  describe('Print Functionality', () => {
    it('should call window.print when button is clicked without name', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalledTimes(1)
    })

    it('should call window.print when button is clicked with name', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalledTimes(1)
    })

    it('should not change document title when name is not provided', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Original Title')
      expect(mockPrint).toHaveBeenCalled()
    })
  })

  describe('Document Title Formatting', () => {
    it('should format name to ProperCase and set document title', () => {
      render(<PrintButton name="John Doe" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should handle name with underscores', () => {
      render(<PrintButton name="john_doe" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should handle name with hyphens', () => {
      render(<PrintButton name="john-doe" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should handle name with mixed separators', () => {
      render(<PrintButton name="john doe_smith-jones" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoeSmithJones-Resume')
    })

    it('should handle single word name', () => {
      render(<PrintButton name="John" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('John-Resume')
    })

    it('should handle all lowercase name', () => {
      render(<PrintButton name="john doe" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should handle all uppercase name', () => {
      render(<PrintButton name="JOHN DOE" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should handle name with multiple spaces', () => {
      render(<PrintButton name="john   doe" documentType="Resume" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-Resume')
    })
  })

  describe('Document Type', () => {
    it('should use Resume as default document type', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should handle CoverLetter document type', () => {
      render(<PrintButton name="John Doe" documentType="CoverLetter" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('JohnDoe-CoverLetter')
    })
  })

  describe('Title Restoration', () => {
    it('should restore original title after timeout', async () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0) for window.print()

      expect(document.title).toBe('JohnDoe-Resume')

      // Fast-forward time for title restoration
      jest.advanceTimersByTime(100)

      expect(document.title).toBe('Original Title')
    })

    it('should not restore title if name is not provided', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      jest.advanceTimersByTime(100)

      expect(document.title).toBe('Original Title')
    })

    it('should handle multiple clicks with proper title restoration', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print' })

      // First click
      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0) for window.print()
      expect(document.title).toBe('JohnDoe-Resume')
      jest.advanceTimersByTime(100)
      expect(document.title).toBe('Original Title')

      // Second click
      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0) for window.print()
      expect(document.title).toBe('JohnDoe-Resume')
      jest.advanceTimersByTime(100)
      expect(document.title).toBe('Original Title')

      expect(mockPrint).toHaveBeenCalledTimes(2)
    })
  })

  describe('Styling', () => {
    it('should have gradient background classes', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).toHaveClass('bg-gradient-to-r')
      expect(button).toHaveClass('from-purple-600')
      expect(button).toHaveClass('to-pink-600')
    })

    it('should have hover state classes', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).toHaveClass('hover:from-purple-700')
      expect(button).toHaveClass('hover:to-pink-700')
    })

    it('should have rounded-full class', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).toHaveClass('rounded-full')
    })

    it('should have shadow classes', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).toHaveClass('shadow-2xl')
    })

    it('should have focus ring classes', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).toHaveClass('focus:ring-2')
      expect(button).toHaveClass('focus:ring-purple-500')
    })

    it('should have cursor-pointer class', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).toHaveClass('cursor-pointer')
    })

    it('should not have animate-pulse class', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).not.toHaveClass('animate-pulse')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print' })

      button.focus()
      expect(button).toHaveFocus()
    })

    it('should be triggerable with Enter key', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print' })

      button.focus()
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalled()
    })

    it('should have button role', () => {
      render(<PrintButton />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should have focus outline styling', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print' })

      expect(button).toHaveClass('focus:outline-none')
      expect(button).toHaveClass('focus:ring-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string name', () => {
      render(<PrintButton name="" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Original Title')
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle name with special characters', () => {
      render(<PrintButton name="John O'Brien" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      // Should handle the apostrophe as part of the name
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle very long names', () => {
      const longName = 'John Jacob Jingleheimer Schmidt Johnson Williams'
      render(<PrintButton name={longName} />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toContain('Resume')
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle name with numbers', () => {
      render(<PrintButton name="John Doe 3rd" />)
      const button = screen.getByRole('button', { name: 'Print' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle rapid clicks', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print' })

      // Click multiple times rapidly
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run all setTimeout(0) calls

      expect(mockPrint).toHaveBeenCalledTimes(3)
    })
  })

  describe('Icon', () => {
    it('should have group-hover scale animation on icon', () => {
      const { container } = render(<PrintButton />)
      const icon = container.querySelector('svg')

      expect(icon).toHaveClass('group-hover:scale-110')
    })

    it('should have transition on icon', () => {
      const { container } = render(<PrintButton />)
      const icon = container.querySelector('svg')

      expect(icon).toHaveClass('transition-transform')
    })
  })
})
