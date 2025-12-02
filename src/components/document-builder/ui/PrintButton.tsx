import { MdPictureAsPdf } from 'react-icons/md'
import { generatePDFFilename } from '@/lib/filenameGenerator'

interface PrintButtonProps {
  name?: string
  position?: string
  documentType?: 'Resume' | 'CoverLetter'
}

export default function PrintButton({
  name,
  position,
  documentType = 'Resume',
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

  return (
    <button
      type="button"
      onClick={handlePrint}
      aria-label="Print"
      className="group hover:shadow-3xl inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 text-sm font-medium text-white shadow-2xl transition-all hover:scale-[1.02] hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none active:scale-[0.98] md:px-6"
    >
      <MdPictureAsPdf className="text-lg transition-transform group-hover:scale-110" />
      <span className="hidden md:inline">Print</span>
    </button>
  )
}
