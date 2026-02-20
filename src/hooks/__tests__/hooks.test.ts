// @ts-nocheck
import { renderHook, act } from '@testing-library/react'
import { useUnifiedData } from '@/hooks/use-unified-data'

// Mock the modules that read from the file system
jest.mock('@/lib/resume-adapter', () => ({
  __esModule: true,
  default: {
    name: 'Default User',
    position: 'Developer',
    email: 'default@example.com',
    summary: 'Default summary',
    profiles: [],
    workExperience: [],
    education: [],
    skills: [
      {
        title: 'Frontend',
        skills: [{ text: 'React', highlight: true }],
      },
    ],
    projects: [{ name: 'Default Project', description: '' }],
    languages: [],
    certifications: [],
    socialMedia: [],
    contactInformation: '',
    address: '',
    profileImage: '',
  },
}))

jest.mock('@/data/cover-letter', () => ({
  DEFAULT_COVER_LETTER_CONTENT: 'Default cover letter content',
}))

const mockDefaultResumeData = {
  name: 'Default User',
  position: 'Developer',
  email: 'default@example.com',
  summary: 'Default summary',
  profiles: [],
  workExperience: [],
  education: [],
  skills: [
    {
      title: 'Frontend',
      skills: [{ text: 'React', highlight: true }],
    },
  ],
  projects: [{ name: 'Default Project', description: '' }],
  languages: [],
  certifications: [],
  socialMedia: [],
  contactInformation: '',
  address: '',
  profileImage: '',
}

describe('useUnifiedData', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should initialize with default resume and cover letter data', () => {
    const { result } = renderHook(() => useUnifiedData())
    expect(result.current.resumeData.name).toBe('Default User')
    expect(result.current.coverLetterData.content).toBe('Default cover letter content')
  })

  it('should load saved resume data from localStorage on mount', () => {
    const savedResume = {
      ...mockDefaultResumeData,
      name: 'Saved User',
      projects: [{ name: 'Saved Project', description: '' }],
    }
    localStorage.setItem('resumeData', JSON.stringify(savedResume))

    const { result } = renderHook(() => useUnifiedData())

    expect(result.current.resumeData.name).toBe('Saved User')
    expect(result.current.resumeData.projects[0].name).toBe('Saved Project')
  })

  it('should add default projects when saved resume has no projects', () => {
    const savedResumeWithoutProjects = {
      ...mockDefaultResumeData,
      name: 'No Projects User',
      projects: undefined,
    }
    localStorage.setItem('resumeData', JSON.stringify(savedResumeWithoutProjects))

    const { result } = renderHook(() => useUnifiedData())

    // Should have injected default projects
    expect(result.current.resumeData.projects).toBeDefined()
    expect(result.current.resumeData.projects.length).toBeGreaterThan(0)
  })

  it('should handle corrupted resume localStorage gracefully (JSON parse error)', () => {
    localStorage.setItem('resumeData', 'NOT_VALID_JSON')
    // Should not throw, should use default data
    const { result } = renderHook(() => useUnifiedData())
    expect(result.current.resumeData.name).toBe('Default User')
  })

  it('should migrate skills when they are stored as plain strings', () => {
    const savedResumeWithStringSkills = {
      ...mockDefaultResumeData,
      name: 'Legacy User',
      skills: [
        {
          title: 'Languages',
          // Old format: string array
          skills: ['JavaScript', 'TypeScript'],
        },
      ],
    }
    localStorage.setItem('resumeData', JSON.stringify(savedResumeWithStringSkills))

    const { result } = renderHook(() => useUnifiedData())

    // Should have migrated to object format
    const skill = result.current.resumeData.skills[0].skills[0]
    expect(typeof skill).toBe('object')
    expect(skill.text).toBe('JavaScript')
    expect(skill.highlight).toBe(false)
  })

  it('should migrate skills with legacy "underline" property to "highlight"', () => {
    const savedResumeWithUnderlineSkills = {
      ...mockDefaultResumeData,
      name: 'Underline User',
      skills: [
        {
          title: 'Languages',
          skills: [
            { text: 'Go', underline: true }, // legacy format — no highlight
          ],
        },
      ],
    }
    localStorage.setItem('resumeData', JSON.stringify(savedResumeWithUnderlineSkills))

    const { result } = renderHook(() => useUnifiedData())

    const skill = result.current.resumeData.skills[0].skills[0]
    expect(skill.text).toBe('Go')
    expect(skill.highlight).toBe(true) // migrated from underline
  })

  it('should not migrate skills that already have the correct format', () => {
    // skills already have highlight property — no migration needed
    const savedResume = {
      ...mockDefaultResumeData,
      name: 'Modern User',
      skills: [
        {
          title: 'Languages',
          skills: [{ text: 'Python', highlight: false }],
        },
      ],
    }
    localStorage.setItem('resumeData', JSON.stringify(savedResume))

    const { result } = renderHook(() => useUnifiedData())

    const skill = result.current.resumeData.skills[0].skills[0]
    expect(skill.text).toBe('Python')
    expect(skill.highlight).toBe(false)
  })

  it('should load saved cover letter data from localStorage', () => {
    const savedCL = {
      ...mockDefaultResumeData,
      content: 'Custom cover letter content',
    }
    localStorage.setItem('coverLetterData', JSON.stringify(savedCL))

    const { result } = renderHook(() => useUnifiedData())

    expect(result.current.coverLetterData.content).toBe('Custom cover letter content')
  })

  it('should use default cover letter content when saved content is empty', () => {
    const savedCL = {
      ...mockDefaultResumeData,
      content: '   ', // whitespace only — should use default
    }
    localStorage.setItem('coverLetterData', JSON.stringify(savedCL))

    const { result } = renderHook(() => useUnifiedData())

    expect(result.current.coverLetterData.content).toBe('Default cover letter content')
  })

  it('should handle corrupted cover letter localStorage gracefully', () => {
    localStorage.setItem('coverLetterData', '{invalid json}')
    const { result } = renderHook(() => useUnifiedData())
    // Should fall back to defaults without throwing
    expect(result.current.coverLetterData.content).toBe('Default cover letter content')
  })

  it('should save resume data to localStorage when it changes', () => {
    const { result } = renderHook(() => useUnifiedData())

    act(() => {
      result.current.setResumeData({
        ...mockDefaultResumeData,
        name: 'Updated Name',
      })
    })

    const saved = JSON.parse(localStorage.getItem('resumeData') || '{}')
    expect(saved.name).toBe('Updated Name')
  })

  it('should sync shared fields from resume to cover letter when resume changes', async () => {
    const { result } = renderHook(() => useUnifiedData())

    act(() => {
      result.current.setResumeData(
        (
          prev: Parameters<typeof result.current.setResumeData>[0] extends (value: infer P) => unknown ? P : unknown
        ) => ({
          ...prev,
          name: 'Synced Name',
        })
      )
    })

    // After state update, cover letter should reflect the new name
    expect(result.current.coverLetterData.name).toBe('Synced Name')
  })

  it('should sync shared fields from cover letter to resume when cover letter changes', () => {
    const { result } = renderHook(() => useUnifiedData())

    act(() => {
      result.current.setCoverLetterData(
        (
          prev: Parameters<typeof result.current.setCoverLetterData>[0] extends (value: infer P) => unknown
            ? P
            : unknown
        ) => ({
          ...prev,
          email: 'newemail@test.com',
        })
      )
    })

    expect(result.current.resumeData.email).toBe('newemail@test.com')
  })

  it('should expose setResumeData and setCoverLetterData', () => {
    const { result } = renderHook(() => useUnifiedData())
    expect(typeof result.current.setResumeData).toBe('function')
    expect(typeof result.current.setCoverLetterData).toBe('function')
  })
})
