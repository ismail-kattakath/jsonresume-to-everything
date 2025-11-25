import FormButton from '@/components/resume-builder/form/FormButton'
import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { MdDelete } from 'react-icons/md'

const WorkExperience = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  const handleWorkExperience = (e, index) => {
    const newworkExperience = [...resumeData.workExperience]

    // Handle URL field formatting - remove protocols like social media does
    if (e.target.name === 'url') {
      newworkExperience[index][e.target.name] = e.target.value.replace(
        /^https?:\/\//,
        ''
      )
    } else {
      newworkExperience[index][e.target.name] = e.target.value
    }

    setResumeData({ ...resumeData, workExperience: newworkExperience })
  }

  const addWorkExperience = () => {
    setResumeData({
      ...resumeData,
      workExperience: [
        ...resumeData.workExperience,
        {
          company: '',
          url: '',
          position: '',
          description: '',
          keyAchievements: '',
          startYear: '',
          endYear: '',
        },
      ],
    })
  }

  const deleteWorkExperience = (index) => {
    const newworkExperience = resumeData.workExperience.filter(
      (_, i) => i !== index
    )
    setResumeData({ ...resumeData, workExperience: newworkExperience })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500"></div>
        <h2 className="text-lg font-semibold text-white">Work Experience</h2>
      </div>
      <div className="flex flex-col gap-3">
        {resumeData.workExperience.map((workExperience, index) => (
          <div
            key={index}
            className="group flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="floating-label-group">
              <input
                type="text"
                placeholder="Company Name"
                name="company"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                value={workExperience.company}
                onChange={(e) => handleWorkExperience(e, index)}
              />
              <label className="floating-label">Company Name</label>
            </div>
            <div className="floating-label-group">
              <input
                type="url"
                placeholder="Company Website URL"
                name="url"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                value={workExperience.url}
                onChange={(e) => handleWorkExperience(e, index)}
              />
              <label className="floating-label">Company Website URL</label>
            </div>
            <div className="floating-label-group">
              <input
                type="text"
                placeholder="Job Title"
                name="position"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                value={workExperience.position}
                onChange={(e) => handleWorkExperience(e, index)}
              />
              <label className="floating-label">Job Title</label>
            </div>
            <div className="floating-label-group">
              <textarea
                type="text"
                placeholder="Brief company/role description..."
                name="description"
                className="min-h-[100px] w-full resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2 pb-8 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                value={workExperience.description}
                maxLength="250"
                onChange={(e) => handleWorkExperience(e, index)}
              />
              <label className="floating-label">Description</label>
              <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-white/5 px-2 py-1 text-xs text-white/50">
                {workExperience.description.length}/250
              </div>
            </div>
            <div className="floating-label-group">
              <textarea
                type="text"
                placeholder="Key achievements and responsibilities..."
                name="keyAchievements"
                className="min-h-[120px] w-full resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2 pb-8 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                value={workExperience.keyAchievements}
                onChange={(e) => handleWorkExperience(e, index)}
              />
              <label className="floating-label">Key Achievements</label>
              <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-white/5 px-2 py-1 text-xs text-white/50">
                {workExperience.keyAchievements.length} chars
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="floating-label-group flex-1">
                <input
                  type="date"
                  placeholder="Start Date"
                  name="startYear"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                  value={workExperience.startYear}
                  onChange={(e) => handleWorkExperience(e, index)}
                />
                <label className="floating-label">Start Date</label>
              </div>
              <div className="floating-label-group flex-1">
                <input
                  type="date"
                  placeholder="End Date"
                  name="endYear"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                  value={workExperience.endYear}
                  onChange={(e) => handleWorkExperience(e, index)}
                />
                <label className="floating-label">End Date</label>
              </div>
              <button
                type="button"
                onClick={() => deleteWorkExperience(index)}
                className="flex-shrink-0 cursor-pointer rounded-lg px-3 py-2 text-red-400 transition-all hover:bg-red-400/10 hover:text-red-300"
                title="Delete this work experience"
              >
                <MdDelete className="text-xl" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <FormButton
        size={resumeData.workExperience.length}
        add={addWorkExperience}
        label="Work Experience"
      />
    </div>
  )
}

export default WorkExperience
