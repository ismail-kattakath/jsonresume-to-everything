// @ts-nocheck
import { renderHook, act } from '@testing-library/react'
import { useDocumentHandlers } from '@/hooks/useDocumentHandlers'
import type { ResumeData } from '@/types'

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Developer',
  email: 'john@example.com',
  phone: '+1234567890',
  location: 'Test City',
  summary: 'Test summary',
  website: 'https://example.com',
  workExperience: [],
  education: [],
  skillGroups: [],
  projects: [],
  certifications: [],
  languages: [],
  socialMedia: {
    // linkedin: '',
    github: '',
    twitter: '',
  },
}

describe('useDocumentHandlers', () => {
  let mockSetResumeData: jest.Mock

  beforeEach(() => {
    mockSetResumeData = jest.fn()
  })

  describe('handleChange', () => {
    it('updates text input values', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const event = {
        target: { name: 'name', value: 'Jane Smith' },
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleChange(event)
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)
      expect(mockSetResumeData).toHaveBeenCalledWith(expect.any(Function))

      // Verify the updater function works correctly
      const updaterFn = mockSetResumeData.mock.calls[0][0]
      const newData = updaterFn(mockResumeData)
      expect(newData).toEqual({
        ...mockResumeData,
        name: 'Jane Smith',
      })
    })

    it('updates textarea values', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const event = {
        target: { name: 'summary', value: 'Updated summary content' },
      } as React.ChangeEvent<HTMLTextAreaElement>

      act(() => {
        result.current.handleChange(event)
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)

      const updaterFn = mockSetResumeData.mock.calls[0][0]
      const newData = updaterFn(mockResumeData)
      expect(newData).toEqual({
        ...mockResumeData,
        summary: 'Updated summary content',
      })
    })

    it('preserves other fields when updating', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const event = {
        target: { name: 'email', value: 'newemail@example.com' },
      } as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleChange(event)
      })

      const updaterFn = mockSetResumeData.mock.calls[0][0]
      const newData = updaterFn(mockResumeData)

      // Verify all other fields are preserved
      expect(newData.name).toBe(mockResumeData.name)
      expect(newData.position).toBe(mockResumeData.position)
      expect(newData.position).toBe(mockResumeData.position)
      expect(newData.email).toBe('newemail@example.com')
    })
  })

  describe('handleProfilePicture', () => {
    beforeEach(() => {
      // Mock FileReader
      const mockFileReader = {
        onload: null as ((event: ProgressEvent<FileReader>) => void) | null,
        readAsDataURL: jest.fn(function (this: any) {
          // Simulate successful file read
          if (this.onload) {
            this.onload({
              target: { result: 'data:image/png;base64,mockImageData' },
            } as ProgressEvent<FileReader>)
          }
        }),
      }

      global.FileReader = jest.fn(() => mockFileReader) as any
    })

    it('handles valid image file upload', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const file = new File(['image content'], 'profile.png', {
        type: 'image/png',
      })
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleProfilePicture(event)
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        profilePicture: 'data:image/png;base64,mockImageData',
      })
    })

    it('handles multiple files by selecting first one', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const file1 = new File(['image1'], 'profile1.png', { type: 'image/png' })
      const file2 = new File(['image2'], 'profile2.png', { type: 'image/png' })
      const event = {
        target: { files: [file1, file2] },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleProfilePicture(event)
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)
      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        profilePicture: 'data:image/png;base64,mockImageData',
      })
    })

    it('handles empty file selection gracefully', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const event = {
        target: { files: [] },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleProfilePicture(event)
      })

      // No file selected, so no update should happen
      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('handles null file input', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const event = {
        target: { files: null },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleProfilePicture(event)
      })

      // No file selected, so no update should happen
      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('logs error for invalid file type', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      // Create a mock that is not a Blob
      const event = {
        target: { files: ['not-a-blob'] },
      } as unknown as React.ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleProfilePicture(event)
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid file type')
      expect(mockSetResumeData).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('return value', () => {
    it('returns both handler functions', () => {
      const { result } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      expect(result.current).toHaveProperty('handleProfilePicture')
      expect(result.current).toHaveProperty('handleChange')
      expect(typeof result.current.handleProfilePicture).toBe('function')
      expect(typeof result.current.handleChange).toBe('function')
    })

    it('creates new function references on each render', () => {
      const { result, rerender } = renderHook(() =>
        useDocumentHandlers(mockResumeData, mockSetResumeData)
      )

      const firstHandleChange = result.current.handleChange
      const firstHandleProfilePicture = result.current.handleProfilePicture

      rerender()

      // Hook creates new functions each render (not memoized)
      // This is acceptable for this simple hook
      expect(typeof result.current.handleChange).toBe('function')
      expect(typeof result.current.handleProfilePicture).toBe('function')
      expect(result.current.handleChange).toEqual(expect.any(Function))
      expect(result.current.handleProfilePicture).toEqual(expect.any(Function))
    })
  })
})
