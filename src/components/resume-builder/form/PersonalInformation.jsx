import React, { useContext } from "react";
import { ResumeContext } from "@/app/resume/edit/ResumeContext";
const PersonalInformation = ({}) => {
  const { resumeData, setResumeData, handleProfilePicture, handleChange } =
    useContext(ResumeContext);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
        <h2 className="text-lg text-white font-semibold">Personal Information</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-white/40"
            value={resumeData.name}
            onChange={handleChange}
          />
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Job Title"
            name="position"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-white/40"
            value={resumeData.position}
            onChange={handleChange}
          />
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Phone (e.g., +1 (647) 225-2878)"
            name="contactInformation"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-white/40"
            value={resumeData.contactInformation}
            onChange={handleChange}
          />
        </div>
        <div className="relative group">
          <input
            type="email"
            placeholder="Email"
            name="email"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-white/40"
            value={resumeData.email}
            onChange={handleChange}
          />
        </div>
        <div className="relative group md:col-span-2">
          <input
            type="text"
            placeholder="Address"
            name="address"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all placeholder:text-white/40"
            value={resumeData.address}
            onChange={handleChange}
          />
        </div>
        <div className="relative group md:col-span-2">
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            className="w-full px-4 py-3 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 outline-none transition-all file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-cyan-600 file:text-white file:rounded-lg file:px-4 file:py-2 file:mr-3 file:cursor-pointer file:hover:shadow-lg file:transition-shadow"
            onChange={handleProfilePicture}
            placeholder="Profile Picture"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;
