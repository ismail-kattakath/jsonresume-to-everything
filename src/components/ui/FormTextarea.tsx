import React, { ChangeEvent } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import AIActionButton from './AIActionButton'
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
  rows?: number
  className?: string
  helpText?: string
  onAIAction?: () => void
  isAILoading?: boolean
  aiButtonTitle?: string
  isAIConfigured?: boolean
  aiShowLabel?: boolean
  aiVariant?: 'blue' | 'amber' | 'green'
  disabled?: boolean
  aiDisabled?: boolean
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
  showCounter = false,
  minHeight = '100px',
  rows,
  className = '',
  helpText,
  onAIAction,
  isAILoading,
  aiButtonTitle = 'Generate by JD',
  isAIConfigured = true,
  aiShowLabel = false,
  aiVariant = 'blue',
  disabled = false,
  aiDisabled = false,
}: FormTextareaProps) {
  const textareaId = `textarea-${name}`

  /* istanbul ignore next */
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const [scrollbarWidth, setScrollbarWidth] = React.useState(0)

  React.useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const checkScrollbar = () => {
      const width = textarea.offsetWidth - textarea.clientWidth
      setScrollbarWidth(width)
    }

    // Check initially and on value changes
    checkScrollbar()

    // Check on resize using ResizeObserver
    const resizeObserver = new ResizeObserver(() => {
      checkScrollbar()
    })

    resizeObserver.observe(textarea)

    return () => {
      resizeObserver.disconnect()
    }
  }, [value]) // Re-run when value changes as it might trigger scrollbar

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="floating-label-group">
        <textarea
          ref={textareaRef}
          id={textareaId}
          placeholder={placeholder || label}
          name={name}
          aria-label={label}
          className={`w-full resize-y rounded-lg border border-white/20 bg-white/10 px-3 py-2 pb-12 text-sm leading-relaxed text-white transition-all outline-none placeholder:text-white/30 ${variantClasses[variant]} disabled:cursor-not-allowed disabled:opacity-50`}
          style={{ minHeight }}
          value={value}
          onChange={onChange}
          maxLength={maxLength}
          rows={rows}
          disabled={disabled || isAILoading}
        />
        <label htmlFor={textareaId} className="floating-label">
          {label}
        </label>
        {showCounter && (
          <div
            className={`pointer-events-none absolute right-3 bottom-[18px] rounded bg-white/5 px-2 py-1 text-xs text-white/50 ${onAIAction ? 'mr-10' : ''}`}
          >
            {maxLength ? `${(value || '').length}/${maxLength}` : `${(value || '').length} chars`}
          </div>
        )}
        {onAIAction && (
          /* DO NOT CHANGE: This positioning (bottom-4, right-8+scrollbar) is the user-confirmed "sweet spot". */
          <div className="absolute bottom-4 transition-all duration-200" style={{ right: `${8 + scrollbarWidth}px` }}>
            <AIActionButton
              isConfigured={isAIConfigured}
              isLoading={!!isAILoading}
              isDisabled={disabled || aiDisabled}
              onClick={onAIAction}
              label={aiButtonTitle}
              showLabel={aiShowLabel}
              size="sm"
              variant={aiVariant}
            />
          </div>
        )}
      </div>
      {helpText && <p className="text-xs text-white/50">{helpText}</p>}
    </div>
  )
}
