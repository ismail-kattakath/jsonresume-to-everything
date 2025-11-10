'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Github, Linkedin, Mail, Phone, MapPin, Globe } from 'lucide-react'
import { contactInfo } from '@/lib/data/portfolio'

export default function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-[var(--md-sys-color-primary-container)] to-[var(--md-sys-color-secondary-container)] flex items-center relative">
      <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative inline-block mb-6">
            <img 
              src="./images/profile.jpg" 
              alt="Ismail Kattakath - Principal Software Engineer & AI Research Scientist"
              className="w-32 h-32 rounded-full object-cover shadow-lg mx-auto"
              style={{
                border: '4px solid var(--md-sys-color-primary)',
                boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>
          
          <h1 className="md3-display-large mb-4 max-w-4xl mx-auto">
            Ismail Kattakath
          </h1>
          
          <h2 className="md3-title-large md3-on-surface-variant mb-6 max-w-2xl mx-auto">
            {contactInfo.title}
          </h2>
          
          <p className="md3-body-large md3-on-surface-variant mb-8 max-w-2xl mx-auto">
            15+ years of expertise in AI/ML engineering, full-stack development, 
            and technical leadership. Specializing in production-ready AI infrastructure 
            and scalable software architectures.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <div className="flex items-center gap-2 px-4 py-2 md3-surface-container md3-body-medium">
            <MapPin size={16} className="md3-primary" />
            <span className="md3-on-surface-variant">{contactInfo.location}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 md3-surface-container md3-body-medium">
            <Phone size={16} className="md3-primary" />
            <span className="md3-on-surface-variant">{contactInfo.phone}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 md3-surface-container md3-body-medium">
            <Mail size={16} className="md3-primary" />
            <span className="md3-on-surface-variant">{contactInfo.email}</span>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap justify-center gap-4 mb-16"
        >
          <motion.a
            href="#projects"
            className="md3-btn-filled inline-flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            View Projects
          </motion.a>
          {contactInfo.website && (
            <motion.a
              href={`https://${contactInfo.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="md3-btn-outlined inline-flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Globe size={16} />
              Website
            </motion.a>
          )}
          <motion.a
            href={`https://${contactInfo.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="md3-btn-outlined inline-flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Github size={16} />
            GitHub
          </motion.a>
          <motion.a
            href={`https://${contactInfo.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="md3-btn-outlined inline-flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Linkedin size={16} />
            LinkedIn
          </motion.a>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <ChevronDown className="md3-primary transition-colors" size={24} />
        </motion.div>
      </div>
    </section>
  )
}