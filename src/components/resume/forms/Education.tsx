import FormButton from '@/components/resume-builder/form/FormButton'
import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { MdDelete } from 'react-icons/md'

const Education = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  const handleEducation = (e, index) => {
    const newEducation = [...resumeData.education]

    // Handle URL field formatting - remove protocols like work experience does
    if (e.target.name === 'url') {
      newEducation[index][e.target.name] = e.target.value.replace(
        /^https?:\/\//,
        ''
      )
    } else {
      newEducation[index][e.target.name] = e.target.value
    }

    setResumeData({ ...resumeData, education: newEducation })
  }

  const handleToggleEducationDates = (e) => {
    setResumeData({ ...resumeData, showEducationDates: e.target.checked })
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { school: '', url: '', degree: '', startYear: '', endYear: '' },
      ],
    })
  }

  const deleteEducation = (index) => {
    const newEducation = resumeData.education.filter((_, i) => i !== index)
    setResumeData({ ...resumeData, education: newEducation })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-1 rounded-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
          <h2 className="text-lg font-semibold text-white">Education</h2>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition-colors hover:bg-white/10">
          <input
            type="checkbox"
            id="showEducationDates"
            checked={resumeData.showEducationDates}
            onChange={handleToggleEducationDates}
            className="h-4 w-4 cursor-pointer rounded accent-indigo-500"
          />
          <span className="text-sm text-white/90">Show Dates</span>
        </label>
      </div>
      <div className="flex flex-col gap-3">
        {resumeData.education.map((education, index) => (
          <div
            key={index}
            className="group flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
          >
            <div className="floating-label-group">
              <input
                type="text"
                placeholder="Institution Name"
                name="school"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                value={education.school}
                onChange={(e) => handleEducation(e, index)}
              />
              <label className="floating-label">Institution Name</label>
            </div>
            <div className="floating-label-group">
              <input
                type="url"
                placeholder="Website URL (optional)"
                name="url"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                value={education.url}
                onChange={(e) => handleEducation(e, index)}
              />
              <label className="floating-label">Website URL</label>
            </div>
            <div className="floating-label-group">
              <input
                type="text"
                placeholder="Degree / Program"
                name="degree"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                value={education.degree}
                onChange={(e) => handleEducation(e, index)}
              />
              <label className="floating-label">Degree / Program</label>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="floating-label-group flex-1">
                <input
                  type="date"
                  placeholder="Start Date"
                  name="startYear"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  value={education.startYear}
                  onChange={(e) => handleEducation(e, index)}
                />
                <label className="floating-label">Start Date</label>
              </div>
              <div className="floating-label-group flex-1">
                <input
                  type="date"
                  placeholder="End Date"
                  name="endYear"
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white transition-all outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
                  value={education.endYear}
                  onChange={(e) => handleEducation(e, index)}
                />
                <label className="floating-label">End Date</label>
              </div>
              <button
                type="button"
                onClick={() => deleteEducation(index)}
                className="flex-shrink-0 cursor-pointer rounded-lg px-3 py-2 text-red-400 transition-all hover:bg-red-400/10 hover:text-red-300"
                title="Delete this education"
              >
                <MdDelete className="text-xl" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <FormButton
        size={resumeData.education.length}
        add={addEducation}
        label="Education"
      />
    </div>
  )
}

export default Education
