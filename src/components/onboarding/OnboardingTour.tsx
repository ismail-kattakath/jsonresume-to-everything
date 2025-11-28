'use client'

import React, { useEffect, useState } from 'react'
import { Onborda, OnbordaProvider, useOnborda } from 'onborda'
import {
  onboardingTours,
  hasCompletedOnboarding,
  markOnboardingComplete,
  resetOnboarding,
} from '@/config/onboarding'
import { TourCard } from './TourCard'
import { HelpCircle } from 'lucide-react'

/**
 * Onboarding Tour Wrapper Component
 *
 * This component manages the onboarding tour state and provides
 * the Onborda context to child components.
 *
 * Features:
 * - Auto-starts tour for first-time users
 * - Provides replay functionality via help button
 * - Persists completion state in localStorage
 * - Beautiful spotlight effect with dark overlay
 */

interface OnboardingTourProps {
  children: React.ReactNode
}

/**
 * Internal component that handles tour logic
 * Must be inside OnbordaProvider to use useOnborda hook
 */
function TourController({ children }: OnboardingTourProps) {
  const { startOnborda, isOnbordaVisible, closeOnborda } = useOnborda()
  const [isClient, setIsClient] = useState(false)
  const [showStartButton, setShowStartButton] = useState(false)

  // Ensure we're on the client before checking localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Auto-start tour for first-time users after a short delay
  useEffect(() => {
    if (!isClient) return

    const hasCompleted = hasCompletedOnboarding()

    if (!hasCompleted) {
      // Small delay to let the page render and elements mount
      const timer = setTimeout(() => {
        startOnborda('resume-builder')
      }, 800)
      return () => clearTimeout(timer)
    } else {
      // Show the help button for users who completed the tour
      setShowStartButton(true)
    }
  }, [isClient, startOnborda])

  // Mark tour as complete when it finishes
  useEffect(() => {
    if (isClient && !isOnbordaVisible && hasCompletedOnboarding() === false) {
      // Tour was closed (either completed or skipped)
      markOnboardingComplete()
      setShowStartButton(true)
    }
  }, [isOnbordaVisible, isClient])

  // Handle replay tour
  const handleReplayTour = () => {
    resetOnboarding()
    startOnborda('resume-builder')
  }

  return (
    <>
      {children}

      {/* Help Button - Replay Tour */}
      {isClient && showStartButton && !isOnbordaVisible && (
        <button
          onClick={handleReplayTour}
          className="exclude-print fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          aria-label="Replay onboarding tour"
          title="Take a guided tour"
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Tour</span>
        </button>
      )}
    </>
  )
}

/**
 * Main Onboarding Tour Component
 *
 * Wrap your page content with this component to enable the onboarding tour.
 *
 * @example
 * ```tsx
 * <OnboardingTour>
 *   <YourPageContent />
 * </OnboardingTour>
 * ```
 */
export function OnboardingTour({ children }: OnboardingTourProps) {
  return (
    <OnbordaProvider>
      <Onborda
        steps={onboardingTours}
        showOnborda={false}
        shadowRgb="0,0,0"
        shadowOpacity="0.85"
        cardComponent={TourCard}
        cardTransition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
        }}
      >
        <TourController>{children}</TourController>
      </Onborda>
    </OnbordaProvider>
  )
}

export default OnboardingTour
