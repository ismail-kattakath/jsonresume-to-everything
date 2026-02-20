import React from 'react'
import { MdDelete } from 'react-icons/md'
import { BaseButton } from './base-button'

interface DeleteButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

/**
 * Reusable delete button with consistent styling
 * Eliminates 15+ instances of delete button duplication
 */
export function DeleteButton({ onClick, label = 'Delete', className = '' }: DeleteButtonProps) {
  return (
    <BaseButton
      type="button"
      onClick={onClick}
      variant="danger"
      size="md"
      icon={<MdDelete className="text-xl" />}
      title={label}
      className={className}
    />
  )
}
