'use client'

import { motion } from 'framer-motion'
import { skills } from '@/lib/data/portfolio'
import { Brain, Cloud, Shield, Cog, Server, Code, Database, Network, Monitor, Sparkles } from 'lucide-react'

const iconMap: { [key: string]: any } = {
  'AI/ML Stack': Brain,
  'Cloud Services': Cloud,
  'Authentication & Security': Shield,
  'DevOps & CI/CD': Cog,
  'Backend & APIs': Server,
  'Programming / Scripting': Code,
  Databases: Database,
  Protocols: Network,
  'Web & Mobile UI': Monitor,
}

const colorMap: { [key: string]: string } = {
  'AI/ML Stack': 'from-purple-500 to-pink-500',
  'Cloud Services': 'from-blue-500 to-cyan-500',
  'Authentication & Security': 'from-orange-500 to-red-500',
  'DevOps & CI/CD': 'from-green-500 to-emerald-500',
  'Backend & APIs': 'from-indigo-500 to-purple-500',
  'Programming / Scripting': 'from-yellow-500 to-orange-500',
  Databases: 'from-teal-500 to-green-500',
  Protocols: 'from-pink-500 to-rose-500',
  'Web & Mobile UI': 'from-cyan-500 to-blue-500',
}

/**
 * The skills section of the portfolio, displaying technical expertise categories and tags.
 */
export default function Skills() {
  return (
    <section id="skills" className="relative overflow-hidden py-24 backdrop-blur-sm">
      {/* Decorative background */}
      <div className="absolute top-1/2 left-0 h-96 w-96 rounded-full bg-[var(--md-sys-color-primary)]/5 blur-3xl"></div>
      <div className="absolute top-1/3 right-0 h-80 w-80 rounded-full bg-[var(--md-sys-color-tertiary)]/5 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-secondary-container)] px-4 py-2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Sparkles size={16} className="text-[var(--md-sys-color-on-secondary-container)]" />
            <span className="md3-label-medium font-medium text-[var(--md-sys-color-on-secondary-container)]">
              Tech Stack
            </span>
          </motion.div>

          <h2 className="md3-headline-large mb-4">Technical Expertise</h2>
          <p className="md3-body-large md3-on-surface-variant mx-auto max-w-3xl">
            Comprehensive technical skills across AI/ML, cloud platforms, and modern development frameworks built over
            15+ years of experience.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skillCategory, categoryIndex) => {
            const Icon = iconMap[skillCategory.category] || Code
            const gradient =
              colorMap[skillCategory.category] ||
              'from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-secondary)]'

            return (
              <motion.div
                key={skillCategory.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.08 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="md3-card group overflow-hidden"
              >
                {/* Header with gradient */}
                <div className="relative bg-gradient-to-br from-[var(--md-sys-color-surface-container-low)] to-[var(--md-sys-color-surface-container)] p-6 pb-4">
                  <div className="mb-2 flex items-center gap-3">
                    {/* Icon with gradient background */}
                    <div
                      className={`h-12 w-12 bg-gradient-to-br ${gradient} flex items-center justify-center rounded-xl shadow-lg transition-transform group-hover:scale-110`}
                    >
                      <Icon className="text-white" size={24} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="md3-title-medium font-semibold break-words">{skillCategory.category}</h3>
                      <p className="md3-label-small text-[var(--md-sys-color-on-surface-variant)]">
                        {skillCategory.items.length} technologies
                      </p>
                    </div>
                  </div>

                  {/* Accent line */}
                  <div className={`mt-4 h-1 bg-gradient-to-r ${gradient} rounded-full`}></div>
                </div>

                {/* Skills tags */}
                <div className="p-6 pt-4">
                  <div className="flex flex-wrap gap-2">
                    {skillCategory.items.map((skill, skillIndex) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: skillIndex * 0.02 }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        className="md3-label-small cursor-default rounded-lg bg-[var(--md-sys-color-surface-container-high)] px-3 py-1.5 font-medium text-[var(--md-sys-color-on-surface-variant)] shadow-sm transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)]"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="md3-card inline-flex flex-wrap items-center justify-center gap-8 px-8 py-6">
            <div className="text-center">
              <div className="md3-headline-medium mb-1 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] bg-clip-text font-bold text-transparent">
                {skills.length}
              </div>
              <div className="md3-label-medium text-[var(--md-sys-color-on-surface-variant)]">Skill Categories</div>
            </div>

            <div className="h-12 w-px bg-[var(--md-sys-color-outline-variant)]"></div>

            <div className="text-center">
              <div className="md3-headline-medium mb-1 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] bg-clip-text font-bold text-transparent">
                {skills.reduce((acc, cat) => acc + cat.items.length, 0)}
              </div>
              <div className="md3-label-medium text-[var(--md-sys-color-on-surface-variant)]">
                Technologies Mastered
              </div>
            </div>

            <div className="h-12 w-px bg-[var(--md-sys-color-outline-variant)]"></div>

            <div className="text-center">
              <div className="md3-headline-medium mb-1 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] bg-clip-text font-bold text-transparent">
                15+
              </div>
              <div className="md3-label-medium text-[var(--md-sys-color-on-surface-variant)]">Years of Practice</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
