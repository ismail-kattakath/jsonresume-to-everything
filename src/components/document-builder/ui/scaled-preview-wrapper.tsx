import React from 'react'
import { usePreviewScaling } from '@/hooks/use-preview-scaling'

interface ScaledPreviewWrapperProps {
  children: React.ReactNode
}

/**
 * Wrapper component that scales preview content on mobile devices
 * Maintains all aspect ratios while fitting content to viewport
 *
 * Uses CSS transform: scale() to proportionally shrink A4/Letter-sized
 * preview (8.5in × 11in) to fit mobile screens while preserving
 * typography, spacing, and layout proportions
 */
export default function ScaledPreviewWrapper({ children }: ScaledPreviewWrapperProps) {
  const { scale, isScaling } = usePreviewScaling()

  if (!isScaling) {
    // On desktop (≥768px), render children without scaling
    return <>{children}</>
  }

  // On mobile (<768px), apply transform scaling
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <div
        className="print:!w-full print:!transform-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          // Maintain original width for accurate scaling
          width: '816px',
          // Scale the container to its transformed height
          // This prevents blank space by matching container to visual size
          height: `fit-content`,
          // Inline-block makes container collapse to transformed content size
          display: 'inline-block',
        }}
      >
        {children}
      </div>
    </div>
  )
}
