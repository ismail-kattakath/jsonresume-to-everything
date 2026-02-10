import { renderHook, act } from '@testing-library/react'
import { useSkillGroupsManagement } from '@/hooks/useSkillGroupsManagement'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types'
import { ReactNode } from 'react'
import { toast } from 'sonner'

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

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
      skills: [{ text: 'JavaScript' }, { text: 'TypeScript' }],
    },
    {
      title: 'Databases',
      skills: [{ text: 'PostgreSQL' }],
    },
    {
      title: 'DevOps',
      skills: [{ text: 'Docker' }, { text: 'Kubernetes' }],
    },
  ],
  languages: [],
  certifications: [],
}

describe('useSkillGroupsManagement', () => {
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

  describe('addGroup', () => {
    it('should add a new skill group successfully', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.addGroup('Cloud Services')
      })

      expect(setResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: expect.arrayContaining([
            expect.objectContaining({
              title: 'Cloud Services',
              skills: [],
            }),
          ]),
        })
      )
      expect(toast.success).toHaveBeenCalledWith(
        'Added skill group: Cloud Services'
      )
    })

    it('should trim whitespace from skill group title', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.addGroup('  Security  ')
      })

      expect(setResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: expect.arrayContaining([
            expect.objectContaining({
              title: 'Security',
              skills: [],
            }),
          ]),
        })
      )
    })

    it('should not add skill group with empty title', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.addGroup('')
      })

      expect(setResumeData).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Skill group name cannot be empty'
      )
    })

    it('should not add skill group with only whitespace', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.addGroup('   ')
      })

      expect(setResumeData).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Skill group name cannot be empty'
      )
    })

    it('should not add duplicate skill group (case-insensitive)', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.addGroup('programming')
      })

      expect(setResumeData).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Skill group "programming" already exists'
      )
    })

    it('should not add duplicate skill group with different case', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.addGroup('DATABASES')
      })

      expect(setResumeData).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Skill group "DATABASES" already exists'
      )
    })
  })

  describe('removeGroup', () => {
    it('should remove an existing skill group', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.removeGroup('Databases')
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(updatedSkills).toHaveLength(2)
      expect(updatedSkills.find((g: any) => g.title === 'Databases')).toBe(
        undefined
      )
      expect(toast.success).toHaveBeenCalledWith(
        'Removed skill group: Databases'
      )
    })

    it('should handle removing non-existent skill group', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.removeGroup('NonExistent')
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(updatedSkills).toHaveLength(3)
      expect(toast.success).toHaveBeenCalledWith(
        'Removed skill group: NonExistent'
      )
    })
  })

  describe('renameGroup', () => {
    it('should rename an existing skill group', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.renameGroup('Programming', 'Software Development')
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(
        updatedSkills.find((g: any) => g.title === 'Software Development')
      ).toBeDefined()
      expect(
        updatedSkills.find((g: any) => g.title === 'Programming')
      ).toBeUndefined()
      expect(toast.success).toHaveBeenCalledWith(
        'Renamed to: Software Development'
      )
    })

    it('should trim whitespace from new title', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.renameGroup('DevOps', '  Cloud Engineering  ')
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(
        updatedSkills.find((g: any) => g.title === 'Cloud Engineering')
      ).toBeDefined()
    })

    it('should not rename to empty title', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.renameGroup('Programming', '')
      })

      expect(setResumeData).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Skill group name cannot be empty'
      )
    })

    it('should not rename to whitespace-only title', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.renameGroup('Programming', '   ')
      })

      expect(setResumeData).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Skill group name cannot be empty'
      )
    })

    it('should not rename to duplicate title (case-insensitive)', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.renameGroup('Programming', 'databases')
      })

      expect(setResumeData).not.toHaveBeenCalled()
      expect(toast.error).toHaveBeenCalledWith(
        'Skill group "databases" already exists'
      )
    })

    it('should allow renaming to same title with different case', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.renameGroup('Programming', 'PROGRAMMING')
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(
        updatedSkills.find((g: any) => g.title === 'PROGRAMMING')
      ).toBeDefined()
      expect(toast.success).toHaveBeenCalledWith('Renamed to: PROGRAMMING')
    })

    it('should preserve skills when renaming group', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.renameGroup('Programming', 'Coding')
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      const renamedGroup = updatedSkills.find((g: any) => g.title === 'Coding')
      expect(renamedGroup.skills).toHaveLength(2)
      expect(renamedGroup.skills[0].text).toBe('JavaScript')
      expect(renamedGroup.skills[1].text).toBe('TypeScript')
    })
  })

  describe('reorderGroups', () => {
    it('should reorder skill groups forward', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.reorderGroups(0, 2) // Move Programming from 0 to 2
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(updatedSkills[0].title).toBe('Databases')
      expect(updatedSkills[1].title).toBe('DevOps')
      expect(updatedSkills[2].title).toBe('Programming')
    })

    it('should reorder skill groups backward', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.reorderGroups(2, 0) // Move DevOps from 2 to 0
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(updatedSkills[0].title).toBe('DevOps')
      expect(updatedSkills[1].title).toBe('Programming')
      expect(updatedSkills[2].title).toBe('Databases')
    })

    it('should handle reordering to same position', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.reorderGroups(1, 1) // Same position
      })

      const updatedSkills = setResumeData.mock.calls[0][0].skills
      expect(updatedSkills[0].title).toBe('Programming')
      expect(updatedSkills[1].title).toBe('Databases')
      expect(updatedSkills[2].title).toBe('DevOps')
    })

    it('should handle invalid source index gracefully', () => {
      const { result } = renderHook(() => useSkillGroupsManagement(), {
        wrapper,
      })

      act(() => {
        result.current.reorderGroups(99, 0) // Invalid source
      })

      // Function returns early when removed is undefined, so setResumeData is not called
      expect(setResumeData).not.toHaveBeenCalled()
    })
  })
})
