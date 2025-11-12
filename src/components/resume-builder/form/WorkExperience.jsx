import FormButton from "@/components/resume-builder/form/FormButton";
import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import { MdDelete } from "react-icons/md";

const WorkExperience = () => {
  const {
    resumeData,
    setResumeData,
  } = useContext(ResumeContext);

  const handleWorkExperience = (e, index) => {
    const newworkExperience = [...resumeData.workExperience];
    
    // Handle URL field formatting - remove protocols like social media does
    if (e.target.name === 'url') {
      newworkExperience[index][e.target.name] = e.target.value.replace(
        /^https?:\/\//,
        ""
      );
    } else {
      newworkExperience[index][e.target.name] = e.target.value;
    }
    
    setResumeData({ ...resumeData, workExperience: newworkExperience });
  };

  const addWorkExperience = () => {
    setResumeData({
      ...resumeData,
      workExperience: [
        ...resumeData.workExperience,
        {
          company: "",
          url: "",
          position: "",
          description: "",
          keyAchievements: "",
          startYear: "",
          endYear: "",
        },
      ],
    });
  };

  const removeWorkExperience = (index) => {
    const newworkExperience = [...resumeData.workExperience];
    newworkExperience[index] = newworkExperience[newworkExperience.length - 1];
    newworkExperience.pop();
    setResumeData({ ...resumeData, workExperience: newworkExperience });
  };

  const deleteWorkExperience = (index) => {
    const newworkExperience = resumeData.workExperience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, workExperience: newworkExperience });
  };

  return (
    <div className="flex-col-gap-2">
      <h2 className="input-title">Work Experience</h2>
      {resumeData.workExperience.map((workExperience, index) => (
        <div key={index} className="f-col hover:bg-blue-900/20 rounded px-2 py-2 -mx-2 -my-2 transition-colors">
          <input
            type="text"
            placeholder="Company"
            name="company"
            className="w-full other-input"
            value={workExperience.company}
            onChange={(e) => handleWorkExperience(e, index)}
          />
          <input
            type="url"
            placeholder="Company URL"
            name="url"
            className="w-full other-input"
            value={workExperience.url}
            onChange={(e) => handleWorkExperience(e, index)}
          />
          <input
            type="text"
            placeholder="Job Title"
            name="position"
            className="w-full other-input"
            value={workExperience.position}
            onChange={(e) => handleWorkExperience(e, index)}
          />
          <textarea
            type="text"
            placeholder="Description"
            name="description"
            className="w-full other-input h-32"
            value={workExperience.description}
            maxLength="250"
            onChange={(e) => handleWorkExperience(e, index)}
          />
          <textarea
            type="text"
            placeholder="Key Achievements"
            name="keyAchievements"
            className="w-full other-input h-40"
            value={workExperience.keyAchievements}
            onChange={(e) => handleWorkExperience(e, index)}
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              placeholder="Start Year"
              name="startYear"
              className="flex-1 other-input"
              value={workExperience.startYear}
              onChange={(e) => handleWorkExperience(e, index)}
            />
            <input
              type="date"
              placeholder="End Year"
              name="endYear"
              className="flex-1 other-input"
              value={workExperience.endYear}
              onChange={(e) => handleWorkExperience(e, index)}
            />
            <button
              type="button"
              onClick={() => deleteWorkExperience(index)}
              className="flex-shrink-0 p-1 text-[deepskyblue] hover:opacity-70 rounded transition-opacity"
              title="Delete this work experience"
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        </div>
      ))}
      <FormButton
        size={resumeData.workExperience.length}
        add={addWorkExperience}
      />
    </div>
  );
};

export default WorkExperience;
