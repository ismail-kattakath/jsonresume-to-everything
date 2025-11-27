'use client'

import { useState } from 'react'
import { TbFileSearch } from 'react-icons/tb'
import { MdPictureAsPdf } from 'react-icons/md'
import { HiExternalLink } from 'react-icons/hi'
import { IoClose } from 'react-icons/io5'

interface ATSCheckButtonProps {
  name?: string
}

export default function ATSCheckButton({ name }: ATSCheckButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handlePrintPDF = () => {
    // Convert name to ProperCase without spaces or underscores
    const formatName = (name: string) => {
      return name
        .split(/[\s_-]+/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('')
    }

    if (name) {
      const originalTitle = document.title
      const formattedName = formatName(name)
      document.title = `${formattedName}-Resume`
      window.print()
      setTimeout(() => {
        document.title = originalTitle
      }, 100)
    } else {
      window.print()
    }
  }

  const handleOpenResumeGo = () => {
    window.open('https://www.resumego.net/resume-checker/', '_blank')
  }

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        aria-label="Check ATS Score"
        className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-[1.02] hover:from-amber-600 hover:to-orange-600 hover:shadow-xl focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none active:scale-[0.98]"
      >
        <TbFileSearch className="text-lg transition-transform group-hover:scale-110" />
        <span>ATS Score</span>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div className="animate-in fade-in zoom-in-95 relative w-full max-w-md rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6 shadow-2xl duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close modal"
            >
              <IoClose className="h-5 w-5" />
            </button>

            {/* Header */}
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg">
                <TbFileSearch className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Check ATS Score
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  See how well your resume performs with Applicant Tracking
                  Systems
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
                  1
                </div>
                <div>
                  <p className="font-medium text-white">Save as PDF</p>
                  <p className="text-sm text-white/50">
                    Download your resume using the button below
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
                  2
                </div>
                <div>
                  <p className="font-medium text-white">Upload to ResumeGo</p>
                  <p className="text-sm text-white/50">
                    Free ATS checker used by 500K+ job seekers
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-400">
                  3
                </div>
                <div>
                  <p className="font-medium text-white">Review &amp; improve</p>
                  <p className="text-sm text-white/50">
                    Get suggestions to optimize your resume
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handlePrintPDF}
                className="group/btn inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                <MdPictureAsPdf className="text-lg transition-transform group-hover/btn:scale-110" />
                <span>Save as PDF</span>
              </button>

              <button
                onClick={handleOpenResumeGo}
                className="group/btn inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                <span>Open ResumeGo</span>
                <HiExternalLink className="text-lg transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
              </button>
            </div>

            {/* Footer note */}
            <p className="mt-4 text-center text-xs text-white/40">
              ResumeGo is a free third-party service
            </p>
          </div>
        </div>
      )}
    </>
  )
}
