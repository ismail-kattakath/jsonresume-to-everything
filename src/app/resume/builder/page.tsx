'use client'

import React from 'react'
import '@/styles/document-builder.css'
import '@/styles/resume-preview.css'
import PasswordProtection from '@/components/auth/password-protection'
import { OnboardingTour } from '@/components/onboarding/onboarding-wrapper'
import { UnifiedEditor } from '@/components/resume/forms/unified-editor'

/**
 * The main editor page for the AI Resume Builder.
 */
export default function ResumeEditPage() {
  return (
    <PasswordProtection>
      <OnboardingTour>
        <UnifiedEditor />
      </OnboardingTour>
    </PasswordProtection>
  )
}
