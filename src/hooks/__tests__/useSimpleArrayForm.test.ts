import { renderHook, act } from '@testing-library/react'
import { useSimpleArrayForm } from '../useSimpleArrayForm'
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
  workExperience: [],
  education: [],
  skills: [],
  projects: [],
  languages: ['English', 'Spanish', 'French'],
  certifications: ['AWS Certified', 'Google Cloud Certified'],
}

describe('useSimpleArrayForm', () => {
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

  describe('Languages data key', () => {
    it('returns languages data', () => {
      const { result } = renderHook(() => useSimpleArrayForm('languages'), {
        wrapper: createWrapper(mockResumeData),
      })

      expect(result.current.data).toEqual(['English', 'Spanish', 'French'])
    })

    it('updates language at specified index', () => {
      const { result } = renderHook(() => useSimpleArrayForm('languages'), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.handleChange(1, 'German')
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        languages: ['English', 'German', 'French'],
      })
    })

    it('adds new language with value', () => {
      const { result } = renderHook(() => useSimpleArrayForm('languages'), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.add('Italian')
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        languages: ['English', 'Spanish', 'French', 'Italian'],
      })
    })

    it('adds new language with empty string by default', () => {
      const { result } = renderHook(() => useSimpleArrayForm('languages'), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.add()
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        languages: ['English', 'Spanish', 'French', ''],
      })
    })

    it('removes language at specified index', () => {
      const { result } = renderHook(() => useSimpleArrayForm('languages'), {
        wrapper: createWrapper(mockResumeData),
      })

      act(() => {
        result.current.remove(1)
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        languages: ['English', 'French'],
      })
    })
  })

  describe('Certifications data key', () => {
    it('returns certifications data', () => {
      const { result } = renderHook(
        () => useSimpleArrayForm('certifications'),
        { wrapper: createWrapper(mockResumeData) }
      )

      expect(result.current.data).toEqual([
        'AWS Certified',
        'Google Cloud Certified',
      ])
    })

    it('updates certification at specified index', () => {
      const { result } = renderHook(
        () => useSimpleArrayForm('certifications'),
        { wrapper: createWrapper(mockResumeData) }
      )

      act(() => {
        result.current.handleChange(0, 'Azure Certified')
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        certifications: ['Azure Certified', 'Google Cloud Certified'],
      })
    })

    it('adds new certification with value', () => {
      const { result } = renderHook(
        () => useSimpleArrayForm('certifications'),
        { wrapper: createWrapper(mockResumeData) }
      )

      act(() => {
        result.current.add('Kubernetes Certified')
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        certifications: [
          'AWS Certified',
          'Google Cloud Certified',
          'Kubernetes Certified',
        ],
      })
    })

    it('adds new certification with empty string by default', () => {
      const { result } = renderHook(
        () => useSimpleArrayForm('certifications'),
        { wrapper: createWrapper(mockResumeData) }
      )

      act(() => {
        result.current.add()
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        certifications: ['AWS Certified', 'Google Cloud Certified', ''],
      })
    })

    it('removes certification at specified index', () => {
      const { result } = renderHook(
        () => useSimpleArrayForm('certifications'),
        { wrapper: createWrapper(mockResumeData) }
      )

      act(() => {
        result.current.remove(0)
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        certifications: ['Google Cloud Certified'],
      })
    })
  })

  describe('Edge cases', () => {
    it('handles empty arrays', () => {
      const emptyData = {
        ...mockResumeData,
        languages: [],
      }

      const { result } = renderHook(() => useSimpleArrayForm('languages'), {
        wrapper: createWrapper(emptyData),
      })

      expect(result.current.data).toEqual([])

      act(() => {
        result.current.add('First Language')
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...emptyData,
        languages: ['First Language'],
      })
    })

    it('handles removal of last item', () => {
      const singleItemData = {
        ...mockResumeData,
        certifications: ['Only Cert'],
      }

      const { result } = renderHook(
        () => useSimpleArrayForm('certifications'),
        { wrapper: createWrapper(singleItemData) }
      )

      act(() => {
        result.current.remove(0)
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...singleItemData,
        certifications: [],
      })
    })
  })
})
