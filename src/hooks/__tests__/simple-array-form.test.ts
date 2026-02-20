// @ts-nocheck
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useSimpleArrayForm } from '@/hooks/useSimpleArrayForm'
import { ResumeContext } from '@/lib/contexts/DocumentContext'

const makeCertification = (overrides = {}) => ({
  name: 'AWS Certified',
  date: '2022-01-01',
  issuer: 'Amazon',
  url: 'aws.amazon.com',
  ...overrides,
})

const makeResumeData = (overrides = {}) => ({
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
  languages: ['English', 'French'],
  certifications: [makeCertification(), makeCertification({ name: 'GCP Pro', issuer: 'Google' })],
  ...overrides,
})

const createWrapper = (resumeData, setResumeData) => {
  const Wrapper = ({ children }) =>
    React.createElement(ResumeContext.Provider, { value: { resumeData, setResumeData } }, children)
  return Wrapper
}

describe('useSimpleArrayForm - certifications', () => {
  it('returns certification names as the data array', () => {
    const data = makeResumeData()
    const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
      wrapper: createWrapper(data, jest.fn()),
    })
    expect(result.current.data).toEqual(['AWS Certified', 'GCP Pro'])
  })

  it('handles empty certifications array', () => {
    const data = makeResumeData({ certifications: [] })
    const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
      wrapper: createWrapper(data, jest.fn()),
    })
    expect(result.current.data).toEqual([])
  })

  it('handles undefined certifications (defaults to [])', () => {
    const data = makeResumeData({ certifications: undefined })
    const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
      wrapper: createWrapper(data, jest.fn()),
    })
    expect(result.current.data).toEqual([])
  })

  describe('handleChange (certifications)', () => {
    it('updates name field of a certification at the given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
        wrapper: createWrapper(data, setData),
      })
      act(() => result.current.handleChange(0, 'Azure Certified'))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.certifications[0].name).toBe('Azure Certified')
      // Other fields preserved
      expect(callArg.certifications[0].issuer).toBe('Amazon')
    })

    it('initializes a missing certification object when index has no existing entry', () => {
      // If index points to non-existing item, falls back to empty cert
      const data = makeResumeData({ certifications: [] })
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
        wrapper: createWrapper(data, setData),
      })
      act(() => result.current.handleChange(0, 'New Cert'))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.certifications[0].name).toBe('New Cert')
      expect(callArg.certifications[0].date).toBe('')
      expect(callArg.certifications[0].issuer).toBe('')
    })
  })

  describe('add (certifications)', () => {
    it('adds a new certification with default empty fields', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
        wrapper: createWrapper(data, setData),
      })
      act(() => result.current.add())
      const callArg = setData.mock.calls[0][0]
      expect(callArg.certifications).toHaveLength(3)
      expect(callArg.certifications[2].name).toBe('')
    })

    it('adds a certification with provided value', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
        wrapper: createWrapper(data, setData),
      })
      act(() => result.current.add('Azure'))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.certifications[2].name).toBe('Azure')
    })
  })

  describe('remove (certifications)', () => {
    it('removes a certification at given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
        wrapper: createWrapper(data, setData),
      })
      act(() => result.current.remove(0))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.certifications).toHaveLength(1)
      expect(callArg.certifications[0].name).toBe('GCP Pro')
    })
  })

  describe('reorder (certifications)', () => {
    it('reorders certifications by moving item from start to end index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
        wrapper: createWrapper(data, setData),
      })
      act(() => result.current.reorder(0, 1))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.certifications[0].name).toBe('GCP Pro')
      expect(callArg.certifications[1].name).toBe('AWS Certified')
    })

    it('handles splice returning undefined when reordering empty array', () => {
      const data = makeResumeData({ certifications: [] })
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('certifications'), {
        wrapper: createWrapper(data, setData),
      })
      act(() => result.current.reorder(5, 0))
      expect(setData).toHaveBeenCalled()
    })
  })
})

describe('useSimpleArrayForm - languages', () => {
  it('returns languages as the data array directly', () => {
    const data = makeResumeData()
    const { result } = renderHook(() => useSimpleArrayForm('languages'), { wrapper: createWrapper(data, jest.fn()) })
    expect(result.current.data).toEqual(['English', 'French'])
  })

  it('handles empty languages array', () => {
    const data = makeResumeData({ languages: [] })
    const { result } = renderHook(() => useSimpleArrayForm('languages'), { wrapper: createWrapper(data, jest.fn()) })
    expect(result.current.data).toEqual([])
  })

  describe('handleChange (languages)', () => {
    it('updates a language string at given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('languages'), { wrapper: createWrapper(data, setData) })
      act(() => result.current.handleChange(0, 'Spanish'))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.languages[0]).toBe('Spanish')
    })
  })

  describe('add (languages)', () => {
    it('adds empty string when no value provided', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('languages'), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add())
      const callArg = setData.mock.calls[0][0]
      expect(callArg.languages).toHaveLength(3)
      expect(callArg.languages[2]).toBe('')
    })

    it('adds a language with provided value', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('languages'), { wrapper: createWrapper(data, setData) })
      act(() => result.current.add('German'))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.languages[2]).toBe('German')
    })
  })

  describe('remove (languages)', () => {
    it('removes a language at given index', () => {
      const data = makeResumeData()
      const setData = jest.fn()
      const { result } = renderHook(() => useSimpleArrayForm('languages'), { wrapper: createWrapper(data, setData) })
      act(() => result.current.remove(0))
      const callArg = setData.mock.calls[0][0]
      expect(callArg.languages).toHaveLength(1)
      expect(callArg.languages[0]).toBe('French')
    })
  })
})
