'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Zap, Globe } from 'lucide-react'
import { contactInfo } from '@/lib/data/portfolio'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="backdrop-blur-md bg-[var(--md-sys-color-surface-container)]/60 border-t border-[var(--md-sys-color-outline-variant)]/30">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <img 
              src="./images/profile.jpg" 
              alt="Ismail Kattakath"
              className="w-12 h-12 rounded-full object-cover"
              style={{
                border: '2px solid var(--md-sys-color-primary)',
              }}
            />
              <h3 className="md3-title-large">{contactInfo.name}</h3>
            </div>
            <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-6 max-w-md leading-relaxed">
              {contactInfo.title} passionate about building innovative AI solutions
              and scalable architectures. Based in {contactInfo.location}
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <motion.a
                href={`https://${contactInfo.github}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-primary-container)] transition-all"
                aria-label="GitHub"
              >
                <Github size={20} className="text-[var(--md-sys-color-on-surface)]" />
              </motion.a>
              <motion.a
                href={`https://${contactInfo.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-primary-container)] transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} className="text-[var(--md-sys-color-on-surface)]" />
              </motion.a>
              <motion.a
                href={`mailto:${contactInfo.email}`}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-primary-container)] transition-all"
                aria-label="Email"
              >
                <Mail size={20} className="text-[var(--md-sys-color-on-surface)]" />
              </motion.a>
              {contactInfo.website && (
                <motion.a
                  href={`https://${contactInfo.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-3 rounded-xl bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-primary-container)] transition-all"
                  aria-label="Website"
                >
                  <Globe size={20} className="text-[var(--md-sys-color-on-surface)]" />
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="md3-title-medium mb-4 text-[var(--md-sys-color-primary)]">Navigate</h4>
            <ul className="space-y-3">
              {[
                { name: 'About', href: '#about' },
                { name: 'Skills', href: '#skills' },
                { name: 'Experience', href: '#experience' },
                { name: 'Projects', href: '#projects' },
                { name: 'Contact', href: '#contact' },
              ].map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => {
                      const element = document.querySelector(item.href)
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-[var(--md-sys-color-primary)] transition-all"></span>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Specializations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="md3-title-medium mb-4 text-[var(--md-sys-color-primary)]">Expertise</h4>
            <div className="flex flex-wrap gap-2">
              {['AI/ML', 'Full-Stack', 'Cloud', 'DevOps'].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] rounded-lg md3-label-medium hover:bg-[var(--md-sys-color-primary-container)] hover:text-[var(--md-sys-color-primary)] transition-all cursor-default"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-[var(--md-sys-color-outline-variant)]/30 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)]">
              © {currentYear} {contactInfo.name}. All rights reserved.
            </p>
            <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-2">
              Built with <span className="text-[var(--md-sys-color-primary)]">Next.js</span>
              <span className="text-[var(--md-sys-color-on-surface-variant)]">•</span>
              Hosted on <span className="text-[var(--md-sys-color-primary)]">GitHub Pages</span>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}