'use client'

import React from 'react'

/**
 * Props for the BaseButton component.
 */
export interface BaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Element type to render as (button, label, etc.) */
  as?: 'button' | 'label'
  /** Visual variant */
  variant?:
    | 'gradient-blue'
    | 'gradient-purple'
    | 'gradient-green'
    | 'gradient-amber'
    | 'gradient-red'
    | 'red'
    | 'ghost'
    | 'danger'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Whether button takes full width */
  fullWidth?: boolean
  /** Optional icon to display before children */
  icon?: React.ReactNode
  /** Whether button is in loading state */
  isLoading?: boolean
  /** Custom className to append */
  className?: string
  /** Children content */
  children?: React.ReactNode
}

/**
 * Base button component with standardized styling
 * All buttons in the app should use this component for consistent appearance
 *
 * Standard properties:
 * - Border radius: rounded-lg (0.5rem)
 * - Padding: px-4 py-2 (base size)
 * - Consistent height based on padding
 * - Flexible width (unless fullWidth is true)
 */
export const BaseButton = React.forwardRef<HTMLButtonElement, BaseButtonProps>(
  (
    {
      as: Component = 'button',
      variant = 'gradient-blue',
      size = 'md',
      fullWidth = false,
      icon,
      isLoading = false,
      className = '',
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Size classes - all use rounded-lg for consistency
    const sizeClasses = {
      sm: 'px-3 py-2 text-xs gap-1.5',
      md: 'px-4 py-3 text-sm gap-2',
      lg: 'px-6 py-4 text-base gap-3',
    }[size]

    // Icon size based on button size
    const iconWrapperClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    }[size]

    // Variant classes
    const variantClasses = {
      'gradient-blue':
        'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-md hover:shadow-lg',
      'gradient-purple':
        'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg',
      'gradient-green':
        'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg',
      'gradient-amber':
        'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg',
      'gradient-red':
        'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 shadow-md hover:shadow-lg',
      red: 'bg-red-800 text-white hover:opacity-90',
      ghost: 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80',
      danger: 'text-red-400 hover:bg-red-400/10 hover:text-red-300',
    }[variant]

    const isDisabled = disabled || isLoading

    const combinedClassName = `
      inline-flex items-center justify-center
      rounded-lg
      font-medium
      transition-all duration-200
      cursor-pointer
      ${sizeClasses}
      ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}
      ${variantClasses}
      ${fullWidth ? 'w-full' : ''}
      ${variant.startsWith('gradient') ? 'hover:scale-[1.02] active:scale-[0.98]' : ''}
      ${className}
    `

    const content = (
      <>
        {icon && <span className={iconWrapperClasses}>{icon}</span>}
        {children}
      </>
    )

    if (Component === 'label') {
      return (
        <label className={combinedClassName} {...(props as React.LabelHTMLAttributes<HTMLLabelElement>)}>
          {content}
        </label>
      )
    }

    return (
      <button ref={ref} type={type} disabled={isDisabled} className={combinedClassName} {...props}>
        {content}
      </button>
    )
  }
)

BaseButton.displayName = 'BaseButton'
