'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Heart } from 'lucide-react'
import { contactInfo } from '@/lib/data/portfolio'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface)] py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="md3-title-large mb-4">{contactInfo.name}</h3>
            <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] mb-4">
              {contactInfo.title} with 15+ years of experience building scalable,
              mission-critical systems.
            </p>
            <div className="flex space-x-4">
              <motion.a
                href={`https://${contactInfo.github}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="md3-btn-outlined"
              >
                <Github size={18} />
              </motion.a>
              <motion.a
                href={`https://${contactInfo.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="md3-btn-outlined"
              >
                <Linkedin size={18} />
              </motion.a>
              <motion.a
                href={`mailto:${contactInfo.email}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="md3-btn-outlined"
              >
                <Mail size={18} />
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="md3-title-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
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
                    className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] transition-colors"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="md3-title-medium mb-4">Contact Info</h4>
            <div className="space-y-2 md3-body-medium text-[var(--md-sys-color-on-surface-variant)]">
              <p>{contactInfo.email}</p>
              <p>{contactInfo.phone}</p>
              <p>{contactInfo.location}</p>
            </div>
            
            <div className="mt-6">
              <h5 className="md3-title-small mb-2">Specializations</h5>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-[var(--md-sys-color-surface-container-high)] rounded-full text-xs">AI/ML</span>
                <span className="px-3 py-1 bg-[var(--md-sys-color-surface-container-high)] rounded-full text-xs">Full-Stack</span>
                <span className="px-3 py-1 bg-[var(--md-sys-color-surface-container-high)] rounded-full text-xs">DevOps</span>
                <span className="px-3 py-1 bg-[var(--md-sys-color-surface-container-high)] rounded-full text-xs">Leadership</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-[var(--md-sys-color-outline-variant)] mt-8 pt-8 text-center"
        >
          <p className="md3-body-small text-[var(--md-sys-color-on-surface-variant)] flex items-center justify-center gap-2">
            © {currentYear} Ismail Kattakath. Built with Next.js and hosted on GitHub Pages
            <Heart size={16} className="text-[var(--md-sys-color-primary)]" />
          </p>
        </motion.div>
      </div>
    </footer>
  )
}