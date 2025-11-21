"use client";

import { useEffect, useState } from "react";
import Preview from "@/components/resume-builder/preview/Preview";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
import DefaultResumeData from "@/components/resume-builder/utility/DefaultResumeData";
import "@/app/resume/edit/resume-builder.css";

export default function ResumeDownloadPage() {
  const [resumeData, setResumeData] = useState(DefaultResumeData);

  useEffect(() => {
    // Load resume data from localStorage if available
    const storedData = localStorage.getItem("resumeData");
    if (storedData) {
      setResumeData(JSON.parse(storedData));
    }

    // Wait for page to load before triggering print
    const timer = setTimeout(() => {
      window.print();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData,
        handleProfilePicture: () => {},
        handleChange: () => {},
      }}
    >
      <div className="min-h-screen flex items-center justify-center">
        {/* Mobile message */}
        <div className="md:hidden flex items-center justify-center min-h-screen p-6">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </a>
        </div>

        {/* Desktop preview */}
        <div className="hidden md:flex items-center justify-center">
          <Preview />
        </div>
      </div>
    </ResumeContext.Provider>
  );
}
