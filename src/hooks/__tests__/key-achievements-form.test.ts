// @ts-nocheck
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useKeyAchievementsForm } from '@/hooks/use-key-achievements-form'
import { ResumeContext } from '@/lib/contexts/document-context'

const makeWorkExperience = (overrides = {}) => ({
  organization: 'Acme',
  position: 'Engineer',
  url: '',
  description: 'Built things',
  startYear: '2020',
  endYear: 'Present',
  keyAchievements: [{ text: 'Achievement 1' }, { text: 'Achievement 2' }],
  technologies: [],
  showTechnologies: true,
  ...overrides,
})

const makeResumeData = (workOverrides = []) => ({
  name: 'Test',
  position: 'Dev',
  email: 'test@test.com',
  contactInformation: '',
  address: '',
  profilePicture: '',
  summary: '',
  socialMedia: [],
  workExperience: workOverrides.length > 0 ? workOverrides : [makeWorkExperience()],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
})

const createWrapper = (resumeData, setResumeData) => {
  const Wrapper = ({ children }) =>
    React.createElement(ResumeContext.Provider, { value: { resumeData, setResumeData } }, children)
  return Wrapper
}

describe('useKeyAchievementsForm', () => {
  it('returns achievements from work experience at given index', () => {
    const data = makeResumeData()
    const setData = jest.fn()
    const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
    expect(result.current.achievements).toEqual([{ text: 'Achievement 1' }, { text: 'Achievement 2' }])
  })

  it('throws error when work experience index is out of bounds', () => {
    const data = makeResumeData()
    const setData = jest.fn()
    expect(() =>
      renderHook(() => useKeyAchievementsForm(5), {
        wrapper: createWrapper(data, setData),
      })
    ).toThrow('Work experience at index 5 not found')
  })

  describe('handleChange', () => {
    it('updates text of an achievement at given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.handleChange(0, 'New achievement text'))
      expect(setData).toHaveBeenCalledWith(expect.any(Function))
      // Verify the updater function produces correct output
      const updater = setData.mock.calls[0][0]
      const next = updater(makeResumeData())
      expect(next.workExperience[0].keyAchievements[0].text).toBe('New achievement text')
    })

    it('does nothing when achievement index is out of bounds (currentAchievement undefined)', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      // Index 99 does not exist
      act(() => result.current.handleChange(99, 'wont happen'))
      // setData is still called (the map runs regardless)
      expect(setData).toHaveBeenCalled()
    })
  })

  describe('add', () => {
    it('adds a new achievement', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add('New achievement'))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.workExperience[0].keyAchievements).toHaveLength(3)
      expect(next.workExperience[0].keyAchievements[2].text).toBe('New achievement')
    })

    it('trims text before adding', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add('  trimmed  '))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.workExperience[0].keyAchievements[2].text).toBe('trimmed')
    })

    it('does not add when text is empty string', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add(''))
      expect(setData).not.toHaveBeenCalled()
    })

    it('does not add when text is whitespace only', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add('   '))
      expect(setData).not.toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('removes an achievement at given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.remove(0))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.workExperience[0].keyAchievements).toHaveLength(1)
      expect(next.workExperience[0].keyAchievements[0].text).toBe('Achievement 2')
    })
  })

  describe('reorder', () => {
    it('reorders achievements by moving item from start to end index', () => {
      const data = makeResumeData([
        makeWorkExperience({
          keyAchievements: [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
        }),
      ])
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      act(() => result.current.reorder(0, 2))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.workExperience[0].keyAchievements.map((a) => a.text)).toEqual(['B', 'C', 'A'])
    })

    it('handles splice returning undefined for removed item gracefully', () => {
      // Edge: empty keyAchievements (reorder would produce no-op)
      const data = makeResumeData([makeWorkExperience({ keyAchievements: [] })])
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      // Should not throw even with out-of-bounds reorder
      act(() => result.current.reorder(5, 0))
      expect(setData).toHaveBeenCalled()
    })
  })

  describe('setAchievements', () => {
    it('replaces all achievements directly', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useKeyAchievementsForm(0), { wrapper: createWrapper(data, setData) })
      const newAchievements = [{ text: 'Replaced' }]
      act(() => result.current.setAchievements(newAchievements))
      const updater = setData.mock.calls[0][0]
      const next = updater(data)
      expect(next.workExperience[0].keyAchievements).toEqual(newAchievements)
    })
  })
})
