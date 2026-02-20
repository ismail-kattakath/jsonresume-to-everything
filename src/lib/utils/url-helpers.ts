/**
 * URL manipulation utilities
 * Centralized to maintain consistency across the application
 */

/**
 * Removes http:// or https:// protocol from URL
 * Used when storing URLs in internal format (display-friendly)
 *
 * @param url - URL to strip protocol from
 * @returns URL without protocol
 *
 * @example
 * stripProtocol('https://example.com') // => 'example.com'
 * stripProtocol('http://example.com')  // => 'example.com'
 * stripProtocol('example.com')         // => 'example.com'
 */
export function stripProtocol(url: string): string {
  if (!url) return ''
  return url.replace(/^https?:\/\//, '')
}

/**
 * Adds https:// protocol if not already present
 * Used when exporting URLs to JSON Resume format or external use
 *
 * @param url - URL to ensure has protocol
 * @param protocol - Protocol to add (defaults to 'https')
 * @returns URL with protocol
 *
 * @example
 * ensureProtocol('example.com')         // => 'https://example.com'
 * ensureProtocol('http://example.com')  // => 'http://example.com'
 * ensureProtocol('https://example.com') // => 'https://example.com'
 */
export function ensureProtocol(url: string, protocol: 'http' | 'https' = 'https'): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${protocol}://${url}`
}

/**
 * Formats a URL by adding http:// protocol if not already present
 * Legacy function - kept for backward compatibility with existing formatUrl behavior
 *
 * @param url - The URL to format
 * @returns The formatted URL with protocol (http://)
 *
 * @example
 * formatUrl('example.com')         // => 'http://example.com'
 * formatUrl('https://example.com') // => 'https://example.com'
 */
export function formatUrl(url: string): string {
  return ensureProtocol(url, 'http')
}

/**
 * Normalizes URL for display purposes (removes protocol)
 * Alias for stripProtocol with clearer intent
 *
 * @param url - URL to normalize
 * @returns URL without protocol
 */
export function normalizeUrlForDisplay(url: string): string {
  return stripProtocol(url)
}

/**
 * Normalizes URL for external use (ensures https:// protocol)
 * Alias for ensureProtocol with clearer intent
 *
 * @param url - URL to normalize
 * @returns URL with https:// protocol
 */
export function normalizeUrlForExternal(url: string): string {
  return ensureProtocol(url, 'https')
}
