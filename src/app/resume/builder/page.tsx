'use client'

import React from 'react'
import '@/styles/document-builder.css'
import '@/styles/resume-preview.css'
import PasswordProtection from '@/components/auth/PasswordProtection'
import { OnboardingTour } from '@/components/onboarding'
import { UnifiedEditor } from '@/components/resume/forms/UnifiedEditor'

export default function ResumeEditPage() {
  return (
    <PasswordProtection>
      <OnboardingTour>
        <UnifiedEditor />
      </OnboardingTour>
    </PasswordProtection>
  )
}
