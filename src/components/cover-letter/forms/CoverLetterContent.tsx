import React, { useContext, useState } from "react";
import { ResumeContext } from "@/lib/contexts/DocumentContext";
import { Sparkles } from "lucide-react";
import AIGenerateModal from "./AIGenerateModal";

const CoverLetterContent = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleContentChange = (e) => {
    setResumeData({ ...resumeData, content: e.target.value });
  };

  const handleGenerate = (generatedContent: string) => {
    setResumeData({ ...resumeData, content: generatedContent });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
        <h2 className="text-lg text-white font-semibold">Cover Letter Content</h2>
      </div>
      <div className="flex flex-col">
        <div className="floating-label-group">
          <textarea
            placeholder="Write your compelling cover letter here...

Tip: Highlight your relevant experience, explain why you're excited about this opportunity, and show how your skills align with the role."
            name="content"
            rows={18}
            className="w-full px-4 py-3 bg-white/10 text-white rounded-t-lg rounded-b-none text-sm border border-white/20 border-b-0 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all resize-y min-h-[300px] placeholder:text-white/30 leading-relaxed"
            value={resumeData.content || ""}
            onChange={handleContentChange}
          />
          <label className="floating-label">Cover Letter Content</label>
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/5 rounded-lg text-xs text-white/50 pointer-events-none">
            {(resumeData.content || "").length} characters
          </div>
        </div>

        {/* Generate with AI Button - Connected to textarea bottom */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-t-none rounded-b-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl group border border-white/20 border-t-0"
        >
          <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span>Generate with AI</span>
        </button>
      </div>

      {/* AI Generation Modal */}
      <AIGenerateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
        resumeData={resumeData}
      />
    </div>
  );
};

export default CoverLetterContent;
