/**
 * Formats a URL by adding http:// protocol if not already present
 * Re-exports from urlHelpers for backward compatibility
 *
 * @deprecated Use ensureProtocol from @/lib/utils/urlHelpers instead
 * @param url - The URL to format
 * @returns The formatted URL with protocol
 */
export { formatUrl } from './urlHelpers'
