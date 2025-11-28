import React from 'react'
import { usePreviewScaling } from '@/hooks/usePreviewScaling'

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
export default function ScaledPreviewWrapper({
  children,
}: ScaledPreviewWrapperProps) {
  const { scale, isScaling } = usePreviewScaling()

  if (!isScaling) {
    // On desktop (≥768px), render children without scaling
    return <>{children}</>
  }

  // On mobile (<768px), apply transform scaling
  return (
    <div
      className="w-full overflow-x-hidden"
      style={{
        // Container height needs to match scaled content height
        // Base height ~11in (1056px) × scale factor
        minHeight: `${1056 * scale}px`,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          // Maintain original width for accurate scaling
          width: '816px',
        }}
      >
        {children}
      </div>
    </div>
  )
}
