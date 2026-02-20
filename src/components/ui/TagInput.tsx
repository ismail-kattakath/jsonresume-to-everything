import React, { useState } from 'react'

interface TagInputProps {
  tags: string[]
  onAdd: (tag: string) => void
  onRemove: (index: number) => void
  placeholder?: string
  variant?: 'purple' | 'pink' | 'teal' | 'blue'
}

/**
 * Reusable TagInput component for managing arrays of strings
 * Used for skills, technologies, etc.
 */
const TagInput: React.FC<TagInputProps> = ({
  tags,
  onAdd,
  onRemove,
  placeholder = 'Add item...',
  variant = 'purple',
}) => {
  const [inputValue, setInputValue] = useState('')

  const variantStyles = {
    purple: 'border-purple-400/30 focus:border-purple-400 hover:border-purple-400/50',
    pink: 'border-pink-400/30 focus:border-pink-400 hover:border-pink-400/50',
    teal: 'border-teal-400/30 focus:border-teal-400 hover:border-teal-400/50',
    blue: 'border-blue-400/30 focus:border-blue-400 hover:border-blue-400/50',
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        onAdd(inputValue.trim())
        setInputValue('')
      }
    }
  }

  const handleBlur = () => {
    if (inputValue.trim()) {
      onAdd(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags?.map((tag, index) => (
        <span
          key={`TAG-${index}`}
          className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm text-white"
        >
          {tag}
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="ml-1 cursor-pointer text-white/60 transition-all hover:text-red-400"
            title="Remove"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`rounded-full border border-dashed bg-transparent px-3 py-1 text-sm text-white outline-none placeholder:text-white/40 ${variantStyles[variant]}`}
      />
    </div>
  )
}

export default TagInput
