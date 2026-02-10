import React, { ChangeEvent } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import AISortButton from './AISortButton'
import { FormVariant, variantClasses } from '@/lib/utils/formVariants'

interface FormTextareaProps {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  name: string
  variant?: FormVariant
  maxLength?: number
  showCounter?: boolean
  minHeight?: string
  className?: string
  helpText?: string
  onAIAction?: () => void
  isAILoading?: boolean
  aiButtonTitle?: string
  isAIConfigured?: boolean
  aiShowLabel?: boolean
  disabled?: boolean
}

/**
 * Reusable form textarea component with floating label pattern
 * Supports character counter and configurable min height
 */
export function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  name,
  variant = 'teal',
  maxLength,
  showCounter = true,
  minHeight = '100px',
  className = '',
  helpText,
  onAIAction,
  isAILoading,
  aiButtonTitle = 'Generate by JD',
  isAIConfigured = true,
  aiShowLabel = false,
  disabled = false,
}: FormTextareaProps) {
  const textareaId = `textarea-${name}`

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="floating-label-group">
        <textarea
          id={textareaId}
          placeholder={placeholder || label}
          name={name}
          aria-label={label}
          className={`w-full resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2 pb-8 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 ${variantClasses[variant]}`}
          style={{ minHeight }}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          disabled={disabled}
        />
        <label htmlFor={textareaId} className="floating-label">
          {label}
        </label>
        {showCounter && (
          <div
            className={`pointer-events-none absolute right-3 bottom-[18px] rounded bg-white/5 px-2 py-1 text-xs text-white/50 ${onAIAction ? 'mr-10' : ''}`}
          >
            {maxLength
              ? `${value.length}/${maxLength}`
              : `${value.length} chars`}
          </div>
        )}
        {onAIAction && (
          <div className="absolute right-3 bottom-[18px]">
            <AISortButton
              isConfigured={isAIConfigured}
              isLoading={!!isAILoading}
              onClick={onAIAction}
              label={aiButtonTitle}
              showLabel={aiShowLabel}
              size="sm"
            />
          </div>
        )}
      </div>
      {helpText && <p className="text-xs text-white/50">{helpText}</p>}
    </div>
  )
}
