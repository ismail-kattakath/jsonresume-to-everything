import React, { ChangeEvent } from 'react'
import { FormVariant, variantClasses } from '@/lib/utils/formVariants'

export type { FormVariant }

interface FormSelectOption {
  value: string
  label: string
  description?: string
}

interface FormSelectProps {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  options: FormSelectOption[]
  name: string
  variant?: FormVariant
  className?: string
  helpText?: string
}

/**
 * Reusable form select component with floating label pattern
 * Matches FormInput styling for consistency
 */
export function FormSelect({
  label,
  value,
  onChange,
  options,
  name,
  variant = 'teal',
  className = '',
  helpText,
}: FormSelectProps) {
  const selectId = `select-${name}`

  return (
    <div className="space-y-1">
      <div className={`floating-label-group ${className}`}>
        <select
          id={selectId}
          name={name}
          aria-label={label}
          className={`form-select w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 pr-10 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:ring-2 ${variantClasses[variant]} cursor-pointer appearance-none`}
          value={value}
          onChange={onChange}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-gray-900 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        <label htmlFor={selectId} className="floating-label">
          {label}
        </label>
      </div>
      {helpText && (
        <p className="text-xs text-white/50" id={`${selectId}-help`}>
          {helpText}
        </p>
      )}
    </div>
  )
}
