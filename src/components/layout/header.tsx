'use client'

import React, { useState, useEffect, useRef } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Logo } from '@/components/logo'
import { navItems } from '@/config/navigation'
import { navigateTo } from '@/lib/navigation'
import { analytics } from '@/lib/analytics'

/**
 * The main header component with navigation links and mobile menu.
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null)
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
        navigateTo(`/${href}`)
      }
    } else {
      // Full page navigation
      navigateTo(href)
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
    <m.header
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
          <m.button
            onClick={() => {
              const isHomePage = window.location.pathname === '/'
              if (isHomePage) {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              } else {
                navigateTo('/')
              }
            }}
            className="group flex cursor-pointer items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Go to homepage"
            data-testid="logo-button"
          >
            <div className="h-14 w-24">
              <Logo width={192} height={108} fill="var(--md-sys-color-primary)" />
            </div>
          </m.button>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-1 md:flex">
            {navItems.map((item, index) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.submenu && handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
                data-testid={`nav-item-${item.name.toLowerCase()}`}
              >
                <m.button
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
                      data-testid="chevron-icon"
                    />
                  )}
                  {!item.submenu && (
                    <m.span
                      className="absolute bottom-0 left-1/2 h-0.5 rounded-full bg-[var(--md-sys-color-primary)]"
                      initial={{ width: 0, x: '-50%' }}
                      whileHover={{ width: '80%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </m.button>

                <AnimatePresence>
                  {activeDropdown === item.name && item.submenu && (
                    <m.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 min-w-[200px] rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] p-2 shadow-lg"
                    >
                      {item.submenu.map((subItem, subIndex) => (
                        <m.button
                          key={subItem.name}
                          onClick={() => handleNavigation(subItem.href)}
                          className="md3-label-large w-full rounded-xl px-4 py-3 text-left text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-primary)]"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: subIndex * 0.05 }}
                          whileHover={{ x: 4 }}
                          data-testid={`submenu-desktop-${subItem.name.toLowerCase()}`}
                        >
                          {subItem.name}
                        </m.button>
                      ))}
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <m.button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--md-sys-color-on-surface)] md:hidden"
            whileTap={{ scale: 0.95 }}
            data-testid="menu-toggle"
          >
            {isMobileMenuOpen ? <X size={24} data-testid="x-icon" /> : <Menu size={24} data-testid="menu-icon" />}
          </m.button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] md:hidden"
          >
            <div className="flex flex-col space-y-4 p-6">
              {navItems.map((item, index) => (
                <div key={item.name} className="flex flex-col space-y-2">
                  {item.submenu ? (
                    <>
                      <m.button
                        onClick={() => toggleMobileSubmenu(item.name)}
                        className="md3-btn-tonal flex w-full items-center justify-between"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        data-testid={`mobile-submenu-toggle-${item.name.toLowerCase()}`}
                      >
                        {item.name}
                        <ChevronDown
                          className="transition-transform"
                          style={{
                            transform: mobileExpandedMenu === item.name ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </m.button>
                      <AnimatePresence>
                        {mobileExpandedMenu === item.name && (
                          <m.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col space-y-2 pl-4"
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <m.button
                                key={subItem.name}
                                onClick={() => handleNavigation(subItem.href)}
                                className="md3-label-large w-full rounded-xl bg-[var(--md-sys-color-surface-container)] px-4 py-3 text-left text-[var(--md-sys-color-on-surface)] transition-colors hover:bg-[var(--md-sys-color-surface-container-highest)]"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: subIndex * 0.05,
                                }}
                                data-testid={`submenu-mobile-${subItem.name.toLowerCase()}`}
                              >
                                {subItem.name}
                              </m.button>
                            ))}
                          </m.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <m.button
                      onClick={() => item.href && handleNavigation(item.href)}
                      className="md3-btn-filled w-full text-left"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      data-testid={`mobile-direct-${item.name.toLowerCase()}`}
                    >
                      {item.name}
                    </m.button>
                  )}
                </div>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.header>
  )
}
