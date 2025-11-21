import { MdPictureAsPdf } from "react-icons/md";
import { VscJson } from "react-icons/vsc";
import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import { convertToJSONResume, convertFromJSONResume } from "@/lib/jsonResume";
import { validateJSONResume } from "@/lib/jsonResumeSchema";
import { toast } from "sonner";

const LoadUnload = ({ hideExportButton = false, preserveContent = false }) => {
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

  // import resume data - supports both internal format and JSON Resume format
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        toast.loading("Processing resume data...", { id: "import-resume" });

        const loadedData = JSON.parse(event.target.result);

        // Check if it's JSON Resume format (has $schema or basics field)
        const isJSONResume = loadedData.$schema?.includes("jsonresume") || loadedData.basics;

        if (isJSONResume) {
          // Validate JSON Resume format
          const validation = validateJSONResume(loadedData);

          if (!validation.valid) {
            toast.error(
              `Invalid JSON Resume format:\n${validation.errors.join("\n")}`,
              { id: "import-resume", duration: 5000 }
            );
            return;
          }

          // Convert from JSON Resume to internal format
          const convertedData = convertFromJSONResume(loadedData);

          if (!convertedData) {
            toast.error("Failed to convert JSON Resume format", { id: "import-resume" });
            return;
          }

          // Preserve cover letter content if flag is set
          if (preserveContent && resumeData.content) {
            convertedData.content = resumeData.content;
          }

          setResumeData(convertedData);
          toast.success("JSON Resume imported successfully!", { id: "import-resume" });
        } else {
          // Handle internal format (legacy)
          const migratedData = migrateSkillsData(loadedData);

          // Preserve cover letter content if flag is set
          if (preserveContent && resumeData.content) {
            migratedData.content = resumeData.content;
          }

          setResumeData(migratedData);
          toast.success("Resume data imported successfully!", { id: "import-resume" });
        }
      } catch (error) {
        toast.error(`Failed to import resume: ${error.message}`, {
          id: "import-resume",
          duration: 5000
        });
      }
    };

    reader.onerror = () => {
      toast.error("Failed to read file", { id: "import-resume" });
    };

    reader.readAsText(file);
  };

  // export resume data in JSON Resume format
  const handleExport = (data, filename, event) => {
    event.preventDefault();

    try {
      toast.loading("Generating JSON Resume...", { id: "export-resume" });

      const jsonResumeData = convertToJSONResume(data);
      const jsonData = JSON.stringify(jsonResumeData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      toast.success("JSON Resume exported successfully!", { id: "export-resume" });
    } catch (error) {
      toast.error(`Failed to export resume: ${error.message}`, {
        id: "export-resume",
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
    <div className={`grid gap-3 mb-4 max-w-3xl mx-auto ${hideExportButton ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
      <label className="group inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium">
        <VscJson className="text-lg group-hover:rotate-12 transition-transform" />
        <span>Import Json Resume</span>
        <input
          aria-label="Import Json Resume"
          type="file"
          className="hidden"
          onChange={handleImport}
          accept=".json"
        />
      </label>
      {!hideExportButton && (
        <button
          aria-label="Export Json Resume"
          className="group inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-sm font-medium cursor-pointer"
          onClick={(event) =>
            handleExport(resumeData, generateFilename(), event)
          }
        >
          <VscJson className="text-lg group-hover:rotate-12 transition-transform" />
          <span>Export Json Resume</span>
        </button>
      )}
      <button
        aria-label="Print PDF"
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
