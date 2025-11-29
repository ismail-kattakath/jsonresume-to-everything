'use client'

import { motion } from 'framer-motion'
import { experience } from '@/lib/data/portfolio'
import { Calendar, Briefcase, Sparkles } from 'lucide-react'

export default function Experience() {
  return (
    <section id="experience" className="py-24 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="md3-headline-large mb-4">Professional Experience</h2>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          {experience.map((exp, index) => (
            <motion.div
              key={`${exp.organization}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="group relative mb-12 last:mb-0"
            >
              {/* Timeline line - connecting to next card */}
              {index < experience.length - 1 && (
                <div className="absolute top-20 left-[22px] h-[calc(100%+48px)] w-0.5 bg-gradient-to-b from-[var(--md-sys-color-primary)] via-[var(--md-sys-color-primary)]/30 to-transparent"></div>
              )}

              {/* Modern card with left accent border */}
              <div className="relative">
                {/* Animated left accent */}
                <motion.div
                  className="absolute top-0 bottom-0 left-0 w-1 rounded-l-2xl bg-gradient-to-b from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)]"
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.15 + 0.3 }}
                  viewport={{ once: true }}
                ></motion.div>

                {/* Timeline marker with icon */}
                <div className="absolute top-6 -left-[23px] z-10">
                  <motion.div
                    className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[var(--md-sys-color-surface-container-lowest)] bg-[var(--md-sys-color-primary-container)] shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <Briefcase
                      className="text-[var(--md-sys-color-on-primary-container)]"
                      size={20}
                    />
                  </motion.div>
                </div>

                {/* Card content */}
                <motion.div
                  className="md3-card ml-8 overflow-hidden"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header section with gradient background */}
                  <div className="relative border-b border-[var(--md-sys-color-outline-variant)]/30 bg-gradient-to-br from-[var(--md-sys-color-surface-container-low)] to-[var(--md-sys-color-surface-container)] p-6 pb-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="md3-headline-small mb-1.5 font-semibold break-words text-[var(--md-sys-color-primary)]">
                          {exp.organization}
                        </h3>
                        <h4 className="md3-title-large mb-3 font-normal break-words text-[var(--md-sys-color-on-surface)]">
                          {exp.title}
                        </h4>

                        {/* Mobile: Duration badge below organization/title */}
                        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-surface-container-highest)] px-3 py-2 whitespace-nowrap shadow-sm md:hidden">
                          <Calendar
                            size={14}
                            className="text-[var(--md-sys-color-primary)]"
                          />
                          <span className="md3-label-medium text-[var(--md-sys-color-on-surface-variant)]">
                            {exp.duration}
                          </span>
                        </div>
                      </div>

                      {/* Desktop: Duration badge on same row, aligned right */}
                      <div className="hidden flex-shrink-0 items-center gap-2 rounded-full bg-[var(--md-sys-color-surface-container-highest)] px-3 py-2 whitespace-nowrap shadow-sm md:flex">
                        <Calendar
                          size={14}
                          className="text-[var(--md-sys-color-primary)]"
                        />
                        <span className="md3-label-medium text-[var(--md-sys-color-on-surface-variant)]">
                          {exp.duration}
                        </span>
                      </div>
                    </div>

                    {/* Company description */}
                    {exp.summary && (
                      <div className="mt-3 border-t border-[var(--md-sys-color-outline-variant)]/20 pt-3">
                        <p className="md3-body-medium leading-relaxed text-[var(--md-sys-color-on-surface-variant)]/90 italic">
                          {exp.summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Key achievements section */}
                  <div className="p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <Sparkles
                        size={16}
                        className="text-[var(--md-sys-color-primary)]"
                      />
                      <h5 className="md3-title-medium text-[var(--md-sys-color-on-surface)]">
                        Key Achievements
                      </h5>
                    </div>

                    <ul className="mb-6 space-y-3">
                      {exp.description.map((desc, descIndex) => (
                        <motion.li
                          key={descIndex}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.4,
                            delay: descIndex * 0.08,
                          }}
                          viewport={{ once: true }}
                          className="group/item flex items-start gap-3"
                        >
                          <div className="relative mt-1.5 flex-shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--md-sys-color-primary)] transition-transform group-hover/item:scale-125"></div>
                            <div className="absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full bg-[var(--md-sys-color-primary)] opacity-20"></div>
                          </div>
                          <span className="md3-body-medium flex-1 leading-relaxed text-[var(--md-sys-color-on-surface)]">
                            {desc}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* Technologies section */}
                    <div className="border-t border-[var(--md-sys-color-outline-variant)]/30 pt-4">
                      <h5 className="md3-label-large mb-3 tracking-wider text-[var(--md-sys-color-on-surface-variant)] uppercase">
                        Tech Stack
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: techIndex * 0.03,
                            }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            className="md3-label-medium relative cursor-default rounded-lg bg-[var(--md-sys-color-surface-container-high)] px-3 py-1.5 font-medium text-[var(--md-sys-color-on-surface-variant)] shadow-sm transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)]"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
