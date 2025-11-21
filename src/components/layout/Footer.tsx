'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Globe, Heart, Sparkles, ArrowUp } from 'lucide-react'
import { contactInfo } from '@/lib/data/portfolio'
import DefaultResumeData from '@/components/resume-builder/utility/DefaultResumeData'
import { Logo } from '@/components/Logo'
import { navItems } from '@/config/navigation'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  // Extract first sentence from summary
  const firstSentence = DefaultResumeData.summary.split('.')[0] + '.'

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative backdrop-blur-md bg-[var(--md-sys-color-surface-container)]/60 border-t border-[var(--md-sys-color-outline-variant)]/30 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--md-sys-color-primary)]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[var(--md-sys-color-tertiary)]/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="mb-6">
              <motion.div
                className="w-48 h-27 mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <Logo width={192} height={108} fill="var(--md-sys-color-primary)" />
              </motion.div>
              <h3 className="md3-title-large font-semibold mb-2 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] bg-clip-text text-transparent">
                {DefaultResumeData.position}
              </h3>
            </div>
            <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-6 max-w-md leading-relaxed">
              {firstSentence}
            </p>

            {/* Social Links with gradient backgrounds */}
            <div className="flex gap-3">
              <motion.a
                href={`https://${contactInfo.github}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 rounded-xl overflow-hidden group"
                aria-label="GitHub"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <Github size={20} className="relative text-white" />
              </motion.a>

              <motion.a
                href={`https://${contactInfo.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 rounded-xl overflow-hidden group"
                aria-label="LinkedIn"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <Linkedin size={20} className="relative text-white" />
              </motion.a>

              <motion.a
                href={`mailto:${contactInfo.email}`}
                whileHover={{ scale: 1.1, y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-3 rounded-xl overflow-hidden group"
                aria-label="Email"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <Mail size={20} className="relative text-white" />
              </motion.a>

              {contactInfo.website && (
                <motion.a
                  href={`https://${contactInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-3 rounded-xl overflow-hidden group"
                  aria-label="Website"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-green-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
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
            <div className="flex items-center gap-2 mb-4">
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
                  <button
                    onClick={() => {
                      if (item.href.startsWith('#')) {
                        const element = document.querySelector(item.href)
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' })
                        }
                      } else {
                        window.location.href = item.href
                      }
                    }}
                    className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-0.5 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] transition-all rounded-full"></span>
                    {item.name}
                  </button>
                </motion.li>
              ))}
            </ul>

            {/* Back to top button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full md3-label-medium font-medium shadow-sm hover:shadow-md transition-shadow"
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
          <div className="h-px bg-gradient-to-r from-transparent via-[var(--md-sys-color-primary)] to-transparent mb-8"></div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
              © {currentYear} {contactInfo.name}. All rights reserved.
            </p>

            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2 flex-wrap justify-center">
              <span className="flex items-center gap-1.5">
                Built with <Heart size={14} className="text-red-500 animate-pulse" /> using
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full md3-label-small font-medium">
                Next.js
              </span>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">•</span>
              <span>Hosted on</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] rounded-full md3-label-small font-medium">
                GitHub Pages
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
