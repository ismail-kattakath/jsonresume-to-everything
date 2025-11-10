'use client'

import { motion } from 'framer-motion'
import { summary } from '@/lib/data/portfolio'

export default function About() {
  return (
    <section id="about" className="py-24" style={{background: 'var(--md-sys-color-surface-container-lowest)'}}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="md3-headline-large mb-4">
            About Me
          </h2>
          <p className="md3-body-large md3-on-surface-variant max-w-3xl mx-auto">
            A passionate technologist with deep expertise in AI/ML engineering
            and full-stack development, committed to building innovative solutions
            that make a meaningful impact.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="md3-card p-8">
            <p className="md3-body-large leading-relaxed text-[var(--md-sys-color-on-surface)]">
              {summary}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}