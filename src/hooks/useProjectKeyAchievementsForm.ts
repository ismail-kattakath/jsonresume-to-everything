import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
// import type { Achievement } from '@/types'

/**
 * Specialized hook for managing key achievements in projects
 * Handles individual achievement items within a project entry
 */
export function useProjectKeyAchievementsForm(projectIndex: number) {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  // eslint-disable-next-line security/detect-object-injection
  const project = resumeData.projects?.[projectIndex]

  if (!project) {
    throw new Error(`Project at index ${projectIndex} not found`)
  }

  // Ensure keyAchievements is initialized
  const achievements = project.keyAchievements || []

  /**
   * Handle text change for a specific achievement
   */
  const handleChange = (index: number, value: string) => {
    if (!project) return

    const newAchievements = [...achievements]
    newAchievements[index] = { ...newAchievements[index], text: value }

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex ? { ...proj, keyAchievements: newAchievements } : proj
      ),
    }))
  }

  /**
   * Add new achievement
   */
  const add = (text: string) => {
    if (!text.trim() || !project) return
    const newAchievements = [...achievements, { text: text.trim() }]

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex ? { ...proj, keyAchievements: newAchievements } : proj
      ),
    }))
  }

  /**
   * Remove achievement by index
   */
  const remove = (index: number) => {
    if (!project) return
    const newAchievements = achievements.filter((_, i) => i !== index)

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex ? { ...proj, keyAchievements: newAchievements } : proj
      ),
    }))
  }

  /**
   * Reorder achievements via drag and drop
   */
  const reorder = (startIndex: number, endIndex: number) => {
    if (!project) return
    const newAchievements = [...achievements]
    const [removed] = newAchievements.splice(startIndex, 1)
    if (removed) {
      newAchievements.splice(endIndex, 0, removed)
    }

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex ? { ...proj, keyAchievements: newAchievements } : proj
      ),
    }))
  }

  return {
    achievements,
    handleChange,
    add,
    remove,
    reorder,
  }
}
