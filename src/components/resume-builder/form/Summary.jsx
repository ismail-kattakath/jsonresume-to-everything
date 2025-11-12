import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
const Summary = () => {
  const { resumeData, setResumeData, handleChange } = useContext(ResumeContext);

  const handleToggleSummary = (e) => {
    setResumeData({ ...resumeData, showSummary: e.target.checked });
  };

  return (
    <div className="flex-col-gap-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h2 className="input-title mb-0">Summary</h2>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showSummary"
            checked={resumeData.showSummary}
            onChange={handleToggleSummary}
            className="w-4 h-4 text-[deepskyblue] bg-gray-100 border-gray-300 rounded focus:ring-fuchsia-500"
          />
          <label
            htmlFor="showSummary"
            className="text-sm text-white cursor-pointer"
          >
            Display Summary Section
          </label>
        </div>
      </div>
      <div className="grid-4">
        <textarea
          placeholder="Summary"
          name="summary"
          className="w-full other-input h-40"
          value={resumeData.summary}
          onChange={handleChange}
          maxLength="500"
        />
      </div>
    </div>
  );
};

export default Summary;
