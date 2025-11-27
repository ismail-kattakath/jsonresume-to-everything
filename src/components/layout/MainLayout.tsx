'use client'

import Footer from '@/components/layout/Footer'

interface MainLayoutProps {
  children: React.ReactNode
  /** Whether to show the footer. Defaults to true. */
  showFooter?: boolean
  /** Whether to hide footer when printing. Useful for document editors. Defaults to false. */
  excludeFooterFromPrint?: boolean
  /** Additional class names for the wrapper div */
  className?: string
}

/**
 * Main layout component that provides consistent page structure with Footer.
 * Use this component to wrap page content that should include the footer.
 *
 * @example
 * // With footer (default)
 * <MainLayout>
 *   <Header />
 *   <main>...</main>
 * </MainLayout>
 *
 * @example
 * // Without footer
 * <MainLayout showFooter={false}>
 *   <main>...</main>
 * </MainLayout>
 *
 * @example
 * // With footer hidden on print (for document editors)
 * <MainLayout excludeFooterFromPrint>
 *   <main>...</main>
 * </MainLayout>
 */
export default function MainLayout({
  children,
  showFooter = true,
  excludeFooterFromPrint = false,
  className = 'min-h-screen',
}: MainLayoutProps) {
  return (
    <div className={className}>
      {children}
      {showFooter &&
        (excludeFooterFromPrint ? (
          <div className="exclude-print">
            <Footer />
          </div>
        ) : (
          <Footer />
        ))}
    </div>
  )
}
