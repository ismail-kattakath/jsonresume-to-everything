"use client";

import React, { useState, useEffect } from "react";
import "./cover-letter-builder.css";

// Import ORIGINAL resume components
import LoadUnload from "@/components/resume-builder/form/LoadUnload";
import CoverLetterPreview from "@/components/resume-builder/preview/CoverLetterPreview";
import DefaultResumeData from "@/components/resume-builder/utility/DefaultResumeData";
import SocialMedia from "@/components/resume-builder/form/SocialMedia";
import PersonalInformation from "@/components/resume-builder/form/PersonalInformation";
import CoverLetterContent from "@/components/resume-builder/form/CoverLetterContent";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";

// Default cover letter content
const DEFAULT_COVER_LETTER_CONTENT = "I'm a Toronto-based Principal Software Engineer with 7+ years delivering production-ready full-stack applications using React, React Native, Node.js, and MongoDB—the exact stack you're seeking. At Homewood Health, I transformed an abandoned MEAN application into a nationally-deployed platform serving 100,000+ users with 99.5% uptime, implemented enterprise OAuth/SAML authentication, and led the AngularJS-to-Next.js migration while reducing deployment time by 92%. My experience architecting REST APIs with Express.js, integrating external SDKs, implementing security protocols, and managing agile sprints directly aligns with your requirements. Having built FDA-compliant healthcare systems and worked with cross-functional teams across multiple countries, I understand the rigorous standards and fast-paced environment of innovative startups like Speer. I'm excited to leverage my proven track record in building scalable, testable code to help deliver your groundbreaking technologies—let's discuss how I can contribute to your mission this week.";

export default function CoverLetterEditPage() {
  // Use resume data as base, just add content and hide unwanted sections
  const [coverLetterData, setCoverLetterData] = useState({
    ...DefaultResumeData,
    content: DEFAULT_COVER_LETTER_CONTENT,
    // Hide sections not needed for cover letter
    summary: "",
    showSummary: false,
    education: [],
    workExperience: [],
    skills: [],
    languages: [],
    showLanguages: false,
    certifications: [],
  });

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem("coverLetterData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setCoverLetterData(parsedData);
      } catch (error) {
        console.error("Error loading saved data:", error);
      }
    }
  }, []);

  // Profile picture
  const handleProfilePicture = (e: any) => {
    const file = e.target.files[0];

    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverLetterData({
          ...coverLetterData,
          profilePicture: event.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid file type");
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setCoverLetterData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <>
      {/* Use ResumeContext so original components work unchanged */}
      <ResumeContext.Provider
        value={{
          resumeData: coverLetterData,
          setResumeData: setCoverLetterData,
          handleProfilePicture,
          handleChange,
        }}
      >
        <div className="flex flex-col md:flex-row md:h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-x-hidden">
          <form className="flex-1 p-4 md:p-6 lg:p-8 exclude-print md:h-screen md:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 pb-6 border-b border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">✉️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Cover Letter Editor</h1>
                <p className="text-sm text-white/60">Create your perfect cover letter</p>
              </div>
            </div>

            <LoadUnload />
            <PersonalInformation />
            <SocialMedia />
            <CoverLetterContent />
          </form>
          <CoverLetterPreview />
        </div>
      </ResumeContext.Provider>
    </>
  );
}
