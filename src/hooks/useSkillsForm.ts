import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { Skill } from '@/types'

/**
 * Specialized hook for managing skills with nested structure
 * Handles skill groups with individual skill items
 */
export function useSkillsForm(title: string) {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  const skillType = resumeData.skills.find(
    (skillType) => skillType.title === title
  )

  if (!skillType) {
    throw new Error(`Skill type "${title}" not found`)
  }

  /**
   * Handle text change for a specific skill
   */
  const handleChange = (index: number, value: string) => {
    const newSkills = [...skillType.skills]
    const currentSkill = newSkills[index]
    if (currentSkill) {
      newSkills[index] = { ...currentSkill, text: value }
    }

    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }))
  }

  /**
   * Add new skill to the group with specified text
   */
  const add = (text: string) => {
    if (!text.trim()) return
    const newSkill: Skill = { text: text.trim() }
    const newSkills = [...skillType.skills, newSkill]

    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }))
  }

  /**
   * Remove skill by index
   */
  const remove = (index: number) => {
    const newSkills = skillType.skills.filter((_, i) => i !== index)

    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }))
  }

  /**
   * Reorder skills via drag and drop
   */
  const reorder = (startIndex: number, endIndex: number) => {
    const newSkills = [...skillType.skills]
    const [removed] = newSkills.splice(startIndex, 1)
    if (removed) {
      newSkills.splice(endIndex, 0, removed)
    }

    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }))
  }

  return {
    skills: skillType.skills,
    handleChange,
    add,
    remove,
    reorder,
  }
}
