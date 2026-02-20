'use client'

import React, { createContext, ChangeEvent } from 'react'
import resumeData from '@/lib/resume-adapter'
import type { ResumeData } from '@/types'

/**
 * Interface representing the result of a skills sorting and enhancement operation.
 */
export type DocumentContextType = {
  resumeData: ResumeData
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>
  handleProfilePicture: (e: ChangeEvent<HTMLInputElement>) => void
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  editable?: boolean
}

export const DocumentContext = createContext<DocumentContextType>({
  resumeData: resumeData,
  setResumeData: () => {},
  handleProfilePicture: () => {},
  handleChange: () => {},
  editable: true,
})

// Export alias for backward compatibility during migration
export const ResumeContext = DocumentContext
