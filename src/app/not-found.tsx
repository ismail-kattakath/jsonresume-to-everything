'use client'

import { m } from 'framer-motion'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import MainLayout from '@/components/layout/main-layout'
import { Home, ArrowLeft } from 'lucide-react'

/**
 * 404 error page component.
 */
export default function NotFound() {
  return (
    <MainLayout className="min-h-screen bg-[var(--md-sys-color-background)]">
      <Header />

      <main className="flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl text-center"
        >
          {/* 404 Number */}
          <m.h1
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
            className="mb-8 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] bg-clip-text text-9xl font-bold text-transparent md:text-[12rem]"
          >
            404
          </m.h1>

          {/* Message */}
          <m.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="md3-display-small mb-4 text-[var(--md-sys-color-on-surface)]"
          >
            Page Not Found
          </m.h2>

          {/* Action Buttons */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/" className="md3-btn-filled group flex w-full items-center justify-center gap-2 sm:w-auto">
              <Home size={20} className="transition-transform group-hover:-translate-y-0.5" />
              Go Home
            </Link>

            <button
              onClick={() => window.history.back()}
              className="md3-btn-outlined group flex w-full items-center justify-center gap-2 sm:w-auto"
            >
              <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
              Go Back
            </button>
          </m.div>
        </m.div>
      </main>
    </MainLayout>
  )
}
