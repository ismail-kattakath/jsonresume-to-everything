"use client";

import React, { useState, useEffect } from "react";
import "./resume-builder.css";

// Import components
import Language from "@/components/resume-builder/form/Language";
import LoadUnload from "@/components/resume-builder/form/LoadUnload";
import Preview from "@/components/resume-builder/preview/Preview";
import DefaultResumeData from "@/components/resume-builder/utility/DefaultResumeData";
import SocialMedia from "@/components/resume-builder/form/SocialMedia";
import WorkExperience from "@/components/resume-builder/form/WorkExperience";
import Skill from "@/components/resume-builder/form/Skill";
import PersonalInformation from "@/components/resume-builder/form/PersonalInformation";
import Summary from "@/components/resume-builder/form/Summary";
import Education from "@/components/resume-builder/form/Education";
import Certification from "@/components/resume-builder/form/certification";
import { ResumeContext } from "./ResumeContext";

export default function ResumeEditPage() {
  // Resume data
  const [resumeData, setResumeData] = useState(DefaultResumeData);

  // Migrate skills data on mount if needed
  useEffect(() => {
    if (resumeData.skills && resumeData.skills.length > 0) {
      const needsMigration = resumeData.skills.some((skillCategory: any) =>
        skillCategory.skills.some(
          (skill: any) =>
            typeof skill === "string" ||
            ((skill as any).underline !== undefined &&
              skill.highlight === undefined)
        )
      );

      if (needsMigration) {
        const migratedData = {
          ...resumeData,
          skills: resumeData.skills.map((skillCategory: any) => ({
            ...skillCategory,
            skills: skillCategory.skills.map((skill: any) => {
              if (typeof skill === "string") {
                return { text: skill, highlight: false };
              }
              // Handle old 'underline' property
              if (
                (skill as any).underline !== undefined &&
                skill.highlight === undefined
              ) {
                return {
                  text: skill.text,
                  highlight: (skill as any).underline,
                };
              }
              return skill;
            }),
          })),
        };
        setResumeData(migratedData);
      }
    }
  }, []);

  // Profile picture
  const handleProfilePicture = (e: any) => {
    const file = e.target.files[0];

    if (file instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setResumeData({
          ...resumeData,
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
    setResumeData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <>
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData,
          handleProfilePicture,
          handleChange,
        }}
      >
        <div className="flex flex-col md:flex-row md:h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-x-hidden">
          <form className="flex-1 p-4 md:p-6 lg:p-8 exclude-print md:h-screen md:overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/30 space-y-6 md:space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 pb-6 border-b border-white/10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📄</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Resume Editor</h1>
                <p className="text-sm text-white/60">Build your professional resume</p>
              </div>
            </div>

            <LoadUnload />
            <PersonalInformation />
            <SocialMedia />
            <Summary />
            <Education />
            <WorkExperience />
            {resumeData.skills.map((skill, index) => (
              <Skill title={skill.title} key={index} />
            ))}
            <Language />
            <Certification />
          </form>
          <Preview />
        </div>
      </ResumeContext.Provider>
    </>
  );
}
