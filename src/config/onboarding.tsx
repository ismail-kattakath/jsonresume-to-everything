'use client'

import React from 'react'
// @ts-expect-error - Onboarding configuration involves dynamic types missing Tour
import type { Tour } from 'onborda'
import { Sparkles, ArrowDownUp } from 'lucide-react'

/**
 * Onboarding Tour Configuration
 *
 * This file defines the steps for the resume builder onboarding tour.
 * Each step targets an element by its id selector and provides
 * helpful guidance for first-time users.
 *
 * Tour Structure:
 * 1. Import/Export functionality
 * 2. AI Settings configuration
 *
 * @see https://github.com/uixmat/onborda
 */

const IconWrapper = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white ${className}`}
  >
    {children}
  </div>
)

export const onboardingTours: Tour[] = [
  {
    tour: 'resume-builder',
    steps: [
      // Step 1: Import/Export
      {
        icon: (
          <IconWrapper>
            <ArrowDownUp className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Import & Export Your Data',
        content: (
          <div className="space-y-2">
            <p>Import existing resume data from JSON Resume format, or export your work anytime.</p>
            <p className="text-sm text-white/70">Your data is automatically saved to your browser.</p>
          </div>
        ),
        selector: '#section-import-export',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 2: AI Settings
      {
        icon: (
          <IconWrapper>
            <Sparkles className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Configure AI Generation',
        content: (
          <div className="space-y-2">
            <p>Set up your AI API credentials to enable smart content generation.</p>
            <p className="text-sm text-white/70">
              Works with OpenAI, OpenRouter, Ollama, and any OpenAI-compatible API.
            </p>
          </div>
        ),
        selector: '#section-ai-settings',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },
    ],
  },
]

/**
 * Local storage key for tracking tour completion
 */
export const ONBOARDING_STORAGE_KEY = 'resume_builder_tour_completed'

/**
 * Check if the user has completed the onboarding tour
 */
export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true'
}

/**
 * Mark the onboarding tour as completed
 */
export function markOnboardingComplete(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true')
  localStorage.setItem('resume_builder_tour_completed_at', new Date().toISOString())
}

/**
 * Reset the onboarding tour (allow replay)
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  localStorage.removeItem('resume_builder_tour_completed_at')
}
