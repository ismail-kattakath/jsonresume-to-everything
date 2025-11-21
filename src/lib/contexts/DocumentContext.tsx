'use client';

import { createContext, ChangeEvent } from "react";
import resumeData from "@/lib/resumeAdapter";
import type { ResumeData } from "@/types";

export type DocumentContextType = {
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  handleProfilePicture: (e: ChangeEvent<HTMLInputElement>) => void;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  editable?: boolean;
};

export const DocumentContext = createContext<DocumentContextType>({
  resumeData: resumeData,
  setResumeData: () => {},
  handleProfilePicture: () => {},
  handleChange: () => {},
  editable: true,
});

// Export alias for backward compatibility during migration
export const ResumeContext = DocumentContext;
