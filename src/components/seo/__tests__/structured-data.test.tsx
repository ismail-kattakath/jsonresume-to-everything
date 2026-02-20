import { StructuredData } from '@/components/seo/structured-data'

// Mock Next.js Script component
jest.mock('next/script', () => {
  return function Script({
    id,
    type,
    dangerouslySetInnerHTML,
  }: {
    id: string
    type: string
    dangerouslySetInnerHTML: { __html: string }
  }) {
    return <script id={id} type={type} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />
  }
})

describe('StructuredData Component', () => {
  it('should render with provided data object', () => {
    const testData = {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Test App',
      description: 'A test application',
    }

    const component = StructuredData({ data: testData })
    expect(component).toBeDefined()
  })

  it('should accept complex nested data structures', () => {
    const complexData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is this?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'This is a test',
          },
        },
      ],
    }

    const component = StructuredData({ data: complexData })
    expect(component).toBeDefined()
  })

  it('should handle empty objects', () => {
    const emptyData = {}

    const component = StructuredData({ data: emptyData })
    expect(component).toBeDefined()
  })

  it('should handle arrays in data', () => {
    const dataWithArray = {
      '@type': 'ItemList',
      itemListElement: ['item1', 'item2', 'item3'],
    }

    const component = StructuredData({ data: dataWithArray })
    expect(component).toBeDefined()
  })

  it('should accept any valid object type', () => {
    const testData = { '@type': 'Thing', name: 'Test' }

    const component = StructuredData({ data: testData })
    expect(component).toBeDefined()
  })

  it('should work with organization schema', () => {
    const testData = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Test Org',
      url: 'https://example.com',
    }

    const component = StructuredData({ data: testData })
    expect(component).toBeDefined()
  })
})
