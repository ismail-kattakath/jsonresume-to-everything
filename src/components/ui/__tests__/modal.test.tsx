import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Modal from '@/components/ui/modal'

// Mock framer-motion to simplify testing components that use AnimatePresence and motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Modal', () => {
  const mockOnClose = jest.fn()
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    title: 'Test Modal',
    children: <div data-testid="modal-content">Modal Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Reset body overflow
    document.body.style.overflow = 'unset'
  })

  it('renders correctly when open', () => {
    render(<Modal {...defaultProps} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByTestId('modal-content')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('does not render when closed', () => {
    render(<Modal {...defaultProps} isOpen={false} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('calls onClose when close button is clicked', () => {
    render(<Modal {...defaultProps} />)

    const closeButton = screen.getByLabelText('Close modal')
    fireEvent.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('hides close button when showCloseButton is false', () => {
    render(<Modal {...defaultProps} showCloseButton={false} />)

    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', () => {
    render(<Modal {...defaultProps} />)

    const backdrop = screen.getByTestId('modal-backdrop')
    fireEvent.click(backdrop)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when modal content is clicked', () => {
    render(<Modal {...defaultProps} />)

    const modalContent = screen.getByTestId('modal-content')
    fireEvent.click(modalContent)

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when a key other than Escape is pressed', () => {
    render(<Modal {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Enter' })

    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('calls onClose when Escape key is pressed', () => {
    render(<Modal {...defaultProps} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('cleans up event listeners and body styles on unmount', () => {
    const { unmount } = render(<Modal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('unset')
  })

  it('applies correct max width classes', () => {
    const { rerender } = render(<Modal {...defaultProps} maxWidth="sm" />)
    let modalWrapper = screen.getByRole('dialog').lastChild as HTMLElement
    expect(modalWrapper).toHaveClass('max-w-sm')

    rerender(<Modal {...defaultProps} maxWidth="2xl" />)
    modalWrapper = screen.getByRole('dialog').lastChild as HTMLElement
    expect(modalWrapper).toHaveClass('max-w-2xl')
  })
})
