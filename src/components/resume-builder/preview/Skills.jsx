import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";

const Skills = ({ title, skills }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleTitleChange = (e) => {
    const newSkills = [...resumeData.skills];
    newSkills.find((skillType) => skillType.title === title).title = e.target.innerText;
    setResumeData({ ...resumeData, skills: newSkills });
  };

  const handleSkillChange = (e, skillIndex) => {
    const newSkills = [...resumeData.skills];
    const skillTypeIndex = newSkills.findIndex((skillType) => skillType.title === title);
    const newText = e.target.innerText.trim();

    if (newText === "") {
      // Remove the skill from array if text is empty
      newSkills[skillTypeIndex].skills.splice(skillIndex, 1);
    } else {
      // Update the skill text
      newSkills[skillTypeIndex].skills[skillIndex].text = newText;
    }

    setResumeData({ ...resumeData, skills: newSkills });
  };

  return (
    skills.length > 0 && (
      <>
        <h2 className="section-title mb-1 border-b-2 border-gray-300 border-dashed editable" contentEditable suppressContentEditableWarning onBlur={handleTitleChange}>
          {title}
        </h2>
        <p className="sub-content">
          {skills.map((skill, index) => (
            <span key={index}>
              {index > 0 && ", "}
              {skill.highlight ? (
                <span
                  className="bg-blue-100 font-semibold editable"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleSkillChange(e, index)}
                >
                  {skill.text}
                </span>
              ) : (
                <span
                  className="editable"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleSkillChange(e, index)}
                >
                  {skill.text}
                </span>
              )}
            </span>
          ))}
        </p>
      </>
    )
  );
};

export default Skills;