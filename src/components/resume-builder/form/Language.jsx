import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import FormButton from "@/components/resume-builder/form/FormButton";
import { MdDelete } from "react-icons/md";

const Language = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);
  const skillType = "languages";
  const title = "Languages";
  const placeholder = "Language";

  const handleSkills = (e, index, skillType) => {
    const newSkills = [...resumeData[skillType]];
    newSkills[index] = e.target.value;
    setResumeData({ ...resumeData, [skillType]: newSkills });
  };

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      [skillType]: [...resumeData[skillType], ""],
    });
  };

  const removeSkill = (index) => {
    const newSkills = [...resumeData[skillType]];
    newSkills.splice(-1, 1);
    setResumeData({ ...resumeData, [skillType]: newSkills });
  };

  const deleteSkill = (index) => {
    const newSkills = resumeData[skillType].filter((_, i) => i !== index);
    setResumeData({ ...resumeData, [skillType]: newSkills });
  };

  const handleToggleLanguages = (e) => {
    setResumeData({ ...resumeData, showLanguages: e.target.checked });
  };

  return (
    <div className="flex-col-gap-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="input-title mb-0">{title}</h2>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLanguages"
            checked={resumeData.showLanguages}
            onChange={handleToggleLanguages}
            className="w-4 h-4 text-[deepskyblue] bg-gray-100 border-gray-300 rounded focus:ring-fuchsia-500"
          />
          <label
            htmlFor="showLanguages"
            className="text-sm text-white cursor-pointer"
          >
            Display Languages Section
          </label>
        </div>
      </div>
      {resumeData[skillType].map((skill, index) => (
        <div key={index} className="flex items-center gap-2 hover:bg-blue-900/20 rounded px-2 py-1 -mx-2 -my-1 transition-colors">
          <input
            type="text"
            placeholder={placeholder}
            name="skill"
            className="flex-1 other-input"
            value={skill}
            onChange={(e) => handleSkills(e, index, skillType)}
          />
          <button
            type="button"
            onClick={() => deleteSkill(index)}
            className="flex-shrink-0 p-1 text-[deepskyblue] hover:opacity-70 rounded transition-opacity"
            title="Delete this language"
          >
            <MdDelete className="text-xl" />
          </button>
        </div>
      ))}
      <FormButton
        size={resumeData[skillType].length}
        add={addSkill}
      />
    </div>
  );
};

export default Language;
