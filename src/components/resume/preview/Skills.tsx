import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { Highlight } from '@/components/ui/Highlight'
import type { ResumeData, Skill } from '@/types/resume'

interface SkillsProps {
  title: string
  skills: Skill[]
}

const Skills = ({ title, skills }: SkillsProps) => {
  const { settings } = useAISettings()
  const context = useContext(ResumeContext)

  if (!context) {
    return null
  }

  const { resumeData, setResumeData, editable = true } = context

  const handleTitleChange = (e: React.FocusEvent<HTMLHeadingElement>) => {
    if (!resumeData) return
    const newSkills = [...(resumeData as ResumeData).skills]
    const group = newSkills.find((skillType) => skillType.title === title)
    if (group) {
      group.title = e.target.innerText
      setResumeData({ ...resumeData, skills: newSkills } as ResumeData)
    }
  }

  const handleSkillChange = (
    e: React.FocusEvent<HTMLSpanElement>,
    skillIndex: number
  ) => {
    if (!resumeData) return
    const newSkills = [...(resumeData as ResumeData).skills]
    const skillTypeIndex = newSkills.findIndex(
      (skillType) => skillType.title === title
    )

    if (skillTypeIndex === -1) return

    const newText = e.target.innerText.trim()

    if (newText === '') {
      // Remove the skill from array if text is empty
      newSkills[skillTypeIndex].skills.splice(skillIndex, 1)
    } else {
      // Update the skill text
      newSkills[skillTypeIndex].skills[skillIndex].text = newText
    }

    setResumeData({ ...resumeData, skills: newSkills } as ResumeData)
  }

  if (skills.length === 0) {
    return null
  }

  return (
    <>
      <h2
        className="section-title editable mb-1 border-b-2 border-dashed border-gray-300"
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={handleTitleChange}
      >
        {title}
      </h2>
      <p className="content">
        {skills.map((skill, index) => (
          <span key={index}>
            {index > 0 && ', '}
            <span
              className="editable"
              contentEditable={editable}
              suppressContentEditableWarning
              onBlur={(e) => handleSkillChange(e, index)}
            >
              <Highlight
                text={skill.text}
                keywords={settings.skillsToHighlight}
              />
            </span>
          </span>
        ))}
      </p>
    </>
  )
}

export default Skills
