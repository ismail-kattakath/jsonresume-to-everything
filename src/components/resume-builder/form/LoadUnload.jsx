import { MdPictureAsPdf } from "react-icons/md";
import { VscJson } from "react-icons/vsc";
import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";

const LoadUnload = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  // migrate old skills format to new format
  const migrateSkillsData = (data) => {
    const migratedData = { ...data };
    if (migratedData.skills) {
      migratedData.skills = migratedData.skills.map((skillCategory) => ({
        ...skillCategory,
        skills: skillCategory.skills.map((skill) => {
          if (typeof skill === "string") {
            return { text: skill, highlight: false };
          }
          // Handle old 'underline' property
          if (skill.underline !== undefined && skill.highlight === undefined) {
            return { text: skill.text, highlight: skill.underline };
          }
          return skill;
        }),
      }));
    }
    return migratedData;
  };

  // load backup resume data
  const handleLoad = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const loadedData = JSON.parse(event.target.result);
      const migratedData = migrateSkillsData(loadedData);
      setResumeData(migratedData);
    };
    reader.readAsText(file);
  };

  // download resume data
  const handleDownload = (data, filename, event) => {
    event.preventDefault();
    const jsonData = JSON.stringify(data);
    const blob = new Blob([jsonData], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Generate consistent filename for JSON download matching PDF title format
  const generateFilename = () => {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Convert to PascalCase: split by spaces, capitalize first letter of each word, join together
    const toPascalCase = (str) => {
      return str
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    };

    // Remove all special characters except spaces, then convert to PascalCase
    const cleanName = toPascalCase(resumeData.name.replace(/[^a-zA-Z0-9\s]/g, ''));
    const cleanPosition = toPascalCase(resumeData.position.replace(/[^a-zA-Z0-9\s]/g, ''));

    return `${yearMonth}-${cleanName}-${cleanPosition}-Resume.json`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-wrap gap-2 mb-2 justify-center">
      <label className="inline-flex items-center gap-2 px-3 py-1.5 text-white bg-[deepskyblue] rounded cursor-pointer hover:bg-[#00a0e3] transition-colors text-sm">
        <VscJson className="text-lg" />
        <span>Load</span>
        <input
          aria-label="Load"
          type="file"
          className="hidden"
          onChange={handleLoad}
          accept=".json"
        />
      </label>
      <button
        aria-label="Save"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-white bg-[deepskyblue] rounded hover:bg-[#00a0e3] transition-colors text-sm cursor-pointer"
        onClick={(event) =>
          handleDownload(
            resumeData,
            generateFilename(),
            event
          )
        }
      >
        <VscJson className="text-lg" />
        <span>Save</span>
      </button>
      <button
        aria-label="Print"
        className="inline-flex items-center gap-2 px-3 py-1.5 text-white bg-[deepskyblue] rounded hover:bg-[#00a0e3] transition-colors text-sm cursor-pointer"
        onClick={handlePrint}
      >
        <MdPictureAsPdf className="text-lg" />
        <span>Print</span>
      </button>
    </div>
  );
};

export default LoadUnload;
