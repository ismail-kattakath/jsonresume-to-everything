import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ATSCheckButton from '@/components/document-builder/ui/ATSCheckButton'

describe('ATSCheckButton Component', () => {
  let mockPrint: jest.SpyInstance
  let mockOpen: jest.SpyInstance
  let originalTitle: string

  beforeEach(() => {
    mockPrint = jest.spyOn(window, 'print').mockImplementation(() => {})
    mockOpen = jest.spyOn(window, 'open').mockImplementation(() => null)
    originalTitle = document.title
    document.title = 'Original Title'
    jest.useFakeTimers()
  })

  afterEach(() => {
    mockPrint.mockRestore()
    mockOpen.mockRestore()
    document.title = originalTitle
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render ATS Score button', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })
      expect(button).toBeInTheDocument()
    })

    it('should render button text', () => {
      render(<ATSCheckButton />)
      expect(screen.getByText('ATS Score')).toBeInTheDocument()
    })

    it('should render search icon', () => {
      const { container } = render(<ATSCheckButton />)
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('should have aria-label for accessibility', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })
      expect(button).toHaveAttribute('aria-label', 'Check ATS Score')
    })

    it('should not show modal initially', () => {
      render(<ATSCheckButton />)
      expect(
        screen.queryByText('See how well your resume performs')
      ).not.toBeInTheDocument()
    })
  })

  describe('Modal Interaction', () => {
    it('should open modal when button is clicked', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })

      fireEvent.click(button)

      expect(screen.getByText('Check ATS Score')).toBeInTheDocument()
      expect(
        screen.getByText(/See how well your resume performs/)
      ).toBeInTheDocument()
    })

    it('should show three steps in the modal', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      // Step texts appear in <p> elements with class font-medium
      expect(
        screen.getByText('Download your resume using the button below')
      ).toBeInTheDocument()
      expect(screen.getByText('Upload to ResumeGo')).toBeInTheDocument()
      expect(screen.getByText('Review & improve')).toBeInTheDocument()
    })

    it('should show step descriptions', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      expect(
        screen.getByText('Download your resume using the button below')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Free ATS checker used by 500K+ job seekers')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Get suggestions to optimize your resume')
      ).toBeInTheDocument()
    })

    it('should close modal when close button is clicked', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const closeButton = screen.getByRole('button', { name: 'Close modal' })
      fireEvent.click(closeButton)

      expect(
        screen.queryByText('See how well your resume performs')
      ).not.toBeInTheDocument()
    })

    it('should close modal when clicking backdrop', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      // Find the backdrop (the outer div with onClick)
      const backdrop = screen
        .getByText(/See how well your resume performs/)
        .closest('.fixed')
      if (backdrop) {
        fireEvent.click(backdrop)
      }

      expect(
        screen.queryByText('See how well your resume performs')
      ).not.toBeInTheDocument()
    })

    it('should not close when clicking inside modal content', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      // Click on the modal content (use a unique text)
      const modalContent = screen.getByText('Upload to ResumeGo')
      fireEvent.click(modalContent)

      // Modal should still be open
      expect(
        screen.getByText(/See how well your resume performs/)
      ).toBeInTheDocument()
    })
  })

  describe('Action Buttons', () => {
    it('should render Save as PDF button in modal', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      // There's a step text and a button, get the button
      const pdfButtons = screen.getAllByText('Save as PDF')
      expect(pdfButtons.length).toBeGreaterThan(0)
    })

    it('should render Open ResumeGo button in modal', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      expect(screen.getByText('Open ResumeGo')).toBeInTheDocument()
    })

    it('should call window.print when Save as PDF is clicked', () => {
      render(<ATSCheckButton name="John Doe" />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      // Find the button (not the step text) by its parent structure
      const pdfButtons = screen.getAllByText('Save as PDF')
      const pdfButton = pdfButtons.find((el) =>
        el.closest('button')?.classList.contains('bg-gradient-to-r')
      )
      if (pdfButton) {
        fireEvent.click(pdfButton)
      }

      expect(mockPrint).toHaveBeenCalledTimes(1)
    })

    it('should open ResumeGo in new tab when button is clicked', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const resumeGoButton = screen.getByText('Open ResumeGo')
      fireEvent.click(resumeGoButton)

      expect(mockOpen).toHaveBeenCalledWith(
        'https://www.resumego.net/resume-checker/',
        '_blank'
      )
    })
  })

  describe('Print Functionality', () => {
    it('should format name for PDF title', () => {
      render(<ATSCheckButton name="John Doe" />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const pdfButtons = screen.getAllByText('Save as PDF')
      const pdfButton = pdfButtons.find((el) =>
        el.closest('button')?.classList.contains('bg-gradient-to-r')
      )
      if (pdfButton) {
        fireEvent.click(pdfButton)
      }

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should handle name with underscores', () => {
      render(<ATSCheckButton name="john_doe" />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const pdfButtons = screen.getAllByText('Save as PDF')
      const pdfButton = pdfButtons.find((el) =>
        el.closest('button')?.classList.contains('bg-gradient-to-r')
      )
      if (pdfButton) {
        fireEvent.click(pdfButton)
      }

      expect(document.title).toBe('JohnDoe-Resume')
    })

    it('should restore document title after timeout', () => {
      render(<ATSCheckButton name="John Doe" />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const pdfButtons = screen.getAllByText('Save as PDF')
      const pdfButton = pdfButtons.find((el) =>
        el.closest('button')?.classList.contains('bg-gradient-to-r')
      )
      if (pdfButton) {
        fireEvent.click(pdfButton)
      }

      expect(document.title).toBe('JohnDoe-Resume')
      jest.advanceTimersByTime(100)
      expect(document.title).toBe('Original Title')
    })

    it('should not change title when name is not provided', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const pdfButtons = screen.getAllByText('Save as PDF')
      const pdfButton = pdfButtons.find((el) =>
        el.closest('button')?.classList.contains('bg-gradient-to-r')
      )
      if (pdfButton) {
        fireEvent.click(pdfButton)
      }

      expect(document.title).toBe('Original Title')
      expect(mockPrint).toHaveBeenCalled()
    })
  })

  describe('Styling', () => {
    it('should have amber/orange gradient on trigger button', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })

      expect(button).toHaveClass('bg-gradient-to-r')
      expect(button).toHaveClass('from-amber-500')
      expect(button).toHaveClass('to-orange-500')
    })

    it('should have rounded-full class on trigger button', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })

      expect(button).toHaveClass('rounded-full')
    })

    it('should have shadow classes on trigger button', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })

      expect(button).toHaveClass('shadow-lg')
    })

    it('should have focus ring classes', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })

      expect(button).toHaveClass('focus:ring-2')
      expect(button).toHaveClass('focus:ring-amber-500')
    })
  })

  describe('Accessibility', () => {
    it('should be keyboard accessible', () => {
      render(<ATSCheckButton />)
      const button = screen.getByRole('button', { name: 'Check ATS Score' })

      button.focus()
      expect(button).toHaveFocus()
    })

    it('should have close button with aria-label in modal', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const closeButton = screen.getByRole('button', { name: 'Close modal' })
      expect(closeButton).toHaveAttribute('aria-label', 'Close modal')
    })

    it('should have button role for all interactive elements', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      // Should have multiple buttons in modal
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(1)
    })
  })

  describe('Footer Note', () => {
    it('should display third-party service note', () => {
      render(<ATSCheckButton />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      expect(
        screen.getByText('ResumeGo is a free third-party service')
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string name', () => {
      render(<ATSCheckButton name="" />)
      fireEvent.click(screen.getByRole('button', { name: 'Check ATS Score' }))

      const pdfButtons = screen.getAllByText('Save as PDF')
      const pdfButton = pdfButtons.find((el) =>
        el.closest('button')?.classList.contains('bg-gradient-to-r')
      )
      if (pdfButton) {
        fireEvent.click(pdfButton)
      }

      expect(document.title).toBe('Original Title')
      expect(mockPrint).toHaveBeenCalled()
    })

    it('should handle rapid modal open/close', () => {
      render(<ATSCheckButton />)
      const triggerButton = screen.getByRole('button', {
        name: 'Check ATS Score',
      })

      // Open and close rapidly
      fireEvent.click(triggerButton)
      fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
      fireEvent.click(triggerButton)

      expect(
        screen.getByText(/See how well your resume performs/)
      ).toBeInTheDocument()
    })
  })
})
