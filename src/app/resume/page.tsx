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
    <ResumeContext.Provider value={{ resumeData, setResumeData }}>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Preview />
      </div>
    </ResumeContext.Provider>
  );
}
