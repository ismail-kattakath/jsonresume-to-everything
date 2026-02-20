'use client'

import React, { useEffect, useState } from 'react'
import { Onborda, OnbordaProvider, useOnborda } from 'onborda'
import { onboardingTours, hasCompletedOnboarding, markOnboardingComplete } from '@/config/onboarding'
import { TourCard } from './TourCard'

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
  const { startOnborda, isOnbordaVisible } = useOnborda()
  const [isClient, setIsClient] = useState(false)

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
    }
  }, [isClient, startOnborda])

  // Mark tour as complete when it finishes
  useEffect(() => {
    if (isClient && !isOnbordaVisible && hasCompletedOnboarding() === false) {
      // Tour was closed (either completed or skipped)
      markOnboardingComplete()
    }
  }, [isOnbordaVisible, isClient])

  return <>{children}</>
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
