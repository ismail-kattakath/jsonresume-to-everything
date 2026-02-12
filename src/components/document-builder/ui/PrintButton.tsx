'use client'

import { MdPictureAsPdf, MdContentCopy } from 'react-icons/md'
import { generatePDFFilename } from '@/lib/filenameGenerator'
import { convertResumeToText } from '@/lib/exporters/txtExporter'
import { ResumeData } from '@/types/resume'
import { toast } from 'sonner'

interface PrintButtonProps {
  name?: string
  position?: string
  documentType?: 'Resume' | 'CoverLetter'
  resumeData?: ResumeData
  className?: string
}

export default function PrintButton({
  name,
  position,
  documentType = 'Resume',
  resumeData,
  className,
}: PrintButtonProps) {
  const handlePrint = () => {
    // Set document title for PDF filename
    if (name && position) {
      const originalTitle = document.title
      document.title = generatePDFFilename(name, position, documentType)

      // Use setTimeout to ensure window.print() is called in next tick
      // This prevents issues on mobile browsers where synchronous title
      // manipulation can interfere with the print dialog
      setTimeout(() => {
        window.print()

        // Restore original title after print dialog closes
        setTimeout(() => {
          document.title = originalTitle
        }, 100)
      }, 0)
    } else {
      // Even without title manipulation, use setTimeout for consistency
      setTimeout(() => {
        window.print()
      }, 0)
    }
  }

  const handleCopyText = async () => {
    if (!resumeData) {
      toast.error('No resume data available to copy')
      return
    }

    try {
      const textContent = convertResumeToText(resumeData)
      await navigator.clipboard.writeText(textContent)
      toast.success('Resume copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <div className={`flex rounded-full shadow-2xl ${className || ''}`}>
      {/* Print to PDF Button */}
      <button
        type="button"
        onClick={handlePrint}
        aria-label="Print to PDF"
        className="group inline-flex cursor-pointer items-center gap-2 rounded-l-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none active:scale-[0.98] md:px-6"
      >
        <MdPictureAsPdf className="text-lg transition-transform group-hover:scale-110" />
        <span className="hidden md:inline">Print</span>
      </button>

      {/* Copy to Clipboard Button */}
      <button
        type="button"
        onClick={handleCopyText}
        disabled={!resumeData}
        aria-label="Copy text to clipboard"
        className="group inline-flex cursor-pointer items-center gap-2 rounded-r-full border-l border-purple-700/50 bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:px-6"
      >
        <MdContentCopy className="text-lg transition-transform group-hover:scale-110" />
        <span className="hidden md:inline">Copy</span>
      </button>
    </div>
  )
}
