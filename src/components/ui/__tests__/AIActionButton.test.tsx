import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AIActionButton from '@/components/ui/AIActionButton'

describe('AIActionButton', () => {
  const defaultProps = {
    isConfigured: true,
    isLoading: false,
    onClick: jest.fn(),
    label: 'Test Action'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render with provided label', () => {
      render(<AIActionButton {...defaultProps} />)

      expect(screen.getByText('Test Action')).toBeInTheDocument()
    })

    it('should render with custom label', () => {
      render(<AIActionButton {...defaultProps} label="Sort Skills" />)

      expect(screen.getByText('Sort Skills')).toBeInTheDocument()
    })

    it('should render sparkle icon when not loading', () => {
      render(<AIActionButton {...defaultProps} />)

      // The Sparkles icon should be present (via lucide-react)
      const button = screen.getByRole('button')
      expect(button.querySelector('svg')).toBeInTheDocument()
    })

    it('should render loading spinner when loading', () => {
      render(<AIActionButton {...defaultProps} isLoading={true} />)

      // The Loader2 icon should have animate-spin class
      const button = screen.getByRole('button')
      const icon = button.querySelector('svg')
      expect(icon).toHaveClass('animate-spin')
    })
  })

  describe('interaction', () => {
    it('should call onClick when clicked and configured', () => {
      const onClick = jest.fn()
      render(<AIActionButton {...defaultProps} onClick={onClick} />)

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when not configured', () => {
      const onClick = jest.fn()
      render(
        <AIActionButton
          {...defaultProps}
          isConfigured={false}
          onClick={onClick}
        />
      )

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).not.toHaveBeenCalled()
    })

    it('should not call onClick when loading', () => {
      const onClick = jest.fn()
      render(
        <AIActionButton {...defaultProps} isLoading={true} onClick={onClick} />
      )

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('should be disabled when not configured', () => {
      render(<AIActionButton {...defaultProps} isConfigured={false} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should be disabled when loading', () => {
      render(<AIActionButton {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not be disabled when configured and not loading', () => {
      render(<AIActionButton {...defaultProps} />)

      expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('should show custom disabled tooltip when not configured', () => {
      render(
        <AIActionButton
          {...defaultProps}
          isConfigured={false}
          disabledTooltip="Custom tooltip"
        />
      )

      expect(screen.getByRole('button')).toHaveAttribute(
        'title',
        'Custom tooltip'
      )
    })

    it('should show default disabled tooltip when not configured', () => {
      render(<AIActionButton {...defaultProps} isConfigured={false} />)

      expect(screen.getByRole('button')).toHaveAttribute(
        'title',
        'Configure AI settings first'
      )
    })
  })

  describe('size variants', () => {
    it('should apply small size classes by default', () => {
      render(<AIActionButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-2', 'py-1', 'text-xs')
    })

    it('should apply small size classes when size is sm', () => {
      render(<AIActionButton {...defaultProps} size="sm" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-2', 'py-1', 'text-xs')
    })

    it('should apply medium size classes when size is md', () => {
      render(<AIActionButton {...defaultProps} size="md" />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })
  })

  describe('styling', () => {
    it('should have gradient styling when enabled', () => {
      render(<AIActionButton {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gradient-to-r')
    })

    it('should have muted styling when disabled', () => {
      render(<AIActionButton {...defaultProps} isConfigured={false} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('cursor-not-allowed')
      expect(button).toHaveClass('text-white/30')
    })
  })
})
