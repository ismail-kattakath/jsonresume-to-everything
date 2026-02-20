import { cn } from '@/lib/utils/cn'
import { formatUrl } from '@/lib/utils/formatUrl'

describe('Utils - cn (Tailwind class merger)', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
  })

  it('should handle conditional classes', () => {
    expect(cn('base-class', false && 'conditional-class')).toBe('base-class')
    expect(cn('base-class', true && 'conditional-class')).toBe('base-class conditional-class')
  })

  it('should merge conflicting Tailwind classes correctly', () => {
    // twMerge should keep the last class when there's a conflict
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('p-4', 'p-8')).toBe('p-8')
  })

  it('should handle undefined and null values', () => {
    expect(cn('base-class', undefined, null)).toBe('base-class')
  })

  it('should handle arrays', () => {
    expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500')
  })

  it('should handle empty input', () => {
    expect(cn()).toBe('')
  })

  it('should handle objects with boolean values', () => {
    expect(
      cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'p-4': true,
      })
    ).toBe('text-red-500 p-4')
  })
})

describe('Utils - formatUrl', () => {
  it('should return empty string for empty input', () => {
    expect(formatUrl('')).toBe('')
  })

  it('should not modify URLs with http protocol', () => {
    expect(formatUrl('http://example.com')).toBe('http://example.com')
  })

  it('should not modify URLs with https protocol', () => {
    expect(formatUrl('https://example.com')).toBe('https://example.com')
  })

  it('should add http:// to URLs without protocol', () => {
    expect(formatUrl('example.com')).toBe('http://example.com')
    expect(formatUrl('www.example.com')).toBe('http://www.example.com')
  })

  it('should handle URLs with paths', () => {
    expect(formatUrl('example.com/path/to/page')).toBe('http://example.com/path/to/page')
  })

  it('should handle URLs with query parameters', () => {
    expect(formatUrl('example.com?query=value')).toBe('http://example.com?query=value')
  })

  it('should handle URLs with ports', () => {
    expect(formatUrl('localhost:3000')).toBe('http://localhost:3000')
  })
})
