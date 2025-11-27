import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Modal from '@/components/ui/Modal'

describe('Modal', () => {
  const mockOnClose = jest.fn()

  beforeEach(() => {
    mockOnClose.mockClear()
  })

  afterEach(() => {
    document.body.style.overflow = 'unset'
  })

  it('renders nothing when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when Escape key is pressed', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('has backdrop element with correct styling', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    // Check that backdrop exists with correct classes
    const backdrop = document.querySelector('.backdrop-blur-sm')
    expect(backdrop).toBeInTheDocument()
    expect(backdrop).toHaveClass('absolute', 'inset-0')
  })

  it('calls onClose when backdrop is clicked directly', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    // Find the backdrop element (the motion.div with backdrop-blur-sm)
    const backdrop = document.querySelector('.backdrop-blur-sm')
    if (backdrop) {
      // Click directly on the backdrop to trigger handleBackdropClick
      fireEvent.click(backdrop)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    }
  })

  it('does not call onClose when modal content is clicked', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    const content = screen.getByText('Content')
    fireEvent.click(content)

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('hides close button when showCloseButton is false', () => {
    render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        showCloseButton={false}
      >
        <div>Content</div>
      </Modal>
    )

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
  })

  it('applies correct max-width class', () => {
    const { rerender } = render(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        maxWidth="sm"
      >
        <div>Content</div>
      </Modal>
    )

    let dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('.max-w-sm')).toBeInTheDocument()

    rerender(
      <Modal
        isOpen={true}
        onClose={mockOnClose}
        title="Test Modal"
        maxWidth="2xl"
      >
        <div>Content</div>
      </Modal>
    )

    dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('.max-w-2xl')).toBeInTheDocument()
  })

  it('prevents body scroll when open', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()
    expect(document.body.style.overflow).toBe('unset')
  })

  it('has proper ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title')

    const title = screen.getByText('Test Modal')
    expect(title).toHaveAttribute('id', 'modal-title')
  })

  it('focuses close button on open', async () => {
    render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close modal')
      expect(closeButton).toHaveFocus()
    })
  })

  it('cleans up event listeners on unmount', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={mockOnClose} title="Test Modal">
        <div>Content</div>
      </Modal>
    )

    unmount()

    // Fire escape key after unmount - should not call onClose
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(mockOnClose).not.toHaveBeenCalled()
  })
})
