/**
 * Navigation utility functions that can be easily mocked in tests.
 */

/**
 * Navigates to the specified URL using window.location.assign.
 */
export const navigateTo = (url: string): void => {
  window.location.assign(url)
}
