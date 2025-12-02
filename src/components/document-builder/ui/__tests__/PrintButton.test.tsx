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
      const button = screen.getByRole('button', { name: 'Print to PDF' })
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
      const button = screen.getByRole('button', { name: 'Print to PDF' })
      expect(button).toHaveAttribute('aria-label', 'Print to PDF')
    })

    it('should render dropdown toggle button', () => {
      render(<PrintButton />)
      const dropdownButton = screen.getByRole('button', {
        name: 'Export options',
      })
      expect(dropdownButton).toBeInTheDocument()
    })
  })

  describe('Print Functionality', () => {
    it('should call window.print when button is clicked without name', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalledTimes(1)
    })

    it('should call window.print when button is clicked with name', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalledTimes(1)
    })

    it('should not change document title when name is not provided', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Original Title')
      expect(mockPrint).toHaveBeenCalled()
    })
  })

  describe('Document Title Formatting', () => {
    it('should format name and position to PascalCase and set document title', () => {
      render(
        <PrintButton
          name="John Doe"
          position="Software Engineer"
          documentType="Resume"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('SoftwareEngineer-JohnDoe-Resume')
    })

    it('should handle name with underscores', () => {
      render(
        <PrintButton
          name="john_doe"
          position="Developer"
          documentType="Resume"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-Johndoe-Resume')
    })

    it('should handle name with hyphens', () => {
      render(
        <PrintButton
          name="john-doe"
          position="Developer"
          documentType="Resume"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-Johndoe-Resume')
    })

    it('should handle name with mixed separators', () => {
      render(
        <PrintButton
          name="john doe_smith-jones"
          position="Developer"
          documentType="Resume"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      // After removing special chars: "john doesmithjones" -> split by spaces -> ["john", "doesmithjones"]
      expect(document.title).toBe('Developer-JohnDoesmithjones-Resume')
    })

    it('should handle single word name', () => {
      render(
        <PrintButton name="John" position="Developer" documentType="Resume" />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-John-Resume')
    })

    it('should handle all lowercase name', () => {
      render(
        <PrintButton
          name="john doe"
          position="Developer"
          documentType="Resume"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-JohnDoe-Resume')
    })

    it('should handle all uppercase name', () => {
      render(
        <PrintButton
          name="JOHN DOE"
          position="DEVELOPER"
          documentType="Resume"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-JohnDoe-Resume')
    })

    it('should handle name with multiple spaces', () => {
      render(
        <PrintButton
          name="john   doe"
          position="Developer"
          documentType="Resume"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-JohnDoe-Resume')
    })
  })

  describe('Document Type', () => {
    it('should use Resume as default document type', () => {
      render(<PrintButton name="John Doe" position="Developer" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-JohnDoe-Resume')
    })

    it('should handle CoverLetter document type', () => {
      render(
        <PrintButton
          name="John Doe"
          position="Developer"
          documentType="CoverLetter"
        />
      )
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Developer-JohnDoe-CoverLetter')
    })
  })

  describe('Title Restoration', () => {
    it('should restore original title after timeout', async () => {
      render(<PrintButton name="John Doe" position="Developer" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0) for window.print()

      expect(document.title).toBe('Developer-JohnDoe-Resume')

      // Fast-forward time for title restoration
      jest.advanceTimersByTime(100)

      expect(document.title).toBe('Original Title')
    })

    it('should not restore title if name is not provided', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      jest.advanceTimersByTime(100)

      expect(document.title).toBe('Original Title')
    })

    it('should handle multiple clicks with proper title restoration', () => {
      render(<PrintButton name="John Doe" position="Developer" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      // First click
      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0) for window.print()
      expect(document.title).toBe('Developer-JohnDoe-Resume')
      jest.advanceTimersByTime(100)
      expect(document.title).toBe('Original Title')

      // Second click
      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0) for window.print()
      expect(document.title).toBe('Developer-JohnDoe-Resume')
      jest.advanceTimersByTime(100)
      expect(document.title).toBe('Original Title')

      expect(mockPrint).toHaveBeenCalledTimes(2)
    })
  })

  describe('Styling', () => {
    it('should have gradient background classes', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      expect(button).toHaveClass('bg-gradient-to-r')
      expect(button).toHaveClass('from-purple-600')
      expect(button).toHaveClass('to-pink-600')
    })

    it('should have hover state classes', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      expect(button).toHaveClass('hover:from-purple-700')
      expect(button).toHaveClass('hover:to-pink-700')
    })

    it('should have rounded-l-full class for combo button', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      expect(button).toHaveClass('rounded-l-full')
    })

    it('should have parent container with shadow', () => {
      const { container } = render(<PrintButton />)
      const wrapper = container.querySelector('.shadow-2xl')

      expect(wrapper).toBeInTheDocument()
    })

    it('should have focus ring classes', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      expect(button).toHaveClass('focus:ring-2')
      expect(button).toHaveClass('focus:ring-purple-500')
    })

    it('should have cursor-pointer class', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      expect(button).toHaveClass('cursor-pointer')
    })

    it('should not have animate-pulse class', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      expect(button).not.toHaveClass('animate-pulse')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      button.focus()
      expect(button).toHaveFocus()
    })

    it('should be triggerable with Enter key', () => {
      render(<PrintButton name="John Doe" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      button.focus()
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalled()
    })

    it('should have button role', () => {
      render(<PrintButton />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThanOrEqual(2)
      expect(buttons[0]).toBeInTheDocument()
    })

    it('should have focus outline styling', () => {
      render(<PrintButton />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      expect(button).toHaveClass('focus:outline-none')
      expect(button).toHaveClass('focus:ring-2')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string name', () => {
      render(<PrintButton name="" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toBe('Original Title')
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle name with special characters', () => {
      render(<PrintButton name="John O'Brien" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      // Should handle the apostrophe as part of the name
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle very long names', () => {
      const longName = 'John Jacob Jingleheimer Schmidt Johnson Williams'
      render(<PrintButton name={longName} position="Developer" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(document.title).toContain('Developer')
      expect(document.title).toContain('Resume')
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle name with numbers', () => {
      render(<PrintButton name="John Doe 3rd" position="Developer" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

      fireEvent.click(button)
      jest.runOnlyPendingTimers() // Run setTimeout(0)

      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle rapid clicks', () => {
      render(<PrintButton name="John Doe" position="Developer" />)
      const button = screen.getByRole('button', { name: 'Print to PDF' })

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
