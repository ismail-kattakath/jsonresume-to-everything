import { jest } from '@jest/globals'

/**
 * Jest mock for @ismail-kattakath/mediapipe-react/genai subpath.
 * The real package spawns a Web Worker using import.meta.url, which Jest cannot process.
 *
 * This mock provides a controllable useLlm hook for tests:
 * - Default: progress=100, not loading, empty output
 * - Tests can override by re-mocking: jest.mock('.../genai') with custom return values
 */
export const useLlm = jest.fn(() => ({
  generate: jest.fn(),
  output: '',
  isLoading: false,
  progress: 100,
  error: null,
}))
