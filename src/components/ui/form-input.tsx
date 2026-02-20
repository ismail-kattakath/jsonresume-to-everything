import React, { ChangeEvent, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { FormVariant, variantClasses } from '@/lib/utils/form-variants'

export type { FormVariant }

interface FormInputProps {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'email' | 'url' | 'date' | 'tel' | 'password'
  placeholder?: string
  name: string
  variant?: FormVariant
  maxLength?: number
  showCounter?: boolean
  className?: string
  helpText?: React.ReactNode
  disabled?: boolean
}

/**
 * Reusable form input component with floating label pattern
 * Eliminates 40+ instances of duplicated input styling
 * Supports password type with show/hide toggle
 */
export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  name,
  variant = 'teal',
  maxLength,
  showCounter = false,
  className = '',
  helpText,
  disabled,
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  const inputId = `input-${name}`

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="floating-label-group">
        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder || label}
          name={name}
          aria-label={label}
          className={`w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:ring-2 ${isPassword ? 'pr-12' : ''} ${variantClasses[variant]} ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
        />
        <label htmlFor={inputId} className="floating-label">
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            onClick={() => !disabled && setShowPassword(!showPassword)}
            className={`absolute top-1/2 right-3 -translate-y-1/2 text-white/60 transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:text-white'}`}
            disabled={disabled}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {showCounter && maxLength && (
          <div className="pointer-events-none absolute right-2 bottom-2 rounded bg-white/5 px-2 py-1 text-xs text-white/50">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      {helpText && <p className="text-xs text-white/50">{helpText}</p>}
    </div>
  )
}
