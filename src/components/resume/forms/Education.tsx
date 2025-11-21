import FormButton from "@/components/resume-builder/form/FormButton";
import React, { useContext } from "react";
import { ResumeContext } from "@/lib/contexts/DocumentContext";
import { MdDelete } from "react-icons/md";

const Education = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleEducation = (e, index) => {
    const newEducation = [...resumeData.education];

    // Handle URL field formatting - remove protocols like work experience does
    if (e.target.name === "url") {
      newEducation[index][e.target.name] = e.target.value.replace(
        /^https?:\/\//,
        ""
      );
    } else {
      newEducation[index][e.target.name] = e.target.value;
    }

    setResumeData({ ...resumeData, education: newEducation });
  };

  const handleToggleEducationDates = (e) => {
    setResumeData({ ...resumeData, showEducationDates: e.target.checked });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { school: "", url: "", degree: "", startYear: "", endYear: "" },
      ],
    });
  };

  const removeEducation = (index) => {
    const newEducation = [...resumeData.education];
    newEducation[index] = newEducation[newEducation.length - 1];
    newEducation.pop();
    setResumeData({ ...resumeData, education: newEducation });
  };

  const deleteEducation = (index) => {
    const newEducation = resumeData.education.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, education: newEducation });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
          <h2 className="text-lg text-white font-semibold">Education</h2>
        </div>
        <label className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10">
          <input
            type="checkbox"
            id="showEducationDates"
            checked={resumeData.showEducationDates}
            onChange={handleToggleEducationDates}
            className="w-4 h-4 accent-indigo-500 cursor-pointer rounded"
          />
          <span className="text-sm text-white/90">Show Dates</span>
        </label>
      </div>
      <div className="flex flex-col gap-3">
        {resumeData.education.map((education, index) => (
          <div
            key={index}
            className="group flex flex-col gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all"
          >
            <div className="floating-label-group">
              <input
                type="text"
                placeholder="Institution Name"
                name="school"
                className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all placeholder:text-white/40"
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
                className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all placeholder:text-white/40"
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
                className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all placeholder:text-white/40"
                value={education.degree}
                onChange={(e) => handleEducation(e, index)}
              />
              <label className="floating-label">Degree / Program</label>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="floating-label-group flex-1">
                <input
                  type="date"
                  placeholder="Start Date"
                  name="startYear"
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all"
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
                  className="w-full px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none transition-all"
                  value={education.endYear}
                  onChange={(e) => handleEducation(e, index)}
                />
                <label className="floating-label">End Date</label>
              </div>
              <button
                type="button"
                onClick={() => deleteEducation(index)}
                className="flex-shrink-0 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
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
  );
};

export default Education;
