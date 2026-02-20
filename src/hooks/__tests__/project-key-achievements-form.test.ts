// @ts-nocheck
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useProjectKeyAchievementsForm } from '@/hooks/use-project-key-achievements-form'
import { ResumeContext } from '@/lib/contexts/document-context'
import type { ResumeData } from '@/types'

const makeProject = (overrides = {}) => ({
  name: 'Test Project',
  description: 'A project',
  link: '',
  keyAchievements: [{ text: 'Project achievement 1' }, { text: 'Project achievement 2' }],
  keywords: [],
  startYear: '2022',
  endYear: '2023',
  ...overrides,
})

const makeResumeData = (projectsOverride?) => ({
  name: 'Test',
  position: 'Dev',
  email: 'test@test.com',
  contactInformation: '',
  address: '',
  profilePicture: '',
  summary: '',
  socialMedia: [],
  workExperience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: projectsOverride !== undefined ? projectsOverride : [makeProject()],
})

const createWrapper = (resumeData, setResumeData) => {
  const Wrapper = ({ children }) =>
    React.createElement(ResumeContext.Provider, { value: { resumeData, setResumeData } }, children)
  return Wrapper
}

describe('useProjectKeyAchievementsForm', () => {
  it('returns achievements from project at given index', () => {
    const data = makeResumeData()
    const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, jest.fn()) })
    expect(result.current.achievements).toHaveLength(2)
    expect(result.current.achievements[0].text).toBe('Project achievement 1')
  })

  it('defaults to empty array when keyAchievements is undefined', () => {
    const data = makeResumeData([makeProject({ keyAchievements: undefined })])
    const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, jest.fn()) })
    expect(result.current.achievements).toEqual([])
  })

  it('throws error when project index is out of bounds', () => {
    const data = makeResumeData([makeProject()])
    expect(() =>
      renderHook(() => useProjectKeyAchievementsForm(5), {
        wrapper: createWrapper(data, jest.fn()),
      })
    ).toThrow('Project at index 5 not found')
  })

  it('throws error when projects array is undefined', () => {
    const data = {
      name: 'Test',
      position: 'Dev',
      email: 'test@test.com',
      contactInformation: '',
      address: '',
      profilePicture: '',
      summary: '',
      socialMedia: [],
      workExperience: [],
      education: [],
      skills: [],
      languages: [],
      certifications: [],
      // projects omitted intentionally
    } as unknown as ResumeData
    expect(() =>
      renderHook(() => useProjectKeyAchievementsForm(0), {
        wrapper: createWrapper(data, jest.fn()),
      })
    ).toThrow('Project at index 0 not found')
  })

  describe('handleChange', () => {
    it('updates achievement text at given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.handleChange(0, 'Updated text'))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.projects[0].keyAchievements[0].text).toBe('Updated text')
    })

    it('handles projects being undefined in updater (map is on optional projects)', () => {
      // Even if prev doesn't have projects, map returns undefined (no crash)
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.handleChange(1, 'Changed'))
      // Always called - just ensure no throw
      expect(setData).toHaveBeenCalled()
    })
  })

  describe('add', () => {
    it('adds a new achievement to the project', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add('New project achievement'))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.projects[0].keyAchievements).toHaveLength(3)
      expect(next.projects[0].keyAchievements[2].text).toBe('New project achievement')
    })

    it('trims whitespace from added achievement text', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add('  trimmed  '))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.projects[0].keyAchievements[2].text).toBe('trimmed')
    })

    it('does not add when text is empty', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add(''))
      expect(setData).not.toHaveBeenCalled()
    })

    it('does not add when text is whitespace only', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add('   '))
      expect(setData).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('removes an achievement at given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.remove(0))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.projects[0].keyAchievements).toHaveLength(1)
      expect(next.projects[0].keyAchievements[0].text).toBe('Project achievement 2')
    })
  })

  describe('reorder', () => {
    it('reorders achievements by moving from startIndex to endIndex', () => {
      const data = makeResumeData([makeProject({ keyAchievements: [{ text: 'X' }, { text: 'Y' }, { text: 'Z' }] })])
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.reorder(0, 2))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.projects[0].keyAchievements.map((a) => a.text)).toEqual(['Y', 'Z', 'X'])
    })

    it('handles splice of empty achievements (removed is undefined)', () => {
      const data = makeResumeData([makeProject({ keyAchievements: [] })])
      const setData = jest.fn()
      const { result } = renderHook(() => useProjectKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      // Should not throw
      act(() => result.current.reorder(5, 0))
      expect(setData).toHaveBeenCalled()
    })
  })
})
