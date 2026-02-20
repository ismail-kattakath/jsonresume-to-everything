'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Linkedin, Github, Mail, Calendar, Download, Sparkles } from 'lucide-react'
import resumeData from '@/lib/resume-adapter'
import { contactInfo } from '@/lib/data/portfolio'

/**
 * The hero section of the portfolio, featuring profile image, introduction, and social links.
 */
export default function Hero() {
  const linkedInProfile = resumeData.socialMedia.find((s) => s.socialMedia === 'LinkedIn')
  const githubProfile = resumeData.socialMedia.find((s) => s.socialMedia === 'Github')
  const linkedInUrl = linkedInProfile?.link.startsWith('http')
    ? linkedInProfile.link
    : `https://${linkedInProfile?.link}`
  const githubUrl = githubProfile?.link.startsWith('http') ? githubProfile.link : `https://${githubProfile?.link}`
  const profileImage = resumeData.profilePicture || './images/profile.jpg'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  }

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden backdrop-blur-sm">
      {/* Floating gradient orbs for depth */}
      <div className="absolute top-1/4 -left-20 h-72 w-72 animate-pulse rounded-full bg-[var(--md-sys-color-primary)]/10 blur-3xl"></div>
      <div
        className="absolute -right-20 bottom-1/4 h-96 w-96 animate-pulse rounded-full bg-[var(--md-sys-color-tertiary)]/10 blur-3xl"
        style={{ animationDelay: '1s' }}
      ></div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
          {/* Profile Image with enhanced styling */}
          <motion.div variants={itemVariants} className="relative mb-8 inline-block">
            <div className="relative">
              {/* Animated ring */}
              <motion.div
                className="absolute -inset-4 rounded-full bg-gradient-to-r from-[var(--md-sys-color-primary)] via-[var(--md-sys-color-secondary)] to-[var(--md-sys-color-tertiary)] opacity-75 blur-lg"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              ></motion.div>

              {/* Profile image */}
              <motion.img
                src={profileImage}
                alt={`${resumeData.name} - ${resumeData.position}`}
                className="relative h-40 w-40 rounded-full object-cover shadow-2xl"
                style={{
                  border: '6px solid var(--md-sys-color-surface)',
                }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />

              {/* Status badge */}
              <motion.div
                className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-full border-2 border-[var(--md-sys-color-surface)] bg-[var(--md-sys-color-primary-container)] px-3 py-1.5 shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
              >
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                <span className="md3-label-small font-medium text-[var(--md-sys-color-on-primary-container)]">
                  Available
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Name with gradient text effect */}
          <motion.h1
            variants={itemVariants}
            className="md3-display-large mb-4 bg-gradient-to-r from-[var(--md-sys-color-primary)] via-[var(--md-sys-color-secondary)] to-[var(--md-sys-color-tertiary)] bg-clip-text font-bold text-transparent"
          >
            {resumeData.name}
          </motion.h1>

          {/* Position with icon */}
          <motion.div variants={itemVariants} className="mb-6 flex items-center justify-center gap-2">
            <Sparkles className="text-[var(--md-sys-color-primary)]" size={20} />
            <p className="md3-headline-small font-medium text-[var(--md-sys-color-on-surface)]">
              {resumeData.position}
            </p>
          </motion.div>

          {/* Tagline/Summary first sentence */}
          <motion.p
            variants={itemVariants}
            className="md3-body-large md3-on-surface-variant mx-auto mb-12 max-w-2xl leading-relaxed"
          >
            {resumeData.summary.split('.')[0]}.
          </motion.p>

          {/* Primary CTAs */}
          <motion.div variants={itemVariants} className="mb-8 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="md3-label-large inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] px-8 py-4 font-semibold text-[var(--md-sys-color-on-primary)] shadow-lg transition-shadow hover:shadow-xl"
            >
              <Mail size={20} />
              Get In Touch
            </motion.a>

            <motion.a
              href="/resume"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="md3-label-large inline-flex items-center gap-2 rounded-full border-2 border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-8 py-4 font-semibold text-[var(--md-sys-color-on-surface)] shadow-md transition-shadow hover:shadow-lg"
            >
              <Download size={20} />
              View Resume
            </motion.a>
          </motion.div>

          {/* Social links */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-3">
            <motion.a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-high)] shadow-md transition-shadow hover:shadow-lg"
              title="LinkedIn Profile"
            >
              <Linkedin size={20} className="text-[var(--md-sys-color-primary)]" />
            </motion.a>

            <motion.a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-high)] shadow-md transition-shadow hover:shadow-lg"
              title="GitHub Profile"
            >
              <Github size={20} className="text-[var(--md-sys-color-primary)]" />
            </motion.a>

            <motion.a
              href={contactInfo.calendar}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--md-sys-color-surface-container-high)] shadow-md transition-shadow hover:shadow-lg"
              title="Schedule a Meeting"
            >
              <Calendar size={20} className="text-[var(--md-sys-color-primary)]" />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 transform cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            y: [0, 8, 0],
          }}
          transition={{
            opacity: { delay: 1.5 },
            y: { repeat: Infinity, duration: 2, ease: 'easeInOut' },
          }}
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="md3-label-small tracking-wider text-[var(--md-sys-color-on-surface-variant)] uppercase">
              Scroll
            </span>
            <ChevronDown className="text-[var(--md-sys-color-primary)]" size={24} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
