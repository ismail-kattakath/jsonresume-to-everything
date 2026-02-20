'use client'

import { motion } from 'framer-motion'
import { projects } from '@/lib/data/portfolio'
import { Code } from 'lucide-react'

/**
 * The 'Projects' section showcasing featured work and technical projects.
 */
export default function Projects() {
  return (
    <section id="projects" className="py-24 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="md3-headline-large mb-4">Projects</h2>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="md3-card overflow-hidden"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="md3-title-large font-medium">{project.name}</h3>
                  <Code className="md3-on-surface-variant" size={20} />
                </div>

                <p className="md3-body-medium mb-6 leading-relaxed">{project.description}</p>

                <div className="mb-6">
                  <h4 className="md3-title-medium mb-3 font-medium">Key Highlights:</h4>
                  <ul className="space-y-1">
                    {project.highlights.map((highlight, highlightIndex) => (
                      <li
                        key={highlightIndex}
                        className="md3-body-medium md3-on-surface-variant flex items-start gap-2"
                      >
                        <div
                          className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ background: 'var(--md-sys-color-primary)' }}
                        ></div>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="md3-label-small md3-on-surface-variant rounded-full px-3 py-1.5"
                        style={{
                          background: 'var(--md-sys-color-surface-container)',
                          border: '1px solid var(--md-sys-color-outline-variant)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span
                        className="md3-label-small md3-on-surface-variant rounded-full px-3 py-1.5 font-medium"
                        style={{
                          background: 'var(--md-sys-color-surface-container-high)',
                        }}
                      >
                        +{project.technologies.length - 4} more
                      </span>
                    )}
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
