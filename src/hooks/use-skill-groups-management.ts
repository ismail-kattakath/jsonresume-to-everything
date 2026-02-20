import { useCallback, useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/document-context'
import type { SkillGroup } from '@/types/resume'
import { toast } from 'sonner'

/**
 * Hook for managing skill groups (add, remove, rename, reorder)
 * Provides CRUD operations for skill group sections
 */
export function useSkillGroupsManagement() {
  const context = useContext(ResumeContext)

  if (!context) {
    throw new Error('useSkillGroupsManagement must be used within ResumeContext')
  }

  const { resumeData, setResumeData } = context

  /**
   * Add a new skill group with default empty skills array
   */
  const addGroup = useCallback(
    (title: string) => {
      if (!title.trim()) {
        toast.error('Skill group name cannot be empty')
        return
      }

      // Check for duplicate titles
      const exists = resumeData.skills.some((group) => group.title.toLowerCase() === title.toLowerCase())

      if (exists) {
        toast.error(`Skill group "${title}" already exists`)
        return
      }

      const newGroup: SkillGroup = {
        title: title.trim(),
        skills: [],
      }

      setResumeData({
        ...resumeData,
        skills: [...resumeData.skills, newGroup],
      })

      toast.success(`Added skill group: ${title}`)
    },
    [resumeData, setResumeData]
  )

  /**
   * Remove a skill group by title
   */
  const removeGroup = useCallback(
    (title: string) => {
      const updatedSkills = resumeData.skills.filter((group) => group.title !== title)

      setResumeData({
        ...resumeData,
        skills: updatedSkills,
      })

      toast.success(`Removed skill group: ${title}`)
    },
    [resumeData, setResumeData]
  )

  /**
   * Rename a skill group
   */
  const renameGroup = useCallback(
    (oldTitle: string, newTitle: string) => {
      if (!newTitle.trim()) {
        toast.error('Skill group name cannot be empty')
        return
      }

      // Check for duplicate titles (excluding the current one)
      const exists = resumeData.skills.some(
        (group) => group.title !== oldTitle && group.title.toLowerCase() === newTitle.toLowerCase()
      )

      if (exists) {
        toast.error(`Skill group "${newTitle}" already exists`)
        return
      }

      const updatedSkills = resumeData.skills.map((group) =>
        group.title === oldTitle ? { ...group, title: newTitle.trim() } : group
      )

      setResumeData({
        ...resumeData,
        skills: updatedSkills,
      })

      toast.success(`Renamed to: ${newTitle}`)
    },
    [resumeData, setResumeData]
  )

  /**
   * Reorder skill groups (drag and drop)
   */
  const reorderGroups = useCallback(
    (startIndex: number, endIndex: number) => {
      const result = Array.from(resumeData.skills)
      const [removed] = result.splice(startIndex, 1)

      if (!removed) return // Safety check

      result.splice(endIndex, 0, removed)

      setResumeData({
        ...resumeData,
        skills: result,
      })
    },
    [resumeData, setResumeData]
  )

  return {
    addGroup,
    removeGroup,
    renameGroup,
    reorderGroups,
  }
}
