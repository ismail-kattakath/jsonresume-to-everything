'use client'

import { motion } from 'framer-motion'
import {
  Mail,
  Github,
  Linkedin,
  Calendar,
  Send,
  MessageCircle,
} from 'lucide-react'
import { contactInfo } from '@/lib/data/portfolio'

export default function Contact() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email',
      value: contactInfo.email,
      description: 'Best for detailed inquiries',
      action: `mailto:${contactInfo.email}`,
      gradient: 'from-blue-500 to-cyan-500',
      isExternal: false,
    },
    {
      icon: Calendar,
      title: 'Schedule Meeting',
      value: '30-60 min slots available',
      description: "Let's discuss your project",
      action: contactInfo.calendar,
      gradient: 'from-purple-500 to-pink-500',
      isExternal: true,
    },
    {
      icon: Linkedin,
      title: 'LinkedIn',
      value: contactInfo.linkedin.replace('linkedin.com/in/', ''),
      description: 'Professional network',
      action: `https://${contactInfo.linkedin}`,
      gradient: 'from-blue-600 to-blue-700',
      isExternal: true,
    },
    {
      icon: Github,
      title: 'GitHub',
      value: contactInfo.github.replace('github.com/', ''),
      description: 'Open source & projects',
      action: `https://${contactInfo.github}`,
      gradient: 'from-gray-700 to-gray-900',
      isExternal: true,
    },
  ]

  return (
    <section
      id="contact"
      className="relative overflow-hidden py-24 backdrop-blur-sm"
    >
      {/* Decorative background */}
      <div className="absolute top-0 left-1/3 h-96 w-96 rounded-full bg-[var(--md-sys-color-primary)]/5 blur-3xl"></div>
      <div className="absolute right-1/3 bottom-0 h-80 w-80 rounded-full bg-[var(--md-sys-color-tertiary)]/5 blur-3xl"></div>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <motion.div
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-tertiary-container)] px-4 py-2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <MessageCircle
              size={16}
              className="text-[var(--md-sys-color-on-tertiary-container)]"
            />
            <span className="md3-label-medium font-medium text-[var(--md-sys-color-on-tertiary-container)]">
              Let&apos;s Connect
            </span>
          </motion.div>

          <h2 className="md3-headline-large mb-4">Get In Touch</h2>
          <p className="md3-body-large md3-on-surface-variant mx-auto max-w-2xl">
            Have a project in mind or want to discuss opportunities? I&apos;m
            always open to interesting conversations and collaborations.
          </p>
        </motion.div>

        {/* Contact methods grid */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {contactMethods.map((method, index) => (
            <motion.a
              key={method.title}
              href={method.action}
              target={method.isExternal ? '_blank' : undefined}
              rel={method.isExternal ? 'noopener noreferrer' : undefined}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="md3-card group cursor-pointer overflow-hidden"
            >
              <div className="relative bg-gradient-to-br from-[var(--md-sys-color-surface-container-low)] to-[var(--md-sys-color-surface-container)] p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`h-14 w-14 bg-gradient-to-br ${method.gradient} flex flex-shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform group-hover:scale-110`}
                  >
                    <method.icon className="text-white" size={24} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <h3 className="md3-title-large mb-1 font-semibold">
                      {method.title}
                    </h3>
                    <p className="md3-body-medium mb-1 break-all text-[var(--md-sys-color-on-surface)]">
                      {method.value}
                    </p>
                    <p className="md3-label-small text-[var(--md-sys-color-on-surface-variant)]">
                      {method.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <Send
                      size={20}
                      className="text-[var(--md-sys-color-primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* Hover accent */}
              <div
                className={`h-1 bg-gradient-to-r ${method.gradient} origin-left scale-x-0 transform transition-transform group-hover:scale-x-100`}
              ></div>
            </motion.a>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <p className="md3-body-large mb-6 text-[var(--md-sys-color-on-surface-variant)]">
            Ready to start a conversation?
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href={`mailto:${contactInfo.email}`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="md3-label-large inline-flex items-center gap-2 rounded-full bg-[var(--md-sys-color-primary)] px-8 py-4 font-semibold text-[var(--md-sys-color-on-primary)] shadow-lg transition-shadow hover:shadow-xl"
            >
              <Mail size={20} />
              Send Me an Email
            </motion.a>

            <motion.a
              href={contactInfo.calendar}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="md3-label-large inline-flex items-center gap-2 rounded-full border-2 border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] px-8 py-4 font-semibold text-[var(--md-sys-color-on-surface)] shadow-md transition-shadow hover:shadow-lg"
            >
              <Calendar size={20} />
              Book a Meeting
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
