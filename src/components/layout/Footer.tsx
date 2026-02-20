'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Globe, Heart, Sparkles, ArrowUp } from 'lucide-react'
import { contactInfo } from '@/lib/data/portfolio'
import resumeData from '@/lib/resumeAdapter'
import { Logo } from '@/components/Logo'
import { navItems } from '@/config/navigation'
import { analytics } from '@/lib/analytics'

/**
 * The site-wide footer component containing social links, navigation, and site metadata.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear()

  // Extract first sentence from summary
  const firstSentence = resumeData.summary.split('.')[0] + '.'

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative overflow-hidden border-t border-[var(--md-sys-color-outline-variant)]/30 bg-[var(--md-sys-color-surface-container)]/60 backdrop-blur-md">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-[var(--md-sys-color-primary)]/5 blur-3xl"></div>
      <div className="absolute right-1/4 bottom-0 h-80 w-80 rounded-full bg-[var(--md-sys-color-tertiary)]/5 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16">
        {/* Main Footer Content */}
        <div className="mb-12 grid gap-12 md:grid-cols-3">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="mb-6">
              <motion.button
                onClick={() => window.location.assign('/')}
                className="mb-4 h-27 w-48 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                aria-label="Go to homepage"
                data-testid="logo-button"
              >
                <Logo width={192} height={108} fill="var(--md-sys-color-primary)" />
              </motion.button>
              <h3 className="md3-title-large mb-2 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] bg-clip-text font-semibold text-transparent">
                {resumeData.position}
              </h3>
            </div>
            <p className="md3-body-medium mb-6 max-w-md leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
              {firstSentence}
            </p>

            {/* Social Links with gradient backgrounds */}
            <div className="flex gap-3">
              <motion.a
                href={`https://${contactInfo.github}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.socialMediaClick('github')}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-xl p-3"
                aria-label="GitHub"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-90 transition-opacity group-hover:opacity-100"></div>
                <Github size={20} className="relative text-white" />
              </motion.a>

              <motion.a
                href={`https://${contactInfo.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => analytics.socialMediaClick('linkedin')}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-xl p-3"
                aria-label="LinkedIn"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-90 transition-opacity group-hover:opacity-100"></div>
                <Linkedin size={20} className="relative text-white" />
              </motion.a>

              <motion.a
                href={`mailto:${contactInfo.email}`}
                onClick={() => analytics.contactClick('email')}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="group relative overflow-hidden rounded-xl p-3"
                aria-label="Email"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                <Mail size={20} className="relative text-white" />
              </motion.a>

              {contactInfo.website && (
                <motion.a
                  href={`https://${contactInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden rounded-xl p-3"
                  aria-label="Website"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-green-500 opacity-90 transition-opacity group-hover:opacity-100"></div>
                  <Globe size={20} className="relative text-white" />
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Quick Links with enhanced design */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--md-sys-color-primary)]" />
              <h4 className="md3-title-medium font-semibold text-[var(--md-sys-color-primary)]">Navigate</h4>
            </div>
            <ul className="space-y-3">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  {item.submenu ? (
                    <div className="space-y-2">
                      <div className="md3-body-medium font-semibold text-[var(--md-sys-color-on-surface)]">
                        {item.name}
                      </div>
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.name}
                          onClick={() => {
                            if (subItem.href.startsWith('#')) {
                              const isHomePage = window.location.pathname === '/'
                              if (isHomePage) {
                                const element = document.querySelector(subItem.href)
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth' })
                                }
                              } else {
                                window.location.assign(`/${subItem.href}`)
                              }
                            } else {
                              window.location.assign(subItem.href)
                            }
                          }}
                          className="md3-body-medium group flex w-full cursor-pointer items-center gap-2 pl-4 text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:text-[var(--md-sys-color-primary)]"
                        >
                          <span className="h-0.5 w-0 rounded-full bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] transition-all group-hover:w-3"></span>
                          {subItem.name}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        if (item.href && item.href.startsWith('#')) {
                          const isHomePage = window.location.pathname === '/'
                          if (isHomePage) {
                            const element = document.querySelector(item.href)
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' })
                            }
                          } else {
                            window.location.assign(`/${item.href}`)
                          }
                        } else if (item.href) {
                          window.location.assign(item.href)
                        }
                      }}
                      className="md3-body-medium group flex cursor-pointer items-center gap-2 text-[var(--md-sys-color-on-surface-variant)] transition-colors hover:text-[var(--md-sys-color-primary)]"
                    >
                      <span className="h-0.5 w-0 rounded-full bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] transition-all group-hover:w-3"></span>
                      {item.name}
                    </button>
                  )}
                </motion.li>
              ))}
            </ul>

            {/* Back to top button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="md3-label-medium mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[var(--md-sys-color-primary-container)] px-4 py-2 font-medium text-[var(--md-sys-color-on-primary-container)] shadow-sm transition-shadow hover:shadow-md"
            >
              <ArrowUp size={16} />
              Back to Top
            </motion.button>
          </motion.div>
        </div>

        {/* Enhanced Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
        >
          {/* Gradient divider */}
          <div className="mb-8 h-px bg-gradient-to-r from-transparent via-[var(--md-sys-color-primary)] to-transparent"></div>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="md3-body-small flex items-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
              © {currentYear} {contactInfo.name}. All rights reserved.
            </p>

            <div className="flex flex-col items-center gap-3 md:items-end">
              <p className="md3-body-small flex flex-wrap items-center justify-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
                <span className="flex items-center gap-1.5">
                  Built with <Heart size={14} className="animate-pulse text-red-500" /> using
                </span>
                <span className="md3-label-small inline-flex items-center gap-1 rounded-full bg-[var(--md-sys-color-primary-container)] px-2 py-0.5 font-medium text-[var(--md-sys-color-on-primary-container)]">
                  Next.js
                </span>
                <span className="text-[var(--md-sys-color-on-surface-variant)]">•</span>
                <a
                  href="https://github.com/ismail-kattakath/jsonresume-to-everything"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md3-label-small inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-2 py-0.5 font-medium text-white transition-opacity hover:opacity-90"
                >
                  <Github size={12} />
                  Open Source
                </a>
              </p>
              <div className="md3-body-small flex flex-wrap items-center justify-center gap-2 text-[var(--md-sys-color-on-surface-variant)]">
                <a
                  href="https://github.com/ismail-kattakath/jsonresume-to-everything#customization"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--md-sys-color-primary)]"
                >
                  Edit Template
                </a>
                <span>•</span>
                <a
                  href="https://github.com/ismail-kattakath/jsonresume-to-everything/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--md-sys-color-primary)]"
                >
                  Contribute
                </a>
                <span>•</span>
                <a
                  href="https://github.com/ismail-kattakath/jsonresume-to-everything/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[var(--md-sys-color-primary)]"
                >
                  Report Bug
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
