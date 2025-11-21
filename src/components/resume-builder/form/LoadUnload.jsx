import { MdPictureAsPdf } from "react-icons/md";
import { VscJson } from "react-icons/vsc";
import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import { convertToJSONResume, convertFromJSONResume } from "@/lib/jsonResume";
import { validateJSONResume } from "@/lib/jsonResumeSchema";
import { toast } from "sonner";

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

  // load backup resume data - supports both internal format and JSON Resume format
  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        toast.loading("Processing resume data...", { id: "load-resume" });

        const loadedData = JSON.parse(event.target.result);

        // Check if it's JSON Resume format (has $schema or basics field)
        const isJSONResume = loadedData.$schema?.includes("jsonresume") || loadedData.basics;

        if (isJSONResume) {
          // Validate JSON Resume format
          const validation = validateJSONResume(loadedData);

          if (!validation.valid) {
            toast.error(
              `Invalid JSON Resume format:\n${validation.errors.join("\n")}`,
              { id: "load-resume", duration: 5000 }
            );
            return;
          }

          // Convert from JSON Resume to internal format
          const convertedData = convertFromJSONResume(loadedData);

          if (!convertedData) {
            toast.error("Failed to convert JSON Resume format", { id: "load-resume" });
            return;
          }

          setResumeData(convertedData);
          toast.success("JSON Resume loaded successfully!", { id: "load-resume" });
        } else {
          // Handle internal format (legacy)
          const migratedData = migrateSkillsData(loadedData);
          setResumeData(migratedData);
          toast.success("Resume data loaded successfully!", { id: "load-resume" });
        }
      } catch (error) {
        toast.error(`Failed to load resume: ${error.message}`, {
          id: "load-resume",
          duration: 5000
        });
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file", { id: "load-resume" });
    };

    reader.readAsText(file);
  };

  // download resume data in JSON Resume format
  const handleDownload = (data, filename, event) => {
    event.preventDefault();

    try {
      toast.loading("Generating JSON Resume...", { id: "save-resume" });

      const jsonResumeData = convertToJSONResume(data);
      const jsonData = JSON.stringify(jsonResumeData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      toast.success("JSON Resume saved successfully!", { id: "save-resume" });
    } catch (error) {
      toast.error(`Failed to save resume: ${error.message}`, {
        id: "save-resume",
        duration: 5000
      });
    }
  };

  // Generate consistent filename for JSON download matching PDF title format
  const generateFilename = () => {
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    // Convert to PascalCase: split by spaces, capitalize first letter of each word, join together
    const toPascalCase = (str) => {
      return str
        .split(/\s+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");
    };

    // Remove all special characters except spaces, then convert to PascalCase
    const cleanName = toPascalCase(
      resumeData.name.replace(/[^a-zA-Z0-9\s]/g, "")
    );
    const cleanPosition = toPascalCase(
      resumeData.position.replace(/[^a-zA-Z0-9\s]/g, "")
    );

    return `${yearMonth}-${cleanName}-${cleanPosition}-Resume.json`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 max-w-3xl mx-auto">
      <label className="group inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium">
        <VscJson className="text-lg group-hover:rotate-12 transition-transform" />
        <span>Load Json Resume</span>
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
        className="group inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium cursor-pointer"
        onClick={(event) =>
          handleDownload(resumeData, generateFilename(), event)
        }
      >
        <VscJson className="text-lg group-hover:rotate-12 transition-transform" />
        <span>Save Json Resume</span>
      </button>
      <button
        aria-label="Print"
        className="group inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium cursor-pointer"
        onClick={handlePrint}
      >
        <MdPictureAsPdf className="text-lg group-hover:scale-110 transition-transform" />
        <span>Print PDF</span>
      </button>
    </div>
  );
};

export default LoadUnload;
