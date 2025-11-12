'use client';

import { createContext } from "react";
import DefaultResumeData from "@/components/resume-builder/utility/DefaultResumeData";

export const ResumeContext = createContext(DefaultResumeData);
