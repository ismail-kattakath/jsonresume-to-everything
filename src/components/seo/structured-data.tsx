import Script from 'next/script'

interface StructuredDataProps {
  data: object
}

/**
 * StructuredData Component
 * Renders JSON-LD structured data for SEO
 * Helps search engines understand page content and context
 */
export function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
      strategy="beforeInteractive"
    />
  )
}
