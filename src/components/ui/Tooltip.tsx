/**
 * Global Tooltip Component
 * Provides accessible tooltips throughout the application using react-tooltip
 *
 * Usage:
 * 1. Import this component once in your layout/page
 * 2. Use data attributes on elements:
 *
 *    <button
 *      data-tooltip-id="app-tooltip"
 *      data-tooltip-content="Your helpful tooltip text"
 *      data-tooltip-place="top"
 *    >
 *      Button
 *    </button>
 *
 * For dynamic content, use state:
 *    <button
 *      data-tooltip-id="app-tooltip"
 *      data-tooltip-content={tooltips.navigation.printButton}
 *    >
 *      Print
 *    </button>
 */

'use client'

import { Tooltip as ReactTooltip } from 'react-tooltip'
import 'react-tooltip/dist/react-tooltip.css'
import { useState, useEffect } from 'react'

export function Tooltip() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if viewport is mobile (< 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Listen for resize
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render tooltip on mobile
  if (isMobile) {
    return null
  }

  return (
    <ReactTooltip
      id="app-tooltip"
      place="top"
      className="z-[10000] max-w-xs rounded-lg !bg-gray-900 !px-3 !py-2 text-sm !text-white shadow-xl"
      classNameArrow="!bg-gray-900"
      opacity={1}
      delayShow={300}
      delayHide={0}
      style={{
        backgroundColor: '#111827',
        color: '#ffffff',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        fontWeight: '400',
        boxShadow:
          '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }}
    />
  )
}

// Optional: Tooltip with custom styling
interface CustomTooltipProps {
  id?: string
  className?: string
  place?: 'top' | 'right' | 'bottom' | 'left'
  delayShow?: number
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error'
}

const variantStyles = {
  default: {
    backgroundColor: '#111827',
    color: '#ffffff',
  },
  info: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
  },
  success: {
    backgroundColor: '#15803d',
    color: '#ffffff',
  },
  warning: {
    backgroundColor: '#ca8a04',
    color: '#ffffff',
  },
  error: {
    backgroundColor: '#b91c1c',
    color: '#ffffff',
  },
}

export function CustomTooltip({
  id = 'custom-tooltip',
  className = '',
  place = 'top',
  delayShow = 300,
  variant = 'default',
}: CustomTooltipProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Don't render tooltip on mobile
  if (isMobile) {
    return null
  }

  const styles = variantStyles[variant]

  return (
    <ReactTooltip
      id={id}
      place={place}
      className={`z-[10000] max-w-xs rounded-lg !px-3 !py-2 text-sm shadow-xl ${className}`}
      opacity={1}
      delayShow={delayShow}
      delayHide={0}
      style={{
        ...styles,
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        fontSize: '0.875rem',
        lineHeight: '1.25rem',
        fontWeight: '400',
        boxShadow:
          '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }}
    />
  )
}
