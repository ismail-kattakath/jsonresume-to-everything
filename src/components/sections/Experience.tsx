'use client'

import { motion } from 'framer-motion'
import { experience } from '@/lib/data/portfolio'
import { MapPin, Calendar } from 'lucide-react'

export default function Experience() {
  return (
    <section id="experience" className="py-24 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="md3-headline-large mb-4">
            Professional Experience
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {experience.map((exp, index) => (
            <motion.div
              key={`${exp.company}-${index}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative mb-16 last:mb-0"
            >
              {/* Timeline line */}
              {index < experience.length - 1 && (
                <div className="absolute left-8 top-24 w-0.5 h-32 bg-[var(--md-sys-color-outline-variant)]"></div>
              )}
              
              {/* Timeline dot */}
              <div className="absolute left-6 top-8 w-4 h-4 bg-[var(--md-sys-color-primary)] rounded-full border-4 border-[var(--md-sys-color-surface-container-lowest)] shadow-lg"></div>
              
              <div className="ml-20 md3-card p-8">
                <div className="mb-4">
                  <h3 className="md3-headline-small mb-2 font-medium">{exp.title}</h3>
                  <h4 className="md3-title-large text-[var(--md-sys-color-primary)] mb-3 font-normal">{exp.company}</h4>
                  
                  <div className="flex flex-wrap gap-4 text-[var(--md-sys-color-on-surface-variant)] mb-4 md3-body-medium">
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      <span>{exp.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>{exp.duration}</span>
                    </div>
                  </div>
                </div>

                {exp.summary && (
                  <div className="mb-4">
                    <p className="md3-body-medium text-[var(--md-sys-color-on-surface-variant)] italic">
                      {exp.summary}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <ul className="space-y-2">
                    {exp.description.map((desc, descIndex) => (
                      <motion.li
                        key={descIndex}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: descIndex * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-2 md3-body-medium leading-relaxed"
                      >
                        <div className="w-1.5 h-1.5 bg-[var(--md-sys-color-primary)] rounded-full mt-2 flex-shrink-0"></div>
                        <span>{desc}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="md3-title-medium mb-3">Technologies Used:</h5>
                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, techIndex) => (
                      <motion.span
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: techIndex * 0.05 }}
                        viewport={{ once: true }}
                        className="px-3 py-1.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] rounded-full md3-label-medium"
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}