import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
const PersonalInformation = ({}) => {
  const { resumeData, handleProfilePicture, handleChange } =
    useContext(ResumeContext)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="h-6 w-1 rounded-full bg-gradient-to-b from-blue-500 to-cyan-500"></div>
        <h2 className="text-lg font-semibold text-white">
          Personal Information
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="floating-label-group">
          <input
            type="text"
            placeholder="Full Name"
            name="name"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            value={resumeData.name}
            onChange={handleChange}
          />
          <label className="floating-label">Full Name</label>
        </div>
        <div className="floating-label-group">
          <input
            type="text"
            placeholder="Job Title"
            name="position"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            value={resumeData.position}
            onChange={handleChange}
          />
          <label className="floating-label">Job Title</label>
        </div>
        <div className="floating-label-group">
          <input
            type="text"
            placeholder="Phone (e.g., +1 (647) 225-2878)"
            name="contactInformation"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            value={resumeData.contactInformation}
            onChange={handleChange}
          />
          <label className="floating-label">Phone</label>
        </div>
        <div className="floating-label-group">
          <input
            type="email"
            placeholder="Email"
            name="email"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            value={resumeData.email}
            onChange={handleChange}
          />
          <label className="floating-label">Email</label>
        </div>
        <div className="floating-label-group md:col-span-2">
          <input
            type="text"
            placeholder="Address"
            name="address"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            value={resumeData.address}
            onChange={handleChange}
          />
          <label className="floating-label">Address</label>
        </div>
        <div className="floating-label-group md:col-span-2">
          <input
            type="file"
            name="profileImage"
            accept="image/*"
            className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-cyan-600 file:px-4 file:py-2 file:text-white file:transition-shadow file:hover:shadow-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            onChange={handleProfilePicture}
            placeholder="Profile Picture"
          />
          <label className="floating-label">Photo</label>
        </div>
      </div>
    </div>
  )
}

export default PersonalInformation
