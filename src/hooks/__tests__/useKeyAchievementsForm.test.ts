import { renderHook, act } from '@testing-library/react'
import { useKeyAchievementsForm } from '../useKeyAchievementsForm'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types'
import React from 'react'

const mockResumeData: ResumeData = {
  name: 'Test User',
  label: 'Developer',
  email: 'test@example.com',
  summary: 'Test summary',
  location: { city: 'Test City', countryCode: 'US' },
  profiles: [],
  workExperience: [
    {
      organization: 'Test Company',
      position: 'Developer',
      startDate: '2020-01-01',
      endDate: '',
      summary: 'Test role',
      keyAchievements: [
        { text: 'Achievement 1' },
        { text: 'Achievement 2' },
        { text: 'Achievement 3' },
      ],
      technologies: [],
    },
    {
      organization: 'Another Company',
      position: 'Engineer',
      startDate: '2018-01-01',
      endDate: '2019-12-31',
      summary: 'Previous role',
      keyAchievements: [{ text: 'Previous achievement' }],
      technologies: [],
    },
  ],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: [],
}

describe('useKeyAchievementsForm', () => {
  let mockSetResumeData: jest.Mock

  const createWrapper = (resumeData: ResumeData) => {
    mockSetResumeData = jest.fn()

    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        ResumeContext.Provider,
        { value: { resumeData, setResumeData: mockSetResumeData } },
        children
      )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Initialization', () => {
    it('returns achievements for the specified work experience index', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      expect(result.current.achievements).toEqual([
        { text: 'Achievement 1' },
        { text: 'Achievement 2' },
        { text: 'Achievement 3' },
      ])
    })

    it('returns achievements for different work experience indices', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(1), {
        wrapper: createWrapper(mockResumeData),
      })

      expect(result.current.achievements).toEqual([
        { text: 'Previous achievement' },
      ])
    })

    it('throws error if work experience index does not exist', () => {
      // Suppress console.error for this test since we expect an error
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useKeyAchievementsForm(999), {
          wrapper: createWrapper(mockResumeData),
        })
      }).toThrow('Work experience at index 999 not found')

      consoleSpy.mockRestore()
    })
  })

  describe('handleChange', () => {
    it('updates achievement text at specified index', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.handleChange(1, 'Updated Achievement 2')
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)
      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements[1].text).toBe(
        'Updated Achievement 2'
      )
    })

    it('preserves other achievements when updating one', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.handleChange(0, 'New text')
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toHaveLength(3)
      expect(newData.workExperience[0].keyAchievements[1].text).toBe(
        'Achievement 2'
      )
      expect(newData.workExperience[0].keyAchievements[2].text).toBe(
        'Achievement 3'
      )
    })

    it('does not modify other work experiences', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.handleChange(0, 'Changed')
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[1].keyAchievements).toEqual([
        { text: 'Previous achievement' },
      ])
    })
  })

  describe('add', () => {
    it('adds new achievement with provided text', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.add('New Achievement')
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)
      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toHaveLength(4)
      expect(newData.workExperience[0].keyAchievements[3]).toEqual({
        text: 'New Achievement',
      })
    })

    it('trims whitespace from added achievement text', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.add('  Spaced Text  ')
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements[3].text).toBe(
        'Spaced Text'
      )
    })

    it('does not add achievement if text is empty', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.add('')
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('does not add achievement if text is only whitespace', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.add('   ')
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('preserves existing achievements when adding new one', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.add('Fourth Achievement')
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements[0].text).toBe(
        'Achievement 1'
      )
      expect(newData.workExperience[0].keyAchievements[1].text).toBe(
        'Achievement 2'
      )
      expect(newData.workExperience[0].keyAchievements[2].text).toBe(
        'Achievement 3'
      )
    })
  })

  describe('remove', () => {
    it('removes achievement at specified index', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.remove(1)
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)
      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toHaveLength(2)
      expect(newData.workExperience[0].keyAchievements).toEqual([
        { text: 'Achievement 1' },
        { text: 'Achievement 3' },
      ])
    })

    it('removes first achievement', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.remove(0)
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toEqual([
        { text: 'Achievement 2' },
        { text: 'Achievement 3' },
      ])
    })

    it('removes last achievement', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.remove(2)
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toEqual([
        { text: 'Achievement 1' },
        { text: 'Achievement 2' },
      ])
    })

    it('does not modify other work experiences', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.remove(0)
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[1].keyAchievements).toEqual([
        { text: 'Previous achievement' },
      ])
    })
  })

  describe('reorder', () => {
    it('reorders achievements from start to end', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.reorder(0, 2)
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)
      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toEqual([
        { text: 'Achievement 2' },
        { text: 'Achievement 3' },
        { text: 'Achievement 1' },
      ])
    })

    it('reorders achievements from end to start', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.reorder(2, 0)
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toEqual([
        { text: 'Achievement 3' },
        { text: 'Achievement 1' },
        { text: 'Achievement 2' },
      ])
    })

    it('reorders achievements by one position', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.reorder(1, 2)
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toEqual([
        { text: 'Achievement 1' },
        { text: 'Achievement 3' },
        { text: 'Achievement 2' },
      ])
    })

    it('does not modify other work experiences', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.reorder(0, 1)
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[1].keyAchievements).toEqual([
        { text: 'Previous achievement' },
      ])
    })

    it('handles reordering to the same position', () => {
      const { result } = renderHook(() => useKeyAchievementsForm(0), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.reorder(1, 1)
      })

      const updateFn = mockSetResumeData.mock.calls[0][0]
      const newData = updateFn(mockResumeData)

      expect(newData.workExperience[0].keyAchievements).toEqual([
        { text: 'Achievement 1' },
        { text: 'Achievement 2' },
        { text: 'Achievement 3' },
      ])
    })
  })
})
