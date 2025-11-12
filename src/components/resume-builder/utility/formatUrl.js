/**
 * Formats a URL by adding http:// protocol if not already present
 * @param {string} url - The URL to format
 * @returns {string} - The formatted URL with protocol
 */
export const formatUrl = (url) => {
  if (!url) return '';
  
  // Check if URL already has a protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Add http:// protocol if missing
  return `http://${url}`;
};