import { renderHook, act } from '@testing-library/react'
import { useArrayForm } from '../useArrayForm'
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
      url: 'https://example.com',
      position: 'Developer',
      description: 'Test',
      keyAchievements: [],
      startYear: '2020',
      endYear: 'Present',
      technologies: [],
    },
  ],
  education: [],
  skills: [],
  projects: [],
  languages: [],
  certifications: [],
}

describe('useArrayForm', () => {
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

  describe('transformValue option', () => {
    it('applies custom transformValue function when provided', () => {
      const transformValue = jest.fn((fieldName, value) => {
        if (fieldName === 'company') {
          return value.toUpperCase()
        }
        return value
      })

      const { result } = renderHook(
        () =>
          useArrayForm(
            'workExperience',
            {
              organization: '',
              url: '',
              position: '',
              description: '',
              keyAchievements: [],
              startYear: '',
              endYear: '',
              technologies: [],
            },
            { transformValue }
          ),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.handleChange(
          {
            target: { name: 'company', value: 'test company' },
          } as React.ChangeEvent<HTMLInputElement>,
          0
        )
      })

      expect(transformValue).toHaveBeenCalledWith(
        'company',
        'test company',
        mockResumeData.workExperience[0],
        0
      )
      expect(mockSetResumeData).toHaveBeenCalled()

      const newData = mockSetResumeData.mock.calls[0][0]
      expect(newData.workExperience[0].organization).toBe('TEST COMPANY')
    })

    it('chains transformValue with URL sanitization', () => {
      const transformValue = jest.fn((fieldName, value) => {
        // Add prefix after URL sanitization
        return `sanitized_${value}`
      })

      const { result } = renderHook(
        () =>
          useArrayForm(
            'workExperience',
            {
              organization: '',
              url: '',
              position: '',
              description: '',
              keyAchievements: [],
              startYear: '',
              endYear: '',
              technologies: [],
            },
            { urlFields: ['url'], transformValue }
          ),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.handleChange(
          {
            target: { name: 'url', value: 'https://example.com' },
          } as React.ChangeEvent<HTMLInputElement>,
          0
        )
      })

      // transformValue should receive the URL-sanitized value (without https://)
      expect(transformValue).toHaveBeenCalledWith(
        'url',
        'example.com', // After URL sanitization
        mockResumeData.workExperience[0],
        0
      )

      const newData = mockSetResumeData.mock.calls[0][0]
      expect(newData.workExperience[0].url).toBe('sanitized_example.com')
    })
  })

  describe('updateField', () => {
    it('updates a specific field in an array item', () => {
      const { result } = renderHook(
        () =>
          useArrayForm('workExperience', {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
            technologies: [],
          }),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.updateField(0, 'company', 'New Company Name')
      })

      expect(mockSetResumeData).toHaveBeenCalledTimes(1)
      const newData = mockSetResumeData.mock.calls[0][0]

      expect(newData.workExperience[0].organization).toBe('New Company Name')
    })

    it('preserves other fields when using updateField', () => {
      const { result } = renderHook(
        () =>
          useArrayForm('workExperience', {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
            technologies: [],
          }),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.updateField(0, 'position', 'Senior Developer')
      })

      const newData = mockSetResumeData.mock.calls[0][0]

      expect(newData.workExperience[0].position).toBe('Senior Developer')
      // Other fields should remain unchanged
      expect(newData.workExperience[0].organization).toBe('Test Company')
      expect(newData.workExperience[0].startYear).toBe('2020')
    })

    it('updates complex field types with updateField', () => {
      const { result } = renderHook(
        () =>
          useArrayForm('workExperience', {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
            technologies: [],
          }),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.updateField(0, 'technologies', ['React', 'TypeScript'])
      })

      const newData = mockSetResumeData.mock.calls[0][0]

      expect(newData.workExperience[0].technologies).toEqual([
        'React',
        'TypeScript',
      ])
    })
  })

  describe('basic CRUD operations', () => {
    it('returns data from specified key', () => {
      const { result } = renderHook(
        () =>
          useArrayForm('workExperience', {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
            technologies: [],
          }),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      expect(result.current.data).toEqual(mockResumeData.workExperience)
    })

    it('handles change for input fields', () => {
      const { result } = renderHook(
        () =>
          useArrayForm('workExperience', {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
            technologies: [],
          }),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.handleChange(
          {
            target: { name: 'company', value: 'Updated Company' },
          } as React.ChangeEvent<HTMLInputElement>,
          0
        )
      })

      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          workExperience: expect.arrayContaining([
            expect.objectContaining({
              organization: 'Updated Company',
            }),
          ]),
        })
      )
    })

    it('adds new item to array', () => {
      const { result } = renderHook(
        () =>
          useArrayForm('workExperience', {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
            technologies: [],
          }),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.add()
      })

      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          workExperience: expect.arrayContaining([
            expect.any(Object),
            expect.any(Object),
          ]),
        })
      )

      const newData = mockSetResumeData.mock.calls[0][0]
      expect(newData.workExperience).toHaveLength(2)
    })

    it('removes item from array', () => {
      const { result } = renderHook(
        () =>
          useArrayForm('workExperience', {
            organization: '',
            url: '',
            position: '',
            description: '',
            keyAchievements: [],
            startYear: '',
            endYear: '',
            technologies: [],
          }),
        {
          wrapper: createWrapper(mockResumeData),
        }
      )

      act(() => {
        result.current.remove(0)
      })

      const newData = mockSetResumeData.mock.calls[0][0]
      expect(newData.workExperience).toHaveLength(0)
    })
  })
})
