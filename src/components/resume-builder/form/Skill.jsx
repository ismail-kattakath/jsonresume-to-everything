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
    newSkills[index] = {
      ...newSkills[index],
      highlight: !newSkills[index].highlight,
    };
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
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-500 rounded-full"></div>
        <h2 className="text-lg text-white font-semibold">{title}</h2>
      </div>
      <div className="flex flex-col gap-2">
        {skillType.skills.map((skill, index) => (
          <div
            key={index}
            className="group flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg hover:border-white/20 hover:bg-white/10 transition-all"
          >
            <input
              type="checkbox"
              checked={skill.highlight}
              onChange={() => handleHighlight(index, title)}
              className="w-4 h-4 accent-pink-500 cursor-pointer flex-shrink-0 rounded"
              title="Highlight this skill"
            />
            <input
              type="text"
              placeholder={`Enter ${title.toLowerCase()}`}
              name={title}
              className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 outline-none transition-all placeholder:text-white/40"
              value={skill.text}
              onChange={(e) => handleSkill(e, index, title)}
            />
            <button
              type="button"
              onClick={() => deleteSkill(title, index)}
              className="flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
              title="Delete this skill"
            >
              <MdDelete className="text-xl" />
            </button>
          </div>
        ))}
      </div>
      <FormButton
        size={skillType.skills.length}
        add={() => addSkill(title)}
        label={title}
      />
    </div>
  );
};

export default Skill;
