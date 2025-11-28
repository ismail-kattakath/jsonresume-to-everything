import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { Achievement } from '@/types'

/**
 * Specialized hook for managing key achievements in work experience
 * Handles individual achievement items within a work experience entry
 */
export function useKeyAchievementsForm(workExperienceIndex: number) {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  const workExperience = resumeData.workExperience[workExperienceIndex]

  if (!workExperience) {
    throw new Error(`Work experience at index ${workExperienceIndex} not found`)
  }

  /**
   * Handle text change for a specific achievement
   */
  const handleChange = (achievementIndex: number, value: string) => {
    const newAchievements = [...workExperience.keyAchievements]
    newAchievements[achievementIndex] = {
      ...newAchievements[achievementIndex],
      text: value,
    }

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex
          ? { ...exp, keyAchievements: newAchievements }
          : exp
      ),
    }))
  }

  /**
   * Add new achievement with specified text
   */
  const add = (text: string) => {
    if (!text.trim()) return
    const newAchievement: Achievement = { text: text.trim() }
    const newAchievements = [...workExperience.keyAchievements, newAchievement]

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex
          ? { ...exp, keyAchievements: newAchievements }
          : exp
      ),
    }))
  }

  /**
   * Remove achievement by index
   */
  const remove = (achievementIndex: number) => {
    const newAchievements = workExperience.keyAchievements.filter(
      (_, i) => i !== achievementIndex
    )

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex
          ? { ...exp, keyAchievements: newAchievements }
          : exp
      ),
    }))
  }

  /**
   * Reorder achievements via drag and drop
   */
  const reorder = (startIndex: number, endIndex: number) => {
    const newAchievements = [...workExperience.keyAchievements]
    const [removed] = newAchievements.splice(startIndex, 1)
    newAchievements.splice(endIndex, 0, removed)

    setResumeData((prevData) => ({
      ...prevData,
      workExperience: prevData.workExperience.map((exp, i) =>
        i === workExperienceIndex
          ? { ...exp, keyAchievements: newAchievements }
          : exp
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
        i === workExperienceIndex
          ? { ...exp, keyAchievements: newAchievements }
          : exp
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
