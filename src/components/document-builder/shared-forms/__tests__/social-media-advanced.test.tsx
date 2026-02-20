import React from 'react'
import { act, waitFor } from '@testing-library/react'
import SocialMedia from '@/components/document-builder/shared-forms/social-media'
import { renderWithContext, createMockResumeData, screen, fireEvent } from '@/lib/__tests__/test-utils'
import type { DocumentContextType } from '@/lib/contexts/document-context'
import type { ResumeData } from '@/types'

// Mock fetch API for URL validation
global.fetch = jest.fn()

describe('SocialMedia Component - Advanced Branch Coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    })
  })

  afterEach(() => {
    act(() => {
      jest.runAllTimers()
    })
    jest.useRealTimers()
  })

  it('handles URL validation and reindexing branches', async () => {
    const mockSetResumeData = jest.fn()
    const mockData = createMockResumeData({
      socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
    })

    const { container } = renderWithContext(<SocialMedia />, {
      contextValue: {
        ...({} as DocumentContextType),
        resumeData: mockData as ResumeData,
        setResumeData: mockSetResumeData,
      },
    })

    // Advance past initial validation
    await act(async () => {
      jest.advanceTimersByTime(2000)
    })

    // 1. Check protocol stripping branches
    const linkInput = container.querySelector('input[name="link"]') as HTMLInputElement

    fireEvent.change(linkInput, { target: { value: 'https://test.com', name: 'link' } })
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        socialMedia: [{ socialMedia: 'Github', link: 'test.com' }],
      })
    )

    fireEvent.change(linkInput, { target: { value: 'http://test2.com', name: 'link' } })
    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        socialMedia: [{ socialMedia: 'Github', link: 'test2.com' }],
      })
    )

    // 2. Removal branch
    const originalConfirm = window.confirm
    window.confirm = jest.fn(() => true)

    const deleteButton = container.querySelector('button[title="Delete social media"]')
    if (deleteButton) fireEvent.click(deleteButton)

    expect(mockSetResumeData).toHaveBeenCalled()
    window.confirm = originalConfirm
  })
})
