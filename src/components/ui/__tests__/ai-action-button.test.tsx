import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import AIActionButton from '@/components/ui/ai-action-button'
import { useAISettings } from '@/lib/contexts/ai-settings-context'

// CRITICAL: Unmock the global mock from jest.setup.js to test the real component
jest.unmock('@/components/ui/ai-action-button')

// Mock BaseButton since it's used by AIActionButton
// Ensure it renders the 'icon' prop to satisfy coverage for icons
jest.mock('../base-button', () => ({
  BaseButton: ({ children, variant, 'aria-label': ariaLabel, className, title, disabled, onClick, icon }: any) => (
    <button
      className={`${variant || ''} ${className || ''}`}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      onClick={onClick}
    >
      <span data-testid="button-icon">{icon}</span>
      {children}
    </button>
  ),
}))

jest.mock('@/lib/contexts/ai-settings-context')

describe('AIActionButton', () => {
  const mockAISettings = {
    settings: { providerType: 'openai' },
    isAIWorking: false,
    isConfigured: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAISettings as jest.Mock).mockReturnValue(mockAISettings)
  })

  it('renders with default blue variant for non-on-device providers', () => {
    render(<AIActionButton label="Test Action" isLoading={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('gradient-blue')
    expect(screen.getByText('Test Action')).toBeInTheDocument()
  })

  it('automatically uses green variant for on-device provider', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      ...mockAISettings,
      settings: { providerType: 'on-device' },
    })

    render(<AIActionButton label="Test Action" isLoading={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('gradient-green')
  })

  it('adds 🔒 icon and On-Device prefix for specific label on-device', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      ...mockAISettings,
      settings: { providerType: 'on-device' },
    })

    render(<AIActionButton label="Generate by JD" isLoading={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('aria-label', '🔒 On-Device AI')
    expect(screen.getByText('🔒 On-Device AI')).toBeInTheDocument()
  })

  it('uses explicitly provided variant when NOT on-device (amber branch)', () => {
    render(<AIActionButton label="Test Action" variant="amber" isLoading={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('gradient-amber')
  })

  it('is disabled when isConfigured prop is false and not on-device', () => {
    render(<AIActionButton label="Test Action" isConfigured={false} isLoading={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('is NOT disabled when isConfigured is false but IS on-device', () => {
    ;(useAISettings as jest.Mock).mockReturnValue({
      ...mockAISettings,
      settings: { providerType: 'on-device' },
    })

    render(<AIActionButton label="Test Action" isConfigured={false} isLoading={false} onClick={() => {}} />)
    const button = screen.getByRole('button')
    expect(button).not.toBeDisabled()
  })

  it('shows custom disabledTooltip when provided and disabled', () => {
    render(
      <AIActionButton
        label="Test Action"
        isConfigured={false}
        isLoading={false}
        onClick={() => {}}
        disabledTooltip="Custom Tooltip"
      />
    )
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('title', 'Custom Tooltip')
  })

  it('handles different size variants and switch cases', () => {
    const { rerender } = render(<AIActionButton label="Test" size="lg" isLoading={false} onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<AIActionButton label="Test" size="md" isLoading={false} onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()

    rerender(<AIActionButton label="Test" size="sm" isLoading={false} onClick={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('shows loading state with spinner and covers onClick', () => {
    const onClickMock = jest.fn()
    const { rerender } = render(<AIActionButton label="Loading" isLoading={true} onClick={onClickMock} />)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    // Check for spinner (Loader2 has animate-spin)
    expect(screen.getByTestId('button-icon').querySelector('.animate-spin')).toBeInTheDocument()

    // Test onClick (enable button first by setting isLoading false)
    rerender(<AIActionButton label="Clickable" isLoading={false} onClick={onClickMock} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClickMock).toHaveBeenCalled()
  })
})
