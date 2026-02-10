import React from 'react'

interface HighlightProps {
  text: string
  keywords: string
  className?: string
  isHTML?: boolean
}

/**
 * A component that highlights specific keywords within a text string.
 * It splits the text by keywords and wraps matches in a <mark> tag.
 * If isHTML is true, it avoids highlighting within HTML tags.
 */
export const Highlight: React.FC<
  HighlightProps & React.HTMLAttributes<HTMLSpanElement>
> = ({ text, keywords, className = '', isHTML = false, ...props }) => {
  if (!text) return null
  if (!keywords || !keywords.trim()) {
    return isHTML ? (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
        {...props}
      />
    ) : (
      <span className={className} {...props}>
        {text}
      </span>
    )
  }

  // Split keywords by comma and clean up
  const keywordArray = keywords
    .split(',')
    .map((k) => k.trim())
    .filter((k) => k.length > 0)

  if (keywordArray.length === 0) {
    return isHTML ? (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
        {...props}
      />
    ) : (
      <span className={className} {...props}>
        {text}
      </span>
    )
  }

  // Escape special characters and create a regex with lookarounds for whole word matching
  const escapedKeywords = keywordArray
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  const regex = new RegExp(`(?<!\\w)(${escapedKeywords})(?!\\w)`, 'gi')

  if (isHTML) {
    // Split by HTML tags to avoid highlighting inside them
    const tagRegex = /(<[^>]+>)/g
    const parts = text.split(tagRegex)

    const highlightedHTML = parts
      .map((part) => {
        if (part.startsWith('<') && part.endsWith('>')) {
          return part // It's a tag, return as is
        }
        // It's text, highlight keywords
        return part.replace(regex, (match) => {
          return `<mark class="rounded bg-yellow-200/50 px-0.5 text-black">${match}</mark>`
        })
      })
      .join('')

    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: highlightedHTML }}
        {...props}
      />
    )
  }

  // Plain text mode: Split text by the regex matches
  const parts = text.split(regex)

  return (
    <span className={className} {...props}>
      {parts.map((part, i) => {
        const isMatch = keywordArray.some(
          (k) => k.toLowerCase() === part.toLowerCase()
        )

        return isMatch ? (
          <mark key={i} className="rounded bg-yellow-200/50 px-0.5 text-black">
            {part}
          </mark>
        ) : (
          part
        )
      })}
    </span>
  )
}

export default Highlight
