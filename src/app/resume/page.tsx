"use client";

import { useEffect, useState } from "react";
import Preview from "@/components/resume/preview/Preview";
import { ResumeContext } from "@/lib/contexts/DocumentContext";
import defaultResumeData from "@/lib/resumeAdapter";
import PrintButton from "@/components/document-builder/ui/PrintButton";
import "@/styles/document-builder.css";
import "@/styles/resume-preview.css";

export default function ResumeDownloadPage() {
  const [resumeData, setResumeData] = useState(defaultResumeData);

  useEffect(() => {
    // Load resume data from localStorage if available
    const storedData = localStorage.getItem("resumeData");
    if (storedData) {
      setResumeData(JSON.parse(storedData));
    }

    // Auto-trigger print dialog after a short delay
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
        editable: false,
      }}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 print:bg-white">
        {/* Floating Print Button - Hidden on print */}
        <div className="exclude-print fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 md:top-auto md:left-auto md:bottom-8 md:right-8 md:translate-x-0 md:translate-y-0 z-50">
          <PrintButton />
        </div>

        {/* Resume Content */}
        <div className="py-8 px-4 flex items-start justify-center min-h-screen print:py-0 print:px-0">
          <div className="w-full max-w-4xl">
            <Preview />
          </div>
        </div>
      </div>
    </ResumeContext.Provider>
  );
}
