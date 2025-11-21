import React, { useContext, useState } from "react";
import { ResumeContext } from "@/lib/contexts/DocumentContext";
import { Sparkles } from "lucide-react";
import AIGenerateSummaryModal from "./AIGenerateSummaryModal";

const Summary = () => {
  const { resumeData, setResumeData, handleChange } = useContext(ResumeContext);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleToggleSummary = (e) => {
    setResumeData({ ...resumeData, showSummary: e.target.checked });
  };

  const handleGenerate = (generatedSummary: string) => {
    setResumeData({ ...resumeData, summary: generatedSummary });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
          <h2 className="text-lg text-white font-semibold">Professional Summary</h2>
        </div>
        <label className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-white/10">
          <input
            type="checkbox"
            id="showSummary"
            checked={resumeData.showSummary}
            onChange={handleToggleSummary}
            className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
          />
          <span className="text-sm text-white/90">Display Section</span>
        </label>
      </div>
      <div className="flex flex-col">
        <div className="floating-label-group">
          <textarea
            placeholder="Write a compelling professional summary highlighting your key strengths, experience, and career objectives..."
            name="summary"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-t-lg rounded-b-none text-sm border border-white/20 border-b-0 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all resize-y min-h-[160px] placeholder:text-white/30 leading-relaxed"
            value={resumeData.summary}
            onChange={handleChange}
            maxLength="2000"
          />
          <label className="floating-label">Professional Summary</label>
          <div className="absolute top-3 right-3 px-3 py-1 bg-white/5 rounded-lg text-xs text-white/50 pointer-events-none">
            {resumeData.summary.length}/2000
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

      <AIGenerateSummaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={handleGenerate}
        resumeData={resumeData}
      />
    </div>
  );
};

export default Summary;
