'use client'

import { motion } from 'framer-motion'
import { ChevronDown, Linkedin } from 'lucide-react'
import DefaultResumeData from '@/components/resume-builder/utility/DefaultResumeData'

export default function Hero() {
  const linkedInProfile = DefaultResumeData.socialMedia.find(s => s.socialMedia === "LinkedIn");
  const linkedInUrl = linkedInProfile?.link.startsWith("http")
    ? linkedInProfile.link
    : `https://${linkedInProfile?.link}`;
  const profileImage = DefaultResumeData.profilePicture || "./images/profile.jpg";
  return (
    <section className="min-h-screen flex items-center relative backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative inline-block mb-6">
            <img
              src={profileImage}
              alt={`${DefaultResumeData.name} - ${DefaultResumeData.position}`}
              className="w-32 h-32 rounded-full object-cover shadow-lg mx-auto"
              style={{
                border: '4px solid var(--md-sys-color-primary)',
                boxShadow: '0px 2px 6px 2px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>

          <h1 className="md3-display-medium mb-6 max-w-4xl mx-auto font-medium">
            {DefaultResumeData.name}
          </h1>

          <h2 className="md3-headline-small md3-on-surface-variant mb-6 max-w-2xl mx-auto font-normal">
            {DefaultResumeData.position.split('|')[0].trim()}
          </h2>

          <p className="md3-body-large md3-on-surface-variant mb-10 max-w-3xl mx-auto leading-relaxed">
            {DefaultResumeData.position}
          </p>

          <motion.a
            href={`${linkedInUrl}/comm/mynetwork/discovery-see-all?usecase=PEOPLE_FOLLOWS&followMember=${linkedInProfile?.link.split('/').pop()}`}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full md3-label-large shadow-md hover:shadow-lg transition-shadow"
            style={{ backgroundColor: '#0a66c2', color: '#ffffff' }}
          >
            <Linkedin size={20} />
            Follow me on LinkedIn
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