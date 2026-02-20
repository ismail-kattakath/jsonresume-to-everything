import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { TourCard } from '@/components/onboarding/tour-card'
import type { Step } from 'onborda'

// Mock useOnborda hook
const mockCloseOnborda = jest.fn()

jest.mock('onborda', () => ({
  useOnborda: () => ({
    closeOnborda: mockCloseOnborda,
    startOnborda: jest.fn(),
    isOnbordaVisible: true,
    currentStep: 0,
    currentTour: 'test-tour',
    setCurrentStep: jest.fn(),
  }),
}))

describe('TourCard', () => {
  const mockNextStep = jest.fn()
  const mockPrevStep = jest.fn()

  const defaultStep: Step = {
    icon: <span data-testid="step-icon">🎯</span>,
    title: 'Test Step Title',
    content: <p data-testid="step-content">Test step content</p>,
    selector: '#test-element',
    side: 'bottom',
    showControls: true,
    pointerPadding: 10,
    pointerRadius: 10,
  }

  const defaultProps = {
    step: defaultStep,
    currentStep: 0,
    totalSteps: 5,
    nextStep: mockNextStep,
    prevStep: mockPrevStep,
    arrow: <svg data-testid="arrow" />,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders step title', () => {
    render(<TourCard {...defaultProps} />)
    expect(screen.getByText('Test Step Title')).toBeInTheDocument()
  })

  it('renders step content', () => {
    render(<TourCard {...defaultProps} />)
    expect(screen.getByTestId('step-content')).toBeInTheDocument()
    expect(screen.getByText('Test step content')).toBeInTheDocument()
  })

  it('renders step icon', () => {
    render(<TourCard {...defaultProps} />)
    expect(screen.getByTestId('step-icon')).toBeInTheDocument()
  })

  it('renders arrow element', () => {
    render(<TourCard {...defaultProps} />)
    expect(screen.getByTestId('arrow')).toBeInTheDocument()
  })

  it('displays correct step count', () => {
    render(<TourCard {...defaultProps} currentStep={2} totalSteps={10} />)
    expect(screen.getByText('Step 3 of 10')).toBeInTheDocument()
  })

  it('renders progress bar with correct width', () => {
    const { container } = render(<TourCard {...defaultProps} currentStep={2} totalSteps={5} />)
    // Step 3 of 5 = 60% progress
    const progressBar = container.querySelector('[class*="bg-gradient-to-r from-blue-500 to-purple-500"]')
    expect(progressBar).toHaveStyle({ width: '60%' })
  })

  describe('Navigation controls', () => {
    it('shows controls when showControls is true', () => {
      render(<TourCard {...defaultProps} />)
      expect(screen.getByText('Skip tour')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('hides Back button on first step', () => {
      render(<TourCard {...defaultProps} currentStep={0} />)
      expect(screen.queryByText('Back')).not.toBeInTheDocument()
    })

    it('shows Back button on subsequent steps', () => {
      render(<TourCard {...defaultProps} currentStep={1} />)
      expect(screen.getByText('Back')).toBeInTheDocument()
    })

    it('shows "Let\'s Go!" on last step', () => {
      render(<TourCard {...defaultProps} currentStep={4} totalSteps={5} />)
      expect(screen.getByText("Let's Go!")).toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('calls nextStep when Next button is clicked', () => {
      render(<TourCard {...defaultProps} />)
      fireEvent.click(screen.getByText('Next'))
      expect(mockNextStep).toHaveBeenCalledTimes(1)
    })

    it('calls prevStep when Back button is clicked', () => {
      render(<TourCard {...defaultProps} currentStep={1} />)
      fireEvent.click(screen.getByText('Back'))
      expect(mockPrevStep).toHaveBeenCalledTimes(1)
    })

    it('calls closeOnborda when Skip tour is clicked', () => {
      render(<TourCard {...defaultProps} />)
      fireEvent.click(screen.getByText('Skip tour'))
      expect(mockCloseOnborda).toHaveBeenCalledTimes(1)
    })

    it('calls closeOnborda when X button is clicked', () => {
      render(<TourCard {...defaultProps} />)
      const closeButton = screen.getByLabelText('Close tour')
      fireEvent.click(closeButton)
      expect(mockCloseOnborda).toHaveBeenCalledTimes(1)
    })

    it('calls closeOnborda when "Let\'s Go!" button is clicked on last step', () => {
      render(<TourCard {...defaultProps} currentStep={4} totalSteps={5} />)
      const letsGoButton = screen.getByText("Let's Go!")
      fireEvent.click(letsGoButton)
      expect(mockCloseOnborda).toHaveBeenCalledTimes(1)
      expect(mockNextStep).not.toHaveBeenCalled()
    })
  })

  describe('without controls', () => {
    it('does not show navigation when showControls is false', () => {
      const stepWithoutControls = { ...defaultStep, showControls: false }
      render(<TourCard {...defaultProps} step={stepWithoutControls} />)
      expect(screen.queryByText('Skip tour')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })
  })

  describe('without icon', () => {
    it('renders without icon when not provided', () => {
      const stepWithoutIcon = { ...defaultStep, icon: null }
      render(<TourCard {...defaultProps} step={stepWithoutIcon} />)
      expect(screen.queryByTestId('step-icon')).not.toBeInTheDocument()
      // But title should still render
      expect(screen.getByText('Test Step Title')).toBeInTheDocument()
    })
  })
})
