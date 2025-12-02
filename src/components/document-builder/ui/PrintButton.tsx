'use client'

import { useState, useRef, useEffect } from 'react'
import { MdPictureAsPdf, MdTextFields, MdArrowDropDown } from 'react-icons/md'
import { generatePDFFilename } from '@/lib/filenameGenerator'
import { downloadResumeAsText } from '@/lib/exporters/txtExporter'
import { ResumeData } from '@/types/resume'

interface PrintButtonProps {
  name?: string
  position?: string
  documentType?: 'Resume' | 'CoverLetter'
  resumeData?: ResumeData
}

export default function PrintButton({
  name,
  position,
  documentType = 'Resume',
  resumeData,
}: PrintButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handlePrint = () => {
    setIsOpen(false)
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

  const handleTextExport = () => {
    setIsOpen(false)
    if (resumeData && name && position) {
      const filename = generatePDFFilename(
        name,
        position,
        documentType
      ).replace('.pdf', '')
      downloadResumeAsText(resumeData, filename)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex rounded-full shadow-2xl">
        {/* Main Print Button */}
        <button
          type="button"
          onClick={handlePrint}
          aria-label="Print to PDF"
          className="group inline-flex cursor-pointer items-center gap-2 rounded-l-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none active:scale-[0.98] md:px-6"
        >
          <MdPictureAsPdf className="text-lg transition-transform group-hover:scale-110" />
          <span className="hidden md:inline">Print</span>
        </button>

        {/* Dropdown Toggle */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Export options"
          aria-expanded={isOpen}
          className="rounded-r-full border-l border-purple-700/50 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-3 text-white transition-all hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none active:scale-[0.98]"
        >
          <MdArrowDropDown
            className={`text-xl transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-white/20 bg-gray-900 shadow-xl">
          <button
            type="button"
            onClick={handleTextExport}
            disabled={!resumeData}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <MdTextFields className="text-lg text-green-400" />
            <span>Export as Text</span>
          </button>
        </div>
      )}
    </div>
  )
}
