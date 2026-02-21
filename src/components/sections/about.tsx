'use client'

import { m } from 'framer-motion'
import { summary } from '@/lib/data/portfolio'
import { Award, Users, Rocket, TrendingUp, Code2, Globe } from 'lucide-react'
import { fadeInUp, scaleIn, fadeInUpWithDelay } from '@/lib/utils/animations'

/**
 * The 'About Me' section of the portfolio, highlighting professional journey and core competencies.
 */
export default function About() {
  // Parse summary into sentences for better display
  const sentences = summary.split(/\.(?!\d)/).filter((s) => s.trim())
  const mainSummary = sentences.slice(0, 2).join('.') + '.'
  const achievements = sentences.slice(2).join('.') + (sentences.length > 2 ? '' : '')

  const stats = [
    {
      icon: Code2,
      value: '15+',
      label: 'Years Experience',
      color: 'text-[var(--md-sys-color-primary)]',
    },
    {
      icon: Rocket,
      value: '50+',
      label: 'Projects Delivered',
      color: 'text-[var(--md-sys-color-secondary)]',
    },
    {
      icon: Users,
      value: '100K+',
      label: 'Users Impacted',
      color: 'text-[var(--md-sys-color-tertiary)]',
    },
    {
      icon: TrendingUp,
      value: '99.5%',
      label: 'System Uptime',
      color: 'text-[var(--md-sys-color-primary)]',
    },
  ]

  return (
    <section id="about" className="relative overflow-hidden py-24 backdrop-blur-sm">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-1/4 h-64 w-64 rounded-full bg-[var(--md-sys-color-secondary)]/5 blur-3xl"></div>
      <div className="absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[var(--md-sys-color-primary)]/5 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <m.div {...fadeInUp} className="mb-16 text-center">
          <m.div
            {...scaleIn}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-primary-container)] px-4 py-2"
          >
            <Globe size={16} className="text-[var(--md-sys-color-on-primary-container)]" />
            <span className="md3-label-medium font-medium text-[var(--md-sys-color-on-primary-container)]">
              Principal Software Engineer
            </span>
          </m.div>

          <h2 className="md3-headline-large mb-4">About Me</h2>
          <p className="md3-body-medium md3-on-surface-variant mx-auto max-w-2xl">
            Transforming ideas into scalable, high-performance solutions
          </p>
        </m.div>

        <div className="mb-12 grid gap-8 lg:grid-cols-2">
          {/* Main summary card */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md3-card overflow-hidden"
          >
            <div className="p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] shadow-lg">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="md3-title-large font-semibold">Professional Journey</h3>
              </div>

              <p className="md3-body-large mb-4 leading-relaxed text-[var(--md-sys-color-on-surface)]">{mainSummary}</p>

              {achievements && (
                <p className="md3-body-medium leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                  {achievements}
                </p>
              )}
            </div>

            {/* Bottom accent */}
            <div className="h-1 bg-gradient-to-r from-[var(--md-sys-color-primary)] via-[var(--md-sys-color-secondary)] to-[var(--md-sys-color-tertiary)]"></div>
          </m.div>

          {/* Stats grid */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map((stat, index) => (
              <m.div
                key={stat.label}
                {...fadeInUpWithDelay(index)}
                whileHover={{ y: -4 }}
                className="md3-card group cursor-default p-6 text-center"
              >
                <div className="mb-3 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--md-sys-color-surface-container-high)] transition-transform group-hover:scale-110">
                    <stat.icon className={stat.color} size={28} />
                  </div>
                </div>

                <div className="md3-display-small mb-1 bg-gradient-to-r from-[var(--md-sys-color-primary)] to-[var(--md-sys-color-tertiary)] bg-clip-text font-bold text-transparent">
                  {stat.value}
                </div>

                <div className="md3-label-medium text-[var(--md-sys-color-on-surface-variant)]">{stat.label}</div>
              </m.div>
            ))}
          </m.div>
        </div>

        {/* Key highlights */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="md3-card p-8"
        >
          <h3 className="md3-title-large mb-6 text-center font-semibold">Core Competencies</h3>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'GenAI & LLMOps',
                description:
                  'Production-grade AI inference infrastructure with vLLM, Kubernetes, and multi-GPU optimization',
                icon: Rocket,
              },
              {
                title: 'Full-Stack Development',
                description: 'Modern web applications with Next.js, React, Node.js, and cloud-native architectures',
                icon: Code2,
              },
              {
                title: 'Technical Leadership',
                description:
                  'Leading teams, mentoring developers, and establishing engineering best practices at scale',
                icon: Users,
              },
            ].map((competency, index) => (
              <m.div
                key={competency.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative rounded-2xl bg-[var(--md-sys-color-surface-container-low)] p-6"
              >
                <competency.icon className="mb-4 text-[var(--md-sys-color-primary)]" size={24} />
                <h4 className="md3-title-medium mb-2 font-semibold">{competency.title}</h4>
                <p className="md3-body-small leading-relaxed text-[var(--md-sys-color-on-surface-variant)]">
                  {competency.description}
                </p>
              </m.div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  )
}
