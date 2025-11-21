import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import FormButton from "@/components/resume-builder/form/FormButton";
import { MdDelete } from "react-icons/md";

const Certification = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);
  const skillType = "certifications";
  const title = "Certifications";

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
        <h2 className="text-lg text-white font-semibold">{title}</h2>
      </div>
      <div className="flex flex-col gap-2">
        {resumeData[skillType].map((skill, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all"
          >
            <input
              type="text"
              placeholder="Enter certification name"
              name={title}
              className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 outline-none transition-all placeholder:text-white/40"
              value={skill}
              onChange={(e) => handleSkills(e, index, skillType)}
            />
            <button
              type="button"
              onClick={() => deleteSkill(index)}
              className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
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
  );
};

export default Certification;
