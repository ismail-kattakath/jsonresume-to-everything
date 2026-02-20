import React from 'react'
import { FormVariant } from './FormInput'

interface SectionHeaderProps {
  title: string
  variant?: FormVariant
  action?: React.ReactNode
  className?: string
}

const gradientClasses: Record<FormVariant, string> = {
  teal: 'from-teal-500 to-cyan-500',
  indigo: 'from-indigo-500 to-purple-500',
  pink: 'from-pink-500 to-rose-500',
  purple: 'from-purple-500 to-pink-500',
  emerald: 'from-emerald-500 to-teal-500',
  violet: 'from-violet-500 to-purple-500',
  blue: 'from-blue-500 to-cyan-500',
  amber: 'from-amber-500 to-orange-500',
}

/**
 * Reusable section header with gradient accent bar
 * Eliminates 8+ instances of header duplication
 * Supports optional action elements (toggle switches, etc.)
 */
export function SectionHeader({ title, variant = 'teal', action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-col justify-between gap-3 sm:flex-row sm:items-center ${className}`}>
      <div className="flex items-center gap-2">
        <div className={`h-6 w-1 rounded-full bg-gradient-to-b ${gradientClasses[variant]}`}></div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {action}
    </div>
  )
}
