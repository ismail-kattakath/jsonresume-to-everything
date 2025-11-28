import { useState, useEffect } from 'react'

/**
 * Custom hook to calculate preview scaling factor for mobile viewports
 * Ensures A4/Letter-sized preview (8.5in = 816px) fits mobile screens
 *
 * @returns Object containing scale factor and whether scaling is active
 */
export function usePreviewScaling() {
  const [scale, setScale] = useState(1)
  const [isScaling, setIsScaling] = useState(false)

  useEffect(() => {
    const calculateScale = () => {
      // Preview base width in pixels (8.5 inches = 816px)
      const PREVIEW_BASE_WIDTH = 816

      // Get viewport width
      const viewportWidth = window.innerWidth

      // Only scale on mobile (below md breakpoint: 768px)
      if (viewportWidth < 768) {
        // Calculate scale factor with padding (leave 32px total horizontal padding)
        const availableWidth = viewportWidth - 32
        const scaleFactor = Math.min(availableWidth / PREVIEW_BASE_WIDTH, 1)

        setScale(scaleFactor)
        setIsScaling(true)
      } else {
        setScale(1)
        setIsScaling(false)
      }
    }

    // Calculate on mount
    calculateScale()

    // Recalculate on window resize
    window.addEventListener('resize', calculateScale)
    return () => window.removeEventListener('resize', calculateScale)
  }, [])

  return { scale, isScaling }
}
