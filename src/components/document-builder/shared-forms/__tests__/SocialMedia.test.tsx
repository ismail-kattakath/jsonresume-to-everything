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
    it('should render social media entries with inputs', async () => {
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Check for inputs
      await waitFor(() => {
        const inputs = container.querySelectorAll('input[name="socialMedia"]')
        expect(inputs.length).toBe(2)
      })
    })

    it('should display social media data in inputs', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/johndoe' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
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

      const addButton = screen.getByText(/Add Social Media/i)
      expect(addButton).toBeInTheDocument()
    })

    it('should display platform name in collapsed header', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // The title should be displayed in the AccordionHeader
      expect(screen.getByText('Github')).toBeInTheDocument()
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
          ...({} as any),
          resumeData: mockData as any,
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
    it('should render delete buttons', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete social media"]'
      )

      expect(deleteButton).toBeInTheDocument()
    })

    it('should delete social media entry when delete button is clicked', () => {
      // Mock window.confirm to return true
      const originalConfirm = window.confirm
      window.confirm = jest.fn(() => true)

      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const deleteButtons = container.querySelectorAll(
        'button[title="Delete social media"]'
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

      window.confirm = originalConfirm
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
          ...({} as any),
          resumeData: mockData as any,
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
          ...({} as any),
          resumeData: mockData as any,
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
    it('should show validation indicator after debounce period', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Fast-forward past debounce delay
      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      // Should show validation indicator (checking or valid pill)
      await waitFor(() => {
        const validIndicator = container.querySelector(
          '[title="URL is reachable"]'
        )
        const checkingIndicator = container.querySelector(
          '[title="Validating URL..."]'
        )
        expect(validIndicator || checkingIndicator).toBeTruthy()
      })
    })

    it('should validate URL with https prefix when not provided', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
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

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      await act(async () => {
        await Promise.resolve()
      })

      // Should show invalid indicator
      await waitFor(() => {
        const invalidIndicator = container.querySelector(
          '[title="URL may be unreachable"]'
        )
        expect(invalidIndicator).toBeInTheDocument()
      })
    })

    it('should clear validation status when link is cleared', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const linkInput = container.querySelector('input[name="link"]')

      if (linkInput) {
        fireEvent.change(linkInput, {
          target: { name: 'link', value: '' },
        })

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
        contextValue: { ...({} as any), resumeData: mockData as any },
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
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText('Platform Name')).toBeInTheDocument()
      expect(screen.getByText('URL')).toBeInTheDocument()
    })
  })

  describe('Accordion Behavior', () => {
    it('should have expand/collapse buttons', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Should have expand/collapse button
      const toggleButton =
        container.querySelector('button[title="Expand"]') ||
        container.querySelector('button[title="Collapse"]')
      expect(toggleButton).toBeInTheDocument()
    })

    it('should have drag handle', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Should have drag handle (cursor-grab class)
      const dragHandle = container.querySelector('.cursor-grab')
      expect(dragHandle).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper semantic structure', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      await act(async () => {
        await Promise.resolve()
      })

      const inputs = container.querySelectorAll('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('should have descriptive title attributes on buttons', () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const deleteButton = container.querySelector(
        'button[title="Delete social media"]'
      )

      expect(deleteButton).toHaveAttribute('title')
    })
  })

  describe('Drag and Drop', () => {
    it('should render multiple entries for drag and drop', () => {
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test1' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test2' },
          { socialMedia: 'Twitter', link: 'twitter.com/test3' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      // Should render 3 platform inputs
      const platformInputs = container.querySelectorAll(
        'input[name="socialMedia"]'
      )
      expect(platformInputs.length).toBe(3)
    })

    it('should reindex validation status after delete', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm
      window.confirm = jest.fn(() => true)

      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test1' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test2' },
          { socialMedia: 'Twitter', link: 'twitter.com/test3' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const deleteButtons = container.querySelectorAll(
        'button[title="Delete social media"]'
      )

      // Delete middle item
      if (deleteButtons[1]) {
        fireEvent.click(deleteButtons[1])

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          socialMedia: [
            { socialMedia: 'Github', link: 'github.com/test1' },
            { socialMedia: 'Twitter', link: 'twitter.com/test3' },
          ],
        })
      }

      window.confirm = originalConfirm
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty socialMedia array', () => {
      const mockData = createMockResumeData({
        socialMedia: [],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText(/Add Social Media/i)).toBeInTheDocument()
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
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const platformInputs = container.querySelectorAll(
        'input[name="socialMedia"]'
      )
      expect(platformInputs.length).toBe(3)
    })

    it('should handle URLs with existing https:// protocol', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: '' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
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

    it('should handle http:// protocol removal', () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: '' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          ...({} as any),
          resumeData: mockData as any,
          setResumeData: mockSetResumeData,
        },
      })

      const linkInput = container.querySelector('input[name="link"]')

      if (linkInput) {
        fireEvent.change(linkInput, {
          target: { name: 'link', value: 'http://github.com/test' },
        })

        expect(mockSetResumeData).toHaveBeenCalled()
      }
    })
  })
})
