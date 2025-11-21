import { Dispatch, SetStateAction, ChangeEvent } from "react";
import type { ResumeData } from "@/types";

export const useDocumentHandlers = (
  resumeData: ResumeData,
  setResumeData: Dispatch<SetStateAction<ResumeData>>
) => {
  const handleProfilePicture = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

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

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData((prevData) => ({ ...prevData, [name]: value }));
  };

  return {
    handleProfilePicture,
    handleChange,
  };
};
