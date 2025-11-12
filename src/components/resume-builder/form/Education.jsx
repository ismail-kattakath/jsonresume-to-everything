import FormButton from "@/components/resume-builder/form/FormButton";
import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
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
    <div className="flex-col-gap-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="input-title mb-0">Education</h2>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showEducationDates"
            checked={resumeData.showEducationDates}
            onChange={handleToggleEducationDates}
            className="w-4 h-4 text-[deepskyblue] bg-gray-100 border-gray-300 rounded focus:ring-fuchsia-500"
          />
          <label
            htmlFor="showEducationDates"
            className="text-sm text-white cursor-pointer"
          >
            Display Graduation Date
          </label>
        </div>
      </div>
      {resumeData.education.map((education, index) => (
        <div key={index} className="f-col hover:bg-blue-900/20 rounded px-2 py-2 -mx-2 -my-2 transition-colors">
          <input
            type="text"
            placeholder="School"
            name="school"
            className="w-full other-input"
            value={education.school}
            onChange={(e) => handleEducation(e, index)}
          />
          <input
            type="url"
            placeholder="School URL (optional)"
            name="url"
            className="w-full other-input"
            value={education.url}
            onChange={(e) => handleEducation(e, index)}
          />
          <input
            type="text"
            placeholder="Degree"
            name="degree"
            className="w-full other-input"
            value={education.degree}
            onChange={(e) => handleEducation(e, index)}
          />
          <div className="flex items-center gap-2">
            <input
              type="date"
              placeholder="Start Year"
              name="startYear"
              className="flex-1 other-input"
              value={education.startYear}
              onChange={(e) => handleEducation(e, index)}
            />
            <input
              type="date"
              placeholder="End Year"
              name="endYear"
              className="flex-1 other-input"
              value={education.endYear}
              onChange={(e) => handleEducation(e, index)}
            />
            <button
              type="button"
              onClick={() => deleteEducation(index)}
              className="flex-shrink-0 p-1 text-[deepskyblue] hover:opacity-70 rounded transition-opacity"
              title="Delete this education"
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        </div>
      ))}
      <FormButton
        size={resumeData.education.length}
        add={addEducation}
      />
    </div>
  );
};

export default Education;
