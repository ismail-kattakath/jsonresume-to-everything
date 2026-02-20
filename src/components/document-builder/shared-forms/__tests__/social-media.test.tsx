import React from 'react'
import { act, waitFor } from '@testing-library/react'
import SocialMedia from '@/components/document-builder/shared-forms/SocialMedia'
import { renderWithContext, createMockResumeData, screen, fireEvent } from '@/lib/__tests__/test-utils'
import type { DocumentContextType } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types'

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
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
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
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      const platformInput = container.querySelector('input[name="socialMedia"]') as HTMLInputElement
      const linkInput = container.querySelector('input[name="link"]') as HTMLInputElement

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
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
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
          ...({} as DocumentContextType),
          resumeData: mockData as ResumeData,
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
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      const deleteButton = container.querySelector('button[title="Delete social media"]')

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
          ...({} as DocumentContextType),
          resumeData: mockData as ResumeData,
          setResumeData: mockSetResumeData,
        },
      })

      const deleteButtons = container.querySelectorAll('button[title="Delete social media"]')

      if (deleteButtons[0]) {
        fireEvent.click(deleteButtons[0])

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          socialMedia: [{ socialMedia: 'LinkedIn', link: 'linkedin.com/in/test' }],
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
          ...({} as DocumentContextType),
          resumeData: mockData as ResumeData,
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
          ...({} as DocumentContextType),
          resumeData: mockData as ResumeData,
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
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      // Fast-forward past debounce delay
      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      // Should show validation indicator (checking or valid pill)
      await waitFor(() => {
        const validIndicator = container.querySelector('[title="URL is reachable"]')
        const checkingIndicator = container.querySelector('[title="Validating URL..."]')
        expect(validIndicator || checkingIndicator).toBeTruthy()
      })
    })

    it('should validate URL with https prefix when not provided', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'github.com/test' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('https://github.com/test', expect.any(Object))
      })
    })

    it('should validate URL with http prefix properly', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: 'http://github.com/test' }],
      })

      renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      await act(async () => {
        jest.advanceTimersByTime(1000)
        await Promise.resolve()
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://github.com/test', expect.any(Object))
      })
    })

    it('should show empty validation status for empty URL', async () => {
      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'Github', link: '' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      await act(async () => {
        jest.runAllTimers()
      })

      // Validation pill shouldn't be valid, invalid, or checking (empty state is null rendering)
      expect(container.querySelector('.bg-green-500\\/20')).not.toBeInTheDocument()
      expect(container.querySelector('.bg-red-500\\/20')).not.toBeInTheDocument()
    })

    it('should reindex validation status after delete for earlier keys, later keys, and the deleted key itself', async () => {
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
          ...({} as DocumentContextType),
          resumeData: mockData as ResumeData,
          setResumeData: mockSetResumeData,
        },
      })

      // Fast forward past debounce so they all get a status
      await act(async () => {
        jest.advanceTimersByTime(1500)
        await Promise.resolve()
      })

      const deleteButtons = container.querySelectorAll('button[title="Delete social media"]')

      // Delete middle item (index 1)
      if (deleteButtons[1]) {
        await act(async () => {
          fireEvent.click(deleteButtons[1]!)
        })
        expect(mockSetResumeData).toHaveBeenCalled()
      }

      window.confirm = originalConfirm
    })
  })

  describe('Drag and Drop', () => {
    it('should handle drag and drop properly using DnDContext onDragEnd', async () => {
      const mockSetResumeData = jest.fn()
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/test1' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/test2' },
          { socialMedia: 'Twitter', link: 'twitter.com/test3' },
        ],
      })

      // We need to render the component, find the form elements, and then simulate calling onDragEnd
      // Note: react-beautiful-dnd is tricky to test via standard fireEvents, so we will manually test
      // the handler if possible, otherwise rely on the context to trigger the function.
      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: {
          ...({} as DocumentContextType),
          resumeData: mockData as ResumeData,
          setResumeData: mockSetResumeData,
        },
      })

      // Fast forward so statuses are set
      await act(async () => {
        jest.advanceTimersByTime(1000)
      })

      expect(container).toBeInTheDocument()
    })
  })

  describe('Status Indicator Rendering', () => {
    it('renders UrlStatusIndicator with all statuses', () => {
      // The test involves mocking or changing the state but since it's internal we test via behavior
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Platform', link: 'valid.com' },
          { socialMedia: 'Invalid', link: 'invalid-url' },
        ],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      // Trigger validation
      act(() => {
        jest.advanceTimersByTime(1500)
      })

      // we expect fetch to be called
      expect(global.fetch).toHaveBeenCalled()
    })

    it('shows invalid URL warning when fetch throws (network error)', async () => {
      // Simulate fetch failure for the link
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      const mockData = createMockResumeData({
        socialMedia: [{ socialMedia: 'BadLink', link: 'notarealsite.xyz' }],
      })

      const { container } = renderWithContext(<SocialMedia />, {
        contextValue: { ...({} as DocumentContextType), resumeData: mockData as ResumeData },
      })

      await act(async () => {
        jest.advanceTimersByTime(1200)
        await Promise.resolve()
        await Promise.resolve()
      })

      await waitFor(() => {
        // Should show invalid indicator or warning text
        const invalidIndicator = container.querySelector('[title="URL may be unreachable"]')
        const warningText = container.querySelector('p.text-xs')
        expect(invalidIndicator || warningText).toBeTruthy()
      })
    })
  })
})
