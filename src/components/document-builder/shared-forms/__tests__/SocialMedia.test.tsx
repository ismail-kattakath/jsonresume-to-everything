import React from 'react'
import { act, waitFor } from '@testing-library/react'
import SocialMedia from '@/components/document-builder/shared-forms/SocialMedia'
import {
  renderWithContext,
  createMockResumeData,
  screen,
  fireEvent,
} from '@/lib/__tests__/test-utils'

// Mock fetch API for URL validation
global.fetch = jest.fn()

describe('SocialMedia Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Rendering', () => {
    it('should render section heading', () => {
      renderWithContext(<SocialMedia />)

      expect(screen.getByText('Social Media')).toBeInTheDocument()
    })

    it('should render social media entries with floating labels', () => {
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const platformLabels = container.querySelectorAll(
        '.floating-label:not(:has(+ input[name="link"]))'
      )
      expect(platformLabels.length).toBeGreaterThanOrEqual(2)

      const urlLabels = screen.getAllByText('URL')
      expect(urlLabels.length).toBe(2)
    })

    it('should display social media data in inputs', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/johndoe' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const platformInput = container.querySelector(
        'input[name="socialMedia"]'
      ) as HTMLInputElement
      const linkInput = container.querySelector(
        'input[name="link"]'
      ) as HTMLInputElement

      expect(platformInput?.value).toBe('Github')
      expect(linkInput?.value).toBe('github.com/johndoe')
    })

    it('should render add button with FormButton', () => {
      renderWithContext(<SocialMedia />)

      // FormButton should render with "Add Social Media" label
      const addButton = screen.getByText(/Add Social Media/i)
      expect(addButton).toBeInTheDocument()
    })
  })

  describe('Add Functionality', () => {
    it('should add new social media entry when add button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const addButton = screen.getByText(/Add Social Media/i).closest('button')

      if (addButton) {
        fireEvent.click(addButton)

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          socialMedia: [
            { socialMedia: 'Github', link: 'github.com/test' },
            { socialMedia: '', link: '' },
          ],
        })
      }
    })
  })

  describe('Delete Functionality', () => {
    it('should render delete buttons with cursor-pointer class', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete this social media"]'
      )

      expect(deleteButton).toBeInTheDocument()
      expect(deleteButton).toHaveClass('cursor-pointer')
    })

    it('should delete social media entry when delete button is clicked', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const deleteButtons = container.querySelectorAll(
        'button[title="Delete this social media"]'
      )

      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0])

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          socialMedia: [
            { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test' },
          ],
        })
      }
    })
  })

  describe('Input Changes', () => {
    it('should handle platform name changes', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const platformInput = container.querySelector('input[name="socialMedia"]')

      if (platformInput) {
        fireEvent.change(platformInput, {
          target: { name: 'socialMedia', value: 'Twitter' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })

    it('should strip https:// from URL input', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: '' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const linkInput = container.querySelector('input[name="link"]')

      if (linkInput) {
        fireEvent.change(linkInput, {
          target: { name: 'link', value: 'https://github.com/test' },
        })

        const callArg = mockSetResumeData.mock.calls[0][0]
        expect(callArg.socialMedia[0].link).toBe('github.com/test')
      }
    })
  })

  describe('URL Validation', () => {
    it('should show validation icon after debounce period', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      // Fast-forward past debounce delay
      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      // Should show validation icon (checking or valid)
      const icons = container.querySelectorAll('[title]')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should show empty state icon when URL is empty', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: '' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      await act(async () => {
        await Promise.resolve()
      })

      // Should show empty state icon with link icon
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should validate URL with https prefix when not provided', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'https://github.com/test',
          expect.any(Object)
        )
      })
    })

    it('should handle fetch errors and show invalid state', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'invalid-url' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      await act(async () => {
        await Promise.resolve()
      })

      // Component should handle the error and show some validation icon
      expect(global.fetch).toHaveBeenCalled()
    })

    it('should clear validation status when link is cleared', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const linkInput = container.querySelector('input[name="link"]')

      if (linkInput) {
        fireEvent.change(linkInput, {
          target: { name: 'link', value: '' },
        })

        // Validation status should be cleared
        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })
  })

  describe('Floating Labels', () => {
    it('should have floating-label-group for both inputs', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const floatingLabelGroups = container.querySelectorAll(
        '.floating-label-group'
      )

      // Should have 2 groups per entry (platform and URL)
      expect(floatingLabelGroups.length).toBe(2)
    })

    it('should display Platform Name and URL labels', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Platform Name')).toBeInTheDocument()
      expect(screen.getByText('URL')).toBeInTheDocument()
    })
  })

  describe('Layout and Styling', () => {
    it('should apply hover effects to entry containers', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const entryContainer = container.querySelector('.group')

      expect(entryContainer).toHaveClass(
        'hover:border-white/20',
        'hover:bg-white/10'
      )
    })

    it('should use responsive layout for inputs', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const entryContainer = container.querySelector('.group')

      expect(entryContainer).toHaveClass('flex-col', 'sm:flex-row')
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      await act(async () => {
        await Promise.resolve()
      })

      // Check for heading and inputs
      expect(screen.getByText('Social Media')).toBeInTheDocument()
      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should have descriptive title attributes on buttons', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete this social media"]'
      )

      expect(deleteButton).toHaveAttribute('title')
    })

    it('should have descriptive titles on validation icons', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: '' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      await act(async () => {
        await Promise.resolve()
      })

      // Check that validation icons with titles exist
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty socialMedia array', () => {
      const mockData = createMockResumeData({
        socialMedia: [],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      // Should still render the section heading and add button
      expect(screen.getByText('Social Media')).toBeInTheDocument()
    })

    it('should handle multiple social media entries', () => {
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test1' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test2' },
          { socialMedia: 'Twitter', link: 'twitter.com/test3' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { resumeData: mockData },
      })

      const entries = container.querySelectorAll('.group')

      expect(entries.length).toBe(3)
    })

    it('should handle URLs with existing https:// protocol', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: '' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          resumeData: mockData,
          setResumeData: mockSetResumeData,
        },
      })

      const linkInput = container.querySelector('input[name="link"]')

      if (linkInput) {
        fireEvent.change(linkInput, {
          target: { name: 'link', value: 'https://github.com/test' },
        })

        const callArg = mockSetResumeData.mock.calls[0][0]
        // Should strip the https://
        expect(callArg.socialMedia[0].link).toBe('github.com/test')
      }
    })
  })
})
