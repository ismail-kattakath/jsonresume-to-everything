import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OnboardingTour } from '../OnboardingTour'
import {
  ONBOARDING_STORAGE_KEY,
  hasCompletedOnboarding,
  markOnboardingComplete,
  resetOnboarding,
} from '@/config/onboarding'

// Mock the onborda library
jest.mock('onborda', () => ({
  OnbordaProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="onborda-provider">{children}</div>
  ),
  Onborda: ({
    children,
    showOnborda,
  }: {
    children: React.ReactNode
    showOnborda: boolean
  }) => (
    <div data-testid="onborda" data-show={showOnborda}>
      {children}
    </div>
  ),
  useOnborda: () => ({
    startOnborda: jest.fn(),
    closeOnborda: jest.fn(),
    isOnbordaVisible: false,
    currentStep: 0,
    currentTour: null,
    setCurrentStep: jest.fn(),
  }),
}))

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('OnboardingTour', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.clear()
  })

  it('renders children correctly', () => {
    render(
      <OnboardingTour>
        <div data-testid="child-content">Test Content</div>
      </OnboardingTour>
    )

    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('wraps content with OnbordaProvider', () => {
    render(
      <OnboardingTour>
        <div>Test</div>
      </OnboardingTour>
    )

    expect(screen.getByTestId('onborda-provider')).toBeInTheDocument()
  })

  it('renders Onborda component', () => {
    render(
      <OnboardingTour>
        <div>Test</div>
      </OnboardingTour>
    )

    expect(screen.getByTestId('onborda')).toBeInTheDocument()
  })
})

describe('Onboarding localStorage utilities', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
  })

  describe('hasCompletedOnboarding', () => {
    it('returns false when tour has not been completed', () => {
      expect(hasCompletedOnboarding()).toBe(false)
    })

    it('returns true when tour has been completed', () => {
      mockLocalStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      expect(hasCompletedOnboarding()).toBe(true)
    })

    it('returns false when storage value is not "true"', () => {
      mockLocalStorage.setItem(ONBOARDING_STORAGE_KEY, 'false')
      expect(hasCompletedOnboarding()).toBe(false)
    })
  })

  describe('markOnboardingComplete', () => {
    it('sets the storage key to "true"', () => {
      markOnboardingComplete()
      expect(mockLocalStorage.getItem(ONBOARDING_STORAGE_KEY)).toBe('true')
    })

    it('also sets a timestamp', () => {
      markOnboardingComplete()
      const timestamp = mockLocalStorage.getItem(
        'resume_builder_tour_completed_at'
      )
      expect(timestamp).toBeTruthy()
      // Verify it's a valid ISO date string
      expect(() => new Date(timestamp!)).not.toThrow()
    })
  })

  describe('resetOnboarding', () => {
    it('removes the completion flag', () => {
      mockLocalStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
      resetOnboarding()
      expect(mockLocalStorage.getItem(ONBOARDING_STORAGE_KEY)).toBeNull()
    })

    it('removes the timestamp', () => {
      mockLocalStorage.setItem(
        'resume_builder_tour_completed_at',
        '2025-01-01T00:00:00Z'
      )
      resetOnboarding()
      expect(
        mockLocalStorage.getItem('resume_builder_tour_completed_at')
      ).toBeNull()
    })
  })
})
