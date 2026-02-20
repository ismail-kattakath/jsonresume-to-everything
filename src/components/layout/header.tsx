'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { navItems } from '@/config/navigation'
import { Logo } from '@/components/logo'

/**
 * The site-wide navigation header component with scroll effects and mobile menu.
 */
export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current)
      }
    }
  }, [])

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      // Anchor link - check if we're on homepage
      const isHomePage = window.location.pathname === '/'
      if (isHomePage) {
        // On homepage - scroll to section
        const element = document.querySelector(href)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      } else {
        // On other page - navigate to homepage with anchor
        window.location.href = `/${href}`
      }
    } else {
      // Full page navigation
      window.location.href = href
    }
    setIsMobileMenuOpen(false)
    setActiveDropdown(null)
  }

  const handleMouseEnter = (itemName: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown(itemName)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 200)
  }

  const toggleMobileSubmenu = (itemName: string) => {
    setMobileExpandedMenu(mobileExpandedMenu === itemName ? null : itemName)
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[var(--md-sys-color-surface-container)]/80 shadow-lg backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <motion.button
            onClick={() => {
              const isHomePage = window.location.pathname === '/'
              if (isHomePage) {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              } else {
                window.location.assign('/')
              }
            }}
            className="group flex cursor-pointer items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go to homepage"
            data-testid="logo-button"
          >
            <div className="h-14 w-24">
              <Logo width={96} height={54} fill="#ffffff" />
            </div>
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            {navItems.map((item, index) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                <motion.button
                  onClick={() => (item.href ? handleNavigation(item.href) : null)}
                  className="md3-label-large group relative flex cursor-pointer items-center gap-1 px-5 py-3 text-[var(--md-sys-color-on-surface)] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <span className="relative z-10 transition-colors group-hover:text-[var(--md-sys-color-primary)]">
                    {item.name}
                  </span>
                  {item.submenu && (
                    <ChevronDown
                      size={16}
                      className="transition-transform group-hover:text-[var(--md-sys-color-primary)]"
                      style={{
                        transform: activeDropdown === item.name ? 'rotate(180deg)' : 'rotate(0deg)',
                      }}
                    />
                  )}
                  {!item.submenu && (
                    <motion.span
                      className="absolute bottom-0 left-1/2 h-0.5 rounded-full bg-[var(--md-sys-color-primary)]"
                      initial={{ width: 0, x: '-50%' }}
                      whileHover={{ width: '80%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {item.submenu && activeDropdown === item.name && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 min-w-[200px] rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-2 shadow-lg"
                    >
                      {item.submenu.map((subItem, subIndex) => (
                        <motion.button
                          key={subItem.name}
                          onClick={() => handleNavigation(subItem.href)}
                          className="md3-label-large w-full rounded-xl px-4 py-3 text-left text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-primary)]"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: subIndex * 0.05 }}
                          whileHover={{ x: 4 }}
                        >
                          {subItem.name}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--md-sys-color-on-surface)] md:hidden"
            whileTap={{ scale: 0.95 }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pb-4 md:hidden"
          >
            <div className="flex flex-col space-y-2 rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] p-4">
              {navItems.map((item, index) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <>
                      <motion.button
                        onClick={() => toggleMobileSubmenu(item.name)}
                        className="md3-btn-filled flex w-full items-center justify-between text-left"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          size={20}
                          className="transition-transform"
                          style={{
                            transform: mobileExpandedMenu === item.name ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </motion.button>
                      <AnimatePresence>
                        {mobileExpandedMenu === item.name && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 space-y-1 pl-4"
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <motion.button
                                key={subItem.name}
                                onClick={() => handleNavigation(subItem.href)}
                                className="md3-label-large w-full rounded-xl bg-[var(--md-sys-color-surface-container)] px-4 py-3 text-left text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)]"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: subIndex * 0.05,
                                }}
                              >
                                {subItem.name}
                              </motion.button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <motion.button
                      onClick={() => item.href && handleNavigation(item.href)}
                      className="md3-btn-filled w-full text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {item.name}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </nav>
    </motion.header>
  )
}
