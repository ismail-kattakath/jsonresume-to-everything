'use client'

import { motion } from 'framer-motion'
import { skills } from '@/lib/data/portfolio'

const colorMap: { [key: string]: string } = {
  'AI/ML Stack': 'bg-[var(--md-sys-color-primary)]',
  'Cloud Services': 'bg-[var(--md-sys-color-secondary)]',
  'Authentication & Security': 'bg-[var(--md-sys-color-tertiary)]',
  'DevOps & CI/CD': 'bg-[var(--md-sys-color-primary)]',
  'Backend & APIs': 'bg-[var(--md-sys-color-secondary)]',
  'Programming / Scripting': 'bg-[var(--md-sys-color-tertiary)]',
  'Databases': 'bg-[var(--md-sys-color-primary)]',
  'Protocols': 'bg-[var(--md-sys-color-secondary)]',
  'Web & Mobile UI': 'bg-[var(--md-sys-color-tertiary)]',
}

export default function Skills() {
  return (
    <section id="skills" className="py-24 bg-[var(--md-sys-color-surface)]">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="md3-headline-large mb-4">
            Technical Expertise
          </h2>
          <p className="md3-body-large md3-on-surface-variant max-w-3xl mx-auto">
            Comprehensive technical skills across AI/ML, cloud platforms, 
            and modern development frameworks built over 15+ years of experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skills.map((skillCategory, categoryIndex) => (
            <motion.div
              key={skillCategory.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="md3-card p-6"
            >
              <div className="flex items-center mb-4">
                <div className={`w-3 h-3 ${colorMap[skillCategory.category] || 'bg-[var(--md-sys-color-primary)]'} rounded-full mr-3`}></div>
                <h3 className="md3-title-medium">{skillCategory.category}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {skillCategory.items.map((skill, skillIndex) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: skillIndex * 0.05 }}
                    viewport={{ once: true }}
                    className="px-3 py-1 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] rounded-full text-sm"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}