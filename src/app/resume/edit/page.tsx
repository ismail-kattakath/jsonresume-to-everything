'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "./resume-builder.css";

// Import components
import Language from "@/components/resume-builder/form/Language";
import FormCP from "@/components/resume-builder/form/FormCP";
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

// Server side rendering false for Print component
const Print = dynamic(() => import("@/components/resume-builder/utility/WinPrint"), {
  ssr: false,
});

export default function ResumeEditPage() {
  // Resume data
  const [resumeData, setResumeData] = useState(DefaultResumeData);

  // Form hide/show
  const [formClose, setFormClose] = useState(false);

  // Migrate skills data on mount if needed
  useEffect(() => {
    if (resumeData.skills && resumeData.skills.length > 0) {
      const needsMigration = resumeData.skills.some((skillCategory: any) =>
        skillCategory.skills.some((skill: any) =>
          typeof skill === "string" ||
          ((skill as any).underline !== undefined && skill.highlight === undefined)
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
              if ((skill as any).underline !== undefined && skill.highlight === undefined) {
                return { text: skill.text, highlight: (skill as any).underline };
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
        setResumeData({ ...resumeData, profilePicture: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Invalid file type");
    }
  };

  const handleChange = (e: any) => {
    setResumeData({ ...resumeData, [e.target.name]: e.target.value });
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
        <div className="f-col gap-4 md:flex-row justify-evenly max-w-7xl md:mx-auto md:h-screen">
          {!formClose && (
            <form className="p-4 bg-[royalblue] exclude-print md:max-w-[40%] md:h-screen md:overflow-y-scroll [&>*:not(:first-child)]:pt-4 [&>*:not(:first-child)]:mt-4 [&>*:not(:first-child)]:border-t [&>*:not(:first-child)]:border-white/30">
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
          )}
          <Preview />
        </div>
        <FormCP formClose={formClose} setFormClose={setFormClose} />
        <Print />
      </ResumeContext.Provider>
    </>
  );
}
