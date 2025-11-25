import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import FormButton from '@/components/resume-builder/form/FormButton'
import { MdDelete } from 'react-icons/md'

const Skill = ({ title }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  // skills
  const handleSkill = (e, index, title) => {
    const newSkills = [
      ...resumeData.skills.find((skillType) => skillType.title === title)
        .skills,
    ]
    newSkills[index] = { ...newSkills[index], text: e.target.value }
    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }))
  }

  const handleHighlight = (index, title) => {
    const newSkills = [
      ...resumeData.skills.find((skillType) => skillType.title === title)
        .skills,
    ]
    newSkills[index] = {
      ...newSkills[index],
      highlight: !newSkills[index].highlight,
    }
    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }))
  }

  const addSkill = (title) => {
    setResumeData((prevData) => {
      const skillType = prevData.skills.find(
        (skillType) => skillType.title === title
      )
      const newSkills = [...skillType.skills, { text: '', highlight: false }]
      const updatedSkills = prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      )
      return {
        ...prevData,
        skills: updatedSkills,
      }
    })
  }

  const deleteSkill = (title, index) => {
    setResumeData((prevData) => {
      const skillType = prevData.skills.find(
        (skillType) => skillType.title === title
      )
      const newSkills = skillType.skills.filter((_, i) => i !== index)
      const updatedSkills = prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      )
      return {
        ...prevData,
        skills: updatedSkills,
      }
    })
  }

  const skillType = resumeData.skills.find(
    (skillType) => skillType.title === title
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-pink-500 to-rose-500"></div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="flex flex-col gap-2">
        {skillType.skills.map((skill, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <input
              type="checkbox"
              checked={skill.highlight}
              onChange={() => handleHighlight(index, title)}
              className="h-4 w-4 flex-shrink-0 cursor-pointer rounded accent-pink-500"
              title="Highlight this skill"
            />
            <div className="floating-label-group flex-1">
              <input
                type="text"
                placeholder={`Enter ${title.toLowerCase()}`}
                name={title}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20"
                value={skill.text}
                onChange={(e) => handleSkill(e, index, title)}
              />
              <label className="floating-label">{title}</label>
            </div>
            <button
              type="button"
              onClick={() => deleteSkill(title, index)}
              className="flex-shrink-0 cursor-pointer rounded-lg p-2 text-red-400 transition-all hover:bg-red-400/10 hover:text-red-300"
              title="Delete this skill"
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        ))}
      </div>
      <FormButton
        size={skillType.skills.length}
        add={() => addSkill(title)}
        label={title}
      />
    </div>
  )
}

export default Skill
