import {
  stripProtocol,
  ensureProtocol,
  formatUrl,
  normalizeUrlForDisplay,
  normalizeUrlForExternal,
} from '@/lib/utils/urlHelpers'

describe('urlHelpers', () => {
  describe('stripProtocol', () => {
    it('removes http:// protocol', () => {
      expect(stripProtocol('http://example.com')).toBe('example.com')
    })

    it('removes https:// protocol', () => {
      expect(stripProtocol('https://example.com')).toBe('example.com')
    })

    it('returns the same string if no protocol is present', () => {
      expect(stripProtocol('example.com')).toBe('example.com')
    })

    it('returns empty string for null or empty input', () => {
      expect(stripProtocol('')).toBe('')
      expect(stripProtocol(null as any)).toBe('')
    })
  })

  describe('ensureProtocol', () => {
    it('adds https:// by default if no protocol present', () => {
      expect(ensureProtocol('example.com')).toBe('https://example.com')
    })

    it('preserves existing http:// protocol', () => {
      expect(ensureProtocol('http://example.com')).toBe('http://example.com')
    })

    it('preserves existing https:// protocol', () => {
      expect(ensureProtocol('https://example.com')).toBe('https://example.com')
    })

    it('allows specifying custom protocol', () => {
      expect(ensureProtocol('example.com', 'http')).toBe('http://example.com')
    })

    it('returns empty string for null or empty input', () => {
      expect(ensureProtocol('')).toBe('')
      expect(ensureProtocol(null as any)).toBe('')
    })
  })

  describe('formatUrl', () => {
    it('adds http:// protocol (legacy behavior)', () => {
      expect(formatUrl('example.com')).toBe('http://example.com')
      expect(formatUrl('https://example.com')).toBe('https://example.com')
    })
  })

  describe('normalizeUrlForDisplay', () => {
    it('strips protocol correctly', () => {
      expect(normalizeUrlForDisplay('https://example.com')).toBe('example.com')
    })
  })

  describe('normalizeUrlForExternal', () => {
    it('ensures https:// protocol correctly', () => {
      expect(normalizeUrlForExternal('example.com')).toBe('https://example.com')
    })
  })
})
