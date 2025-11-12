import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import FormButton from "@/components/resume-builder/form/FormButton";
import { MdDelete } from "react-icons/md";

const Skill = ({ title }) => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  // skills
  const handleSkill = (e, index, title) => {
    const newSkills = [
      ...resumeData.skills.find((skillType) => skillType.title === title)
        .skills,
    ];
    newSkills[index] = { ...newSkills[index], text: e.target.value };
    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }));
  };

  const handleHighlight = (index, title) => {
    const newSkills = [
      ...resumeData.skills.find((skillType) => skillType.title === title)
        .skills,
    ];
    newSkills[index] = { ...newSkills[index], highlight: !newSkills[index].highlight };
    setResumeData((prevData) => ({
      ...prevData,
      skills: prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      ),
    }));
  };

  const addSkill = (title) => {
    setResumeData((prevData) => {
      const skillType = prevData.skills.find(
        (skillType) => skillType.title === title
      );
      const newSkills = [...skillType.skills, { text: "", highlight: false }];
      const updatedSkills = prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      );
      return {
        ...prevData,
        skills: updatedSkills,
      };
    });
  };

  const removeSkill = (title, index) => {
    setResumeData((prevData) => {
      const skillType = prevData.skills.find(
        (skillType) => skillType.title === title
      );
      const newSkills = [...skillType.skills];
      newSkills.pop();
      const updatedSkills = prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      );
      return {
        ...prevData,
        skills: updatedSkills,
      };
    });
  };

  const deleteSkill = (title, index) => {
    setResumeData((prevData) => {
      const skillType = prevData.skills.find(
        (skillType) => skillType.title === title
      );
      const newSkills = skillType.skills.filter((_, i) => i !== index);
      const updatedSkills = prevData.skills.map((skill) =>
        skill.title === title ? { ...skill, skills: newSkills } : skill
      );
      return {
        ...prevData,
        skills: updatedSkills,
      };
    });
  };

  const skillType = resumeData.skills.find(
    (skillType) => skillType.title === title
  );

  return (
    <div className="flex-col-gap-2">
      <h2 className="input-title">{title}</h2>
      {skillType.skills.map((skill, index) => (
        <div key={index} className="flex items-center gap-2 hover:bg-blue-900/20 rounded px-2 py-1 -mx-2 -my-1 transition-colors">
          <input
            type="checkbox"
            checked={skill.highlight}
            onChange={() => handleHighlight(index, title)}
            className="w-4 h-4 cursor-pointer flex-shrink-0"
            title="Highlight this skill"
          />
          <input
            type="text"
            placeholder={title}
            name={title}
            className="flex-1 other-input"
            value={skill.text}
            onChange={(e) => handleSkill(e, index, title)}
          />
          <button
            type="button"
            onClick={() => deleteSkill(title, index)}
            className="flex-shrink-0 p-1 text-[deepskyblue] hover:opacity-70 rounded transition-opacity"
            title="Delete this skill"
          >
            <MdDelete className="text-xl" />
          </button>
        </div>
      ))}
      <FormButton
        size={skillType.skills.length}
        add={() => addSkill(title)}
      />
    </div>
  );
};

export default Skill;
