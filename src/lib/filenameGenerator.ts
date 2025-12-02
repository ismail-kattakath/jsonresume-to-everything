/**
 * Utility for generating consistent filenames across PDF and JSON exports
 */

/**
 * Converts a string to PascalCase by removing special characters and capitalizing words
 * @param str - Input string (e.g., "Senior Software Engineer")
 * @returns PascalCase string (e.g., "SeniorSoftwareEngineer")
 */
export function toPascalCase(str: string): string {
  if (!str || typeof str !== 'string') return ''

  return (
    str
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters, keep spaces
      .split(/\s+/) // Split by spaces
      .filter((word) => word.length > 0) // Remove empty strings
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('')
  )
}

/**
 * Generates a consistent filename for exports (PDF and JSON)
 * Format: {PositionTitle}-{FullName}-{DocumentType}.{extension}
 *
 * @param options - Configuration object
 * @param options.name - Full name (e.g., "John Doe")
 * @param options.position - Position title (e.g., "Senior Software Engineer")
 * @param options.documentType - Type of document: 'Resume', 'CoverLetter', or 'Resume.json'
 * @param options.includeDate - Whether to include YYYYMM date prefix (default: false, only for JSON exports)
 * @returns Formatted filename (e.g., "SeniorSoftwareEngineer-JohnDoe-Resume.pdf")
 *
 * @example
 * // PDF Resume
 * generateFilename({
 *   name: "John Doe",
 *   position: "Senior Software Engineer",
 *   documentType: "Resume"
 * })
 * // Returns: "SeniorSoftwareEngineer-JohnDoe-Resume"
 *
 * @example
 * // JSON Resume with date
 * generateFilename({
 *   name: "John Doe",
 *   position: "Senior Software Engineer",
 *   documentType: "Resume.json",
 *   includeDate: true
 * })
 * // Returns: "202412-SeniorSoftwareEngineer-JohnDoe-Resume.json"
 */
export function generateFilename(options: {
  name: string
  position: string
  documentType: 'Resume' | 'CoverLetter' | 'Resume.json'
  includeDate?: boolean
}): string {
  const { name, position, documentType, includeDate = false } = options

  // Convert to PascalCase
  const cleanName = toPascalCase(name)
  const cleanPosition = toPascalCase(position)

  // Build filename parts
  const parts: string[] = []

  // Add date prefix if requested (only for JSON exports)
  if (includeDate) {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, '0')}`
    parts.push(yearMonth)
  }

  // Add position title (at the beginning per requirements)
  if (cleanPosition) {
    parts.push(cleanPosition)
  }

  // Add full name
  if (cleanName) {
    parts.push(cleanName)
  }

  // Add document type
  parts.push(documentType)

  return parts.join('-')
}

/**
 * Generates a filename for PDF exports (used with document.title for print dialog)
 * Format: {PositionTitle}-{FullName}-{DocumentType}
 *
 * @param name - Full name
 * @param position - Position title
 * @param documentType - 'Resume' or 'CoverLetter'
 * @returns Formatted filename for PDF export
 */
export function generatePDFFilename(
  name: string,
  position: string,
  documentType: 'Resume' | 'CoverLetter' = 'Resume'
): string {
  return generateFilename({ name, position, documentType })
}

/**
 * Generates a filename for JSON Resume exports with date prefix
 * Format: YYYYMM-{PositionTitle}-{FullName}-Resume.json
 *
 * @param name - Full name
 * @param position - Position title
 * @returns Formatted filename for JSON export with date prefix
 */
export function generateJSONFilename(name: string, position: string): string {
  return generateFilename({
    name,
    position,
    documentType: 'Resume.json',
    includeDate: true,
  })
}
