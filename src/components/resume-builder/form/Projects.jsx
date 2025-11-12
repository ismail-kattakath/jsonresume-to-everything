import FormButton from "@/components/resume-builder/form/FormButton";
import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";

const Projects = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleProjects = (e, index) => {
    const newProjects = [...resumeData.projects];
    newProjects[index][e.target.name] = e.target.value;
    setResumeData({ ...resumeData, projects: newProjects });
  };

  const addProjects = () => {
    setResumeData({
      ...resumeData,
      projects: [
        ...resumeData.projects,
        {
          title: "",
          link: "",
          description: "",
          keyAchievements: "",
          startYear: "",
          endYear: "",
        },
      ],
    });
  };

  const removeProjects = (index) => {
    const newProjects = [...resumeData.projects];
    newProjects[index] = newProjects[newProjects.length - 1];
    newProjects.pop();
    setResumeData({ ...resumeData, projects: newProjects });
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-base text-white font-semibold">Projects</h2>
      {resumeData.projects.map((project, index) => (
        <div key={index} className="flex flex-col">
          <input
            type="text"
            placeholder="Project Name"
            name="name"
            className="w-full px-2 py-1 mb-2 bg-white text-gray-950 rounded"
            value={project.name}
            onChange={(e) => handleProjects(e, index)}
          />
          <input
            type="text"
            placeholder="Link"
            name="link"
            className="w-full px-2 py-1 mb-2 bg-white text-gray-950 rounded"
            value={project.link}
            onChange={(e) => handleProjects(e, index)}
          />
          <textarea
            type="text"
            placeholder="Description"
            name="description"
            className="w-full px-2 py-1 mb-2 bg-white text-gray-950 rounded h-32"
            value={project.description}
            maxLength="250"
            onChange={(e) => handleProjects(e, index)}
          />
          <textarea
            type="text"
            placeholder="Key Achievements"
            name="keyAchievements"
            className="w-full px-2 py-1 mb-2 bg-white text-gray-950 rounded h-40"
            value={project.keyAchievements}
            onChange={(e) => handleProjects(e, index)}
          />
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              placeholder="Start Year"
              name="startYear"
              className="px-2 py-1 bg-white text-gray-950 rounded"
              value={project.startYear}
              onChange={(e) => handleProjects(e, index)}
            />
            <input
              type="date"
              placeholder="End Year"
              name="endYear"
              className="px-2 py-1 bg-white text-gray-950 rounded"
              value={project.endYear}
              onChange={(e) => handleProjects(e, index)}
            />
          </div>
        </div>
      ))}
      <FormButton
        size={resumeData.projects.length}
        add={addProjects}
        remove={removeProjects}
        label="Project"
      />
    </div>
  );
};

export default Projects;
