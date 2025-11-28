'use client'

import React from 'react'
import type { Tour } from 'onborda'
import {
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Sparkles,
  ArrowDownUp,
  Printer,
  Eye,
  Target,
  MousePointer,
} from 'lucide-react'

/**
 * Onboarding Tour Configuration
 *
 * This file defines the steps for the resume builder onboarding tour.
 * Each step targets an element by its id selector and provides
 * helpful guidance for first-time users.
 *
 * Tour Structure:
 * 1. Welcome & Overview
 * 2. Mode Switching (Resume/Cover Letter)
 * 3. Import/Export functionality
 * 4. AI Settings configuration
 * 5. Personal Information section
 * 6. Work Experience section
 * 7. Education section
 * 8. Skills section
 * 9. Live Preview
 * 10. Print/Export actions
 *
 * @see https://github.com/uixmat/onborda
 */

const IconWrapper = ({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) => (
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
      // Step 1: Welcome
      {
        icon: (
          <IconWrapper>
            <Target className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Welcome to AI Resume Builder! 🎯',
        content: (
          <div className="space-y-2">
            <p>
              This interactive builder helps you create professional resumes and
              cover letters tailored to any job description.
            </p>
            <p className="text-sm text-white/70">
              Let&apos;s take a quick tour to get you started.
            </p>
          </div>
        ),
        selector: '#editor-header',
        side: 'bottom',
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 16,
      },

      // Step 2: Mode Switcher
      {
        icon: (
          <IconWrapper>
            <FileText className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Switch Between Documents',
        content: (
          <div className="space-y-2">
            <p>
              Toggle between <strong>Resume</strong> and{' '}
              <strong>Cover Letter</strong> modes.
            </p>
            <p className="text-sm text-white/70">
              Both documents share your personal information, saving you time.
            </p>
          </div>
        ),
        selector: '#mode-switcher',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 3: Import/Export
      {
        icon: (
          <IconWrapper>
            <ArrowDownUp className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Import & Export Your Data',
        content: (
          <div className="space-y-2">
            <p>
              Import existing resume data from JSON Resume format, or export
              your work anytime.
            </p>
            <p className="text-sm text-white/70">
              Your data is automatically saved to your browser.
            </p>
          </div>
        ),
        selector: '#section-import-export',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 4: AI Settings
      {
        icon: (
          <IconWrapper>
            <Sparkles className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Configure AI Generation',
        content: (
          <div className="space-y-2">
            <p>
              Set up your AI API credentials to enable smart content generation.
            </p>
            <p className="text-sm text-white/70">
              Works with OpenAI, OpenRouter, Ollama, and any OpenAI-compatible
              API.
            </p>
          </div>
        ),
        selector: '#section-ai-settings',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 5: Personal Information
      {
        icon: (
          <IconWrapper>
            <User className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Add Your Information',
        content: (
          <div className="space-y-2">
            <p>Start with your basic contact details and profile photo.</p>
            <p className="text-sm text-white/70">
              This information appears at the top of both your resume and cover
              letter.
            </p>
          </div>
        ),
        selector: '#section-personal-info',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 6: Work Experience
      {
        icon: (
          <IconWrapper>
            <Briefcase className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Add Work Experience',
        content: (
          <div className="space-y-2">
            <p>
              Document your professional journey with job titles, companies, and
              achievements.
            </p>
            <p className="text-sm text-white/70">
              <strong>Pro tip:</strong> Drag entries to reorder them. Use AI to
              generate key achievements!
            </p>
          </div>
        ),
        selector: '#section-work-experience',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 7: Education
      {
        icon: (
          <IconWrapper>
            <GraduationCap className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Add Education',
        content: (
          <div className="space-y-2">
            <p>
              List your educational background, degrees, and certifications.
            </p>
            <p className="text-sm text-white/70">
              Include relevant coursework and academic achievements.
            </p>
          </div>
        ),
        selector: '#section-education',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 8: Skills
      {
        icon: (
          <IconWrapper>
            <Code className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Organize Your Skills',
        content: (
          <div className="space-y-2">
            <p>
              Group your skills into categories like Frontend, Backend, etc.
            </p>
            <p className="text-sm text-white/70">
              <strong>Pro tip:</strong> Drag skill groups to reorder. Click a
              skill to highlight it for emphasis.
            </p>
          </div>
        ),
        selector: '#section-skills',
        side: 'bottom',
        showControls: true,
        pointerPadding: 8,
        pointerRadius: 12,
      },

      // Step 9: Live Preview
      {
        icon: (
          <IconWrapper>
            <Eye className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Real-Time Preview',
        content: (
          <div className="space-y-2">
            <p>
              See your changes instantly in the live preview panel on the right.
            </p>
            <p className="text-sm text-white/70">
              What you see here is exactly what your final document will look
              like.
            </p>
          </div>
        ),
        selector: '#preview-pane',
        side: 'left',
        showControls: true,
        pointerPadding: 20,
        pointerRadius: 16,
      },

      // Step 10: Print/Export Actions
      {
        icon: (
          <IconWrapper>
            <Printer className="h-4 w-4" />
          </IconWrapper>
        ),
        title: 'Export Your Document',
        content: (
          <div className="space-y-2">
            <p>
              When you&apos;re ready, use these buttons to print or export your
              document.
            </p>
            <p className="text-sm text-white/70">
              The ATS Check button helps ensure your resume is
              applicant-tracking-system friendly.
            </p>
          </div>
        ),
        selector: '#print-button',
        side: 'bottom-left',
        showControls: true,
        pointerPadding: 12,
        pointerRadius: 24,
      },

      // Final Step: Get Started
      {
        icon: (
          <IconWrapper>
            <MousePointer className="h-4 w-4" />
          </IconWrapper>
        ),
        title: "You're All Set! 🚀",
        content: (
          <div className="space-y-2">
            <p>
              You now know the basics. Start building your professional resume!
            </p>
            <p className="text-sm text-white/70">
              You can replay this tour anytime using the Tour button.
            </p>
          </div>
        ),
        selector: '#editor-header',
        side: 'bottom',
        showControls: true,
        pointerPadding: 10,
        pointerRadius: 16,
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
  localStorage.setItem(
    'resume_builder_tour_completed_at',
    new Date().toISOString()
  )
}

/**
 * Reset the onboarding tour (allow replay)
 */
export function resetOnboarding(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ONBOARDING_STORAGE_KEY)
  localStorage.removeItem('resume_builder_tour_completed_at')
}
