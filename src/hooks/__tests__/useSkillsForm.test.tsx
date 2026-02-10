import { renderHook, act } from '@testing-library/react'
import { useSkillsForm } from '@/hooks/useSkillsForm'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData, SkillGroup } from '@/types'
import { ReactNode } from 'react'

const mockResumeData: ResumeData = {
  name: 'Test User',
  position: 'Developer',
  contactInformation: '+123',
  email: 'test@example.com',
  address: '123 St',
  profilePicture: '',
  calendarLink: '',
  socialMedia: [],
  summary: 'Test summary',
  education: [],
  workExperience: [],
  skills: [
    {
      title: 'Programming',
      skills: [
        { text: 'JavaScript' },
        { text: 'TypeScript' },
        { text: 'Python' },
      ],
    },
    {
      title: 'Databases',
      skills: [{ text: 'PostgreSQL' }],
    },
  ],
  languages: [],
  certifications: [],
}

describe('useSkillsForm', () => {
  let setResumeData: jest.Mock

  const wrapper = ({ children }: { children: ReactNode }) => {
    setResumeData = jest.fn((updater) => {
      if (typeof updater === 'function') {
        return updater(mockResumeData)
      }
      return updater
    })

    return (
      <ResumeContext.Provider
        value={{
          resumeData: mockResumeData as any,
          setResumeData,
          handleProfilePicture: jest.fn(),
          handleChange: jest.fn(),
        }}
      >
        {children}
      </ResumeContext.Provider>
    )
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should throw error when skill type not found', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useSkillsForm('NonExistent'), {
        wrapper,
      })
    }).toThrow('Skill type "NonExistent" not found')

    consoleSpy.mockRestore()
  })

  it('should return skills for the specified title', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    expect(result.current.skills).toHaveLength(3)
    expect(result.current.skills[0]!.text).toBe('JavaScript')
    expect(result.current.skills[1]!.text).toBe('TypeScript')
    expect(result.current.skills[2]!.text).toBe('Python')
  })

  it('should handle text change for a skill', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.handleChange(0, 'JavaScript ES2024')
    })

    expect(setResumeData).toHaveBeenCalled()
    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const programmingSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Programming'
    )!
    expect(programmingSkills.skills[0]!.text).toBe('JavaScript ES2024')
  })

  it('should preserve other skill groups when changing text', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.handleChange(1, 'TypeScript 5.0')
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    expect(newData.skills).toHaveLength(2)
    const databaseSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Databases'
    )!
    expect(databaseSkills.skills[0]!.text).toBe('PostgreSQL')
  })

  it('should add new skill to the group with specified text', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.add('Rust')
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const programmingSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Programming'
    )!
    expect(programmingSkills.skills).toHaveLength(4)
    expect(programmingSkills.skills[3]).toEqual({ text: 'Rust' })
  })

  it('should not add skill if text is empty', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.add('')
    })

    expect(setResumeData).not.toHaveBeenCalled()
  })

  it('should not add skill if text is only whitespace', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.add('   ')
    })

    expect(setResumeData).not.toHaveBeenCalled()
  })

  it('should trim whitespace from skill text when adding', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.add('  Go  ')
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const programmingSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Programming'
    )!
    expect(programmingSkills.skills[3]).toEqual({ text: 'Go' })
  })

  it('should remove skill by index', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.remove(1)
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const programmingSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Programming'
    )!
    expect(programmingSkills.skills).toHaveLength(2)
    expect(programmingSkills.skills[0]!.text).toBe('JavaScript')
    expect(programmingSkills.skills[1]!.text).toBe('Python')
  })

  it('should remove last skill', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.remove(2)
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const programmingSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Programming'
    )!
    expect(programmingSkills.skills).toHaveLength(2)
    expect(programmingSkills.skills[0]!.text).toBe('JavaScript')
    expect(programmingSkills.skills[1]!.text).toBe('TypeScript')
  })

  it('should reorder skills via drag and drop', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.reorder(0, 2)
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const programmingSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Programming'
    )!
    expect(programmingSkills.skills[0]!.text).toBe('TypeScript')
    expect(programmingSkills.skills[1]!.text).toBe('Python')
    expect(programmingSkills.skills[2]!.text).toBe('JavaScript')
  })

  it('should reorder skills from end to beginning', () => {
    const { result } = renderHook(() => useSkillsForm('Programming'), {
      wrapper,
    })

    act(() => {
      result.current.reorder(2, 0)
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const programmingSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Programming'
    )!
    expect(programmingSkills.skills[0]!.text).toBe('Python')
    expect(programmingSkills.skills[1]!.text).toBe('JavaScript')
    expect(programmingSkills.skills[2]!.text).toBe('TypeScript')
  })

  it('should work with different skill group (Databases)', () => {
    const { result } = renderHook(() => useSkillsForm('Databases'), {
      wrapper,
    })

    expect(result.current.skills).toHaveLength(1)
    expect(result.current.skills[0]!.text).toBe('PostgreSQL')

    act(() => {
      result.current.add('MySQL')
    })

    const updater = setResumeData.mock.calls[0][0]
    const newData = updater(mockResumeData)

    const databaseSkills = newData.skills.find(
      (s: SkillGroup) => s.title === 'Databases'
    )!
    expect(databaseSkills.skills).toHaveLength(2)
    expect(databaseSkills.skills[1]!.text).toBe('MySQL')
  })
})
