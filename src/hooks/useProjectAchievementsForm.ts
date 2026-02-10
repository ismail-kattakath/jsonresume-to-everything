import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { Achievement } from '@/types'

/**
 * Specialized hook for managing key achievements in projects
 * Handles individual achievement items within a project entry
 */
export function useProjectAchievementsForm(projectIndex: number) {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  const project = resumeData.projects?.[projectIndex]

  if (!project) {
    throw new Error(`Project at index ${projectIndex} not found`)
  }

  /**
   * Handle text change for a specific achievement
   */
  const handleChange = (achievementIndex: number, value: string) => {
    if (!project) return

    const newAchievements = [...project.keyAchievements]
    const currentAchievement = newAchievements[achievementIndex]

    if (currentAchievement) {
      newAchievements[achievementIndex] = {
        ...currentAchievement,
        text: value,
      }
    }

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex
          ? { ...proj, keyAchievements: newAchievements }
          : proj
      ),
    }))
  }

  /**
   * Add new achievement with specified text
   */
  const add = (text: string) => {
    if (!text.trim() || !project) return
    const newAchievement: Achievement = { text: text.trim() }
    const newAchievements = [...project.keyAchievements, newAchievement]

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex
          ? { ...proj, keyAchievements: newAchievements }
          : proj
      ),
    }))
  }

  /**
   * Remove achievement by index
   */
  const remove = (achievementIndex: number) => {
    if (!project) return
    const newAchievements = project.keyAchievements.filter(
      (_, i) => i !== achievementIndex
    )

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex
          ? { ...proj, keyAchievements: newAchievements }
          : proj
      ),
    }))
  }

  /**
   * Reorder achievements via drag and drop
   */
  const reorder = (startIndex: number, endIndex: number) => {
    if (!project) return
    const newAchievements = [...project.keyAchievements]
    const [removed] = newAchievements.splice(startIndex, 1)
    if (removed) {
      newAchievements.splice(endIndex, 0, removed)
    }

    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects?.map((proj, i) =>
        i === projectIndex
          ? { ...proj, keyAchievements: newAchievements }
          : proj
      ),
    }))
  }

  return {
    achievements: project.keyAchievements,
    handleChange,
    add,
    remove,
    reorder,
  }
}
