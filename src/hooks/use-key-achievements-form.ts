import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/document-context'
import type { Achievement } from '@/types'

/**
 * Specialized hook for managing key achievements in work experience
 * Handles individual achievement items within a work experience entry
 */
export function useKeyAchievementsForm(workExperienceIndex: number) {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  // eslint-disable-next-line security/detect-object-injection
  const workExperience = resumeData.workExperience[workExperienceIndex]

  if (!workExperience) {
    throw new Error(`Work experience at index ${workExperienceIndex} not found`)
  }

  /**
   * Handle text change for a specific achievement
   */
  const handleChange = (achievementIndex: number, value: string) => {
    if (!workExperience) return

    const newAchievements = [...workExperience.keyAchievements]
    const currentAchievement = newAchievements[achievementIndex]

    if (currentAchievement) {
      newAchievements[achievementIndex] = {
        ...currentAchievement,
        text: value,
      }
    }

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex ? { ...exp, keyAchievements: newAchievements } : exp
      ),
    }))
  }

  /**
   * Add new achievement with specified text
   */
  const add = (text: string) => {
    if (!text.trim() || !workExperience) return
    const newAchievement: Achievement = { text: text.trim() }
    const newAchievements = [...workExperience.keyAchievements, newAchievement]

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex ? { ...exp, keyAchievements: newAchievements } : exp
      ),
    }))
  }

  /**
   * Remove achievement by index
   */
  const remove = (achievementIndex: number) => {
    if (!workExperience) return
    const newAchievements = workExperience.keyAchievements.filter((_, i) => i !== achievementIndex)

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex ? { ...exp, keyAchievements: newAchievements } : exp
      ),
    }))
  }

  /**
   * Reorder achievements via drag and drop
   */
  const reorder = (startIndex: number, endIndex: number) => {
    if (!workExperience) return
    const newAchievements = [...workExperience.keyAchievements]
    const [removed] = newAchievements.splice(startIndex, 1)
    if (removed) {
      newAchievements.splice(endIndex, 0, removed)
    }

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex ? { ...exp, keyAchievements: newAchievements } : exp
      ),
    }))
  }

  /**
   * Set achievements directly (used by AI sorting)
   */
  const setAchievements = (newAchievements: Achievement[]) => {
    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex ? { ...exp, keyAchievements: newAchievements } : exp
      ),
    }))
  }

  return {
    achievements: workExperience.keyAchievements,
    handleChange,
    add,
    remove,
    reorder,
    setAchievements,
  }
}
