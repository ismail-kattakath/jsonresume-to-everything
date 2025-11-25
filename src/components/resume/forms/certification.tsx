import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import FormButton from '@/components/resume-builder/form/FormButton'
import { MdDelete } from 'react-icons/md'

const Certification = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const skillType = 'certifications'
  const title = 'Certifications'

  const handleSkills = (e, index, skillType) => {
    const newSkills = [...resumeData[skillType]]
    newSkills[index] = e.target.value
    setResumeData({ ...resumeData, [skillType]: newSkills })
  }

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      [skillType]: [...resumeData[skillType], ''],
    })
  }

  const deleteSkill = (index) => {
    const newSkills = resumeData[skillType].filter((_, i) => i !== index)
    setResumeData({ ...resumeData, [skillType]: newSkills })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-500"></div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="flex flex-col gap-2">
        {resumeData[skillType].map((skill, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="floating-label-group flex-1">
              <input
                type="text"
                placeholder="Enter certification name"
                name={title}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                value={skill}
                onChange={(e) => handleSkills(e, index, skillType)}
              />
              <label className="floating-label">Certification Name</label>
            </div>
            <button
              type="button"
              onClick={() => deleteSkill(index)}
              className="flex-shrink-0 cursor-pointer rounded-lg p-2 text-red-400 transition-all hover:bg-red-400/10 hover:text-red-300"
              title="Delete this certification"
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        ))}
      </div>
      <FormButton
        size={resumeData[skillType].length}
        add={addSkill}
        label="Certification"
      />
    </div>
  )
}

export default Certification
