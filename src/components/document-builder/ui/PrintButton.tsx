import { MdPictureAsPdf } from 'react-icons/md'

interface PrintButtonProps {
  name?: string
  documentType?: 'Resume' | 'CoverLetter'
}

export default function PrintButton({
  name,
  documentType = 'Resume',
}: PrintButtonProps) {
  const handlePrint = () => {
    // Convert name to ProperCase without spaces or underscores
    const formatName = (name: string) => {
      return name
        .split(/[\s_-]+/) // Split by spaces, underscores, or hyphens
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join('')
    }

    // Set document title for PDF filename
    if (name) {
      const originalTitle = document.title
      const formattedName = formatName(name)
      document.title = `${formattedName}-${documentType}`

      // Print
      window.print()

      // Restore original title after print dialog closes
      setTimeout(() => {
        document.title = originalTitle
      }, 100)
    } else {
      window.print()
    }
  }

  return (
    <button
      onClick={handlePrint}
      aria-label="Print"
      className="group hover:shadow-3xl inline-flex animate-pulse cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-medium text-white shadow-2xl transition-all hover:scale-[1.02] hover:animate-none hover:from-purple-700 hover:to-pink-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none active:scale-[0.98]"
      data-tooltip-id="app-tooltip"
      data-tooltip-content="Download as PDF or print your document (opens print dialog)"
      data-tooltip-place="bottom"
    >
      <MdPictureAsPdf className="text-lg transition-transform group-hover:scale-110" />
      <span>Print</span>
    </button>
  )
}
