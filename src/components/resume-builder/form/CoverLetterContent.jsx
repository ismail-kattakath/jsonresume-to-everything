import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";

const CoverLetterContent = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);

  const handleContentChange = (e) => {
    setResumeData({ ...resumeData, content: e.target.value });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
        <h2 className="text-lg text-white font-semibold">Cover Letter Content</h2>
      </div>
      <div className="relative group">
        <textarea
          placeholder="Write your compelling cover letter here...

Tip: Highlight your relevant experience, explain why you're excited about this opportunity, and show how your skills align with the role."
          name="content"
          rows={18}
          className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-green-400 focus:ring-2 focus:ring-green-400/20 outline-none transition-all resize-y min-h-[300px] placeholder:text-white/30 leading-relaxed"
          value={resumeData.content || ""}
          onChange={handleContentChange}
        />
        <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/5 rounded-lg text-xs text-white/50 pointer-events-none">
          {(resumeData.content || "").length} characters
        </div>
      </div>
    </div>
  );
};

export default CoverLetterContent;
