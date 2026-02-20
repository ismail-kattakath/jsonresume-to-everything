'use client'

import React from 'react'
import type { CardComponentProps } from 'onborda'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useOnborda } from 'onborda'

/**
 * Custom Tour Card Component for Onborda
 *
 * A beautifully styled tooltip card that appears during the onboarding tour.
 * Features:
 * - Glass morphism design matching the resume builder aesthetic
 * - Progress indicator (step X of Y)
 * - Navigation controls (prev/next/skip)
 * - Animated transitions via Framer Motion (handled by Onborda)
 *
 * @param step - Current step configuration
 * @param currentStep - Current step index (0-based)
 * @param totalSteps - Total number of steps in the tour
 * @param nextStep - Function to advance to next step
 * @param prevStep - Function to go to previous step
 * @param arrow - SVG arrow element pointing to target
 */
export function TourCard({ step, currentStep, totalSteps, nextStep, prevStep, arrow }: CardComponentProps) {
  const { closeOnborda } = useOnborda()
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="relative max-w-[400px] min-w-[320px]">
      {/* Arrow pointing to target element - centered at top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">{arrow}</div>

      {/* Card Container */}
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-gray-900/95 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-4">
          <div className="flex items-start gap-3">
            {/* Step Icon */}
            {step.icon && <div className="flex-shrink-0">{step.icon}</div>}

            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-0.5 text-xs text-white/50">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={closeOnborda}
            className="flex-shrink-0 rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/80"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 text-sm leading-relaxed text-white/90">{step.content}</div>

        {/* Progress Bar */}
        <div className="px-4">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation Controls */}
        {step.showControls && (
          <div className="flex items-center justify-between gap-3 p-4">
            {/* Skip Tour */}
            <button onClick={closeOnborda} className="text-sm text-white/50 transition-colors hover:text-white/80">
              Skip tour
            </button>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {/* Previous Button */}
              {!isFirstStep && (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>
              )}

              {/* Next/Finish Button */}
              <button
                onClick={isLastStep ? closeOnborda : nextStep}
                className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {isLastStep ? (
                  "Let's Go!"
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TourCard
