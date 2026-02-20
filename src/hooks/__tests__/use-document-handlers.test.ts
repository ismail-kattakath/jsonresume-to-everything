import { renderHook, act } from '@testing-library/react'
import { useDocumentHandlers } from '@/hooks/use-document-handlers'
import { ChangeEvent } from 'react'

describe('useDocumentHandlers', () => {
  const mockSetResumeData = jest.fn()
  const mockResumeData: any = {
    name: 'Test Name',
    profilePicture: '',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('handleChange', () => {
    it('updates resume data correctly', () => {
      const { result } = renderHook(() => useDocumentHandlers(mockResumeData, mockSetResumeData))

      const event = {
        target: {
          name: 'name',
          value: 'New Name',
        },
      } as ChangeEvent<HTMLInputElement>

      act(() => {
        result.current.handleChange(event)
      })

      // Check if setResumeData was called with a function
      expect(mockSetResumeData).toHaveBeenCalled()
      const updater = mockSetResumeData.mock.calls[0][0]
      expect(updater(mockResumeData)).toEqual({
        ...mockResumeData,
        name: 'New Name',
      })
    })
  })

  describe('handleProfilePicture', () => {
    it('handles file upload correctly', async () => {
      const { result } = renderHook(() => useDocumentHandlers(mockResumeData, mockSetResumeData))

      const file = new Blob(['test-image'], { type: 'image/png' })
      const event = {
        target: {
          files: [file],
        },
      } as any

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onload: null as any,
        result: 'data:image/png;base64,test',
      }
      window.FileReader = jest.fn(() => mockFileReader) as any

      act(() => {
        result.current.handleProfilePicture(event)
      })

      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(file)

      // Simulate onload
      act(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload({ target: { result: 'data:image/png;base64,test' } } as any)
        }
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        profilePicture: 'data:image/png;base64,test',
      })
    })

    it('logs error for invalid file type', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useDocumentHandlers(mockResumeData, mockSetResumeData))

      const event = {
        target: {
          files: [null],
        },
      } as any

      act(() => {
        result.current.handleProfilePicture(event)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Invalid file type')
      expect(mockSetResumeData).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('handles missing files gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
      const { result } = renderHook(() => useDocumentHandlers(mockResumeData, mockSetResumeData))

      const event = {
        target: {
          files: null,
        },
      } as any

      act(() => {
        result.current.handleProfilePicture(event)
      })

      expect(consoleSpy).toHaveBeenCalledWith('Invalid file type')
      consoleSpy.mockRestore()
    })
  })
})
