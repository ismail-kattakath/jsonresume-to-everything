import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import Footer from '@/components/layout/footer'
import { navigateTo } from '@/lib/navigation'
import { suppressConsoleError } from '@/lib/__tests__/test-utils'
import { analytics } from '@/lib/analytics'

// Mock framer-motion
jest.mock('framer-motion', () => {
  const mockMotion = (Component: any) => {
    const MockComponent = ({
      children,
      initial,
      animate,
      whileHover,
      whileTap,
      whileInView,
      viewport,
      transition,
      exit,
      ...props
    }: any) => <Component {...props}>{children}</Component>
    MockComponent.displayName = `MockMotion(${Component})`
    return MockComponent
  }

  const motionMock = {
    footer: mockMotion('footer'),
    div: mockMotion('div'),
    button: mockMotion('button'),
    p: mockMotion('p'),
    a: mockMotion('a'),
    li: mockMotion('li'),
    h3: mockMotion('h3'),
  }

  return {
    motion: motionMock,
    m: motionMock,
  }
})

// Mock lucide-react
jest.mock('lucide-react', () => {
  const Github = () => <span data-testid="github-icon" />
  Github.displayName = 'Github'
  const Linkedin = () => <span data-testid="linkedin-icon" />
  Linkedin.displayName = 'Linkedin'
  const Mail = () => <span data-testid="mail-icon" />
  Mail.displayName = 'Mail'
  const Globe = () => <span data-testid="globe-icon" />
  Globe.displayName = 'Globe'
  const Heart = () => <span data-testid="heart-icon" />
  Heart.displayName = 'Heart'
  const Sparkles = () => <span data-testid="sparkles-icon" />
  Sparkles.displayName = 'Sparkles'
  const ArrowUp = () => <span data-testid="arrow-up-icon" />
  ArrowUp.displayName = 'ArrowUp'

  return {
    Github,
    Linkedin,
    Mail,
    Globe,
    Heart,
    Sparkles,
    ArrowUp,
  }
})

// Mock navigation config
jest.mock('@/config/navigation', () => ({
  navItems: [
    { name: 'Home', href: '/' },
    { name: 'Sections', submenu: [{ name: 'Skills', href: '#skills' }] },
  ],
}))

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    socialMediaClick: jest.fn(),
    contactClick: jest.fn(),
  },
}))

// Mock Resume Adapter
jest.mock('@/lib/resume-adapter', () => ({
  __esModule: true,
  default: {
    position: 'Software Engineer',
    summary: 'Expert developer with years of experience. Second sentence.',
  },
}))

// Mock Portfolio Data
jest.mock('@/lib/data/portfolio', () => ({
  contactInfo: {
    name: 'John Doe',
    github: 'github.com/test',
    linkedin: 'linkedin.com/test',
    email: 'test@example.com',
    website: 'example.com',
  },
}))

// Mock navigation utility
jest.mock('@/lib/navigation', () => ({
  navigateTo: jest.fn(),
}))

describe('Footer Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.history.pushState({}, '', '/')
    window.scrollTo = jest.fn()
  })

  it('renders footer content correctly', () => {
    render(<Footer />)
    expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    expect(screen.getByText(/Expert developer with years of experience/i)).toBeInTheDocument()
    expect(screen.getByText(/John Doe/i)).toBeInTheDocument()
  })

  it('handles scroll to top', () => {
    render(<Footer />)
    const backToTopButton = screen.getByText(/Back to Top/i)
    fireEvent.click(backToTopButton)
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('tracks social media clicks', () => {
    render(<Footer />)
    const githubLink = screen.getByLabelText('GitHub')
    fireEvent.click(githubLink)
    expect(analytics.socialMediaClick).toHaveBeenCalledWith('github')
  })

  it('tracks email clicks', () => {
    render(<Footer />)
    const emailLink = screen.getByLabelText('Email')
    fireEvent.click(emailLink)
    expect(analytics.contactClick).toHaveBeenCalledWith('email')
  })

  it('handles logo click', () => {
    render(<Footer />)
    const logoButton = screen.getByTestId('logo-button')
    fireEvent.click(logoButton)
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('handles social media and contact links', () => {
    render(<Footer />)

    // Social links
    const githubLink = screen.getAllByTestId('github-icon')[0]!.closest('a')
    if (githubLink) {
      fireEvent.click(githubLink)
      expect(analytics.socialMediaClick).toHaveBeenCalledWith('github')
    }

    const linkedinLink = screen.getAllByTestId('linkedin-icon')[0]!.closest('a')
    if (linkedinLink) {
      fireEvent.click(linkedinLink)
      expect(analytics.socialMediaClick).toHaveBeenCalledWith('linkedin')
    }

    // Contact links
    const mailLink = screen.getAllByTestId('mail-icon')[0]!.closest('a')
    if (mailLink) {
      fireEvent.click(mailLink)
      expect(analytics.contactClick).toHaveBeenCalledWith('email')
    }
  })

  it('renders and handles navigation links in footer', () => {
    render(<Footer />)

    // Check main nav items
    const homeLink = screen.getAllByText('Home')[0]
    expect(homeLink).toBeInTheDocument()

    // Click a nav item (Home) on home page
    const itemToClick = screen.getAllByText('Home')[0]!
    fireEvent.click(itemToClick)
    // Since it's '/', it handles it as direct link
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('handles anchor links in footer', () => {
    const scrollIntoViewMock = jest.fn()
    document.querySelector = jest.fn().mockReturnValue({ scrollIntoView: scrollIntoViewMock })

    render(<Footer />)

    // Find Skills link (which is in a submenu)
    const skillsLink = screen.getAllByText('Skills')[0]!
    fireEvent.click(skillsLink)

    // On home page, it should scroll
    expect(scrollIntoViewMock).toHaveBeenCalled()

    // On other page, it should navigate
    window.history.pushState({}, '', '/other')
    fireEvent.click(skillsLink)
    expect(navigateTo).toHaveBeenCalledWith('/#skills')
  })

  it('handles miscellaneous links and scroll to top', () => {
    const scrollToMock = jest.fn()
    window.scrollTo = scrollToMock
    render(<Footer />)

    // Scroll to top
    const backToTop = screen.getByTestId('back-to-top')
    fireEvent.click(backToTop)
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

    // External links
    const editTemplate = screen.getByTestId('edit-template-link')
    expect(editTemplate).toHaveAttribute('href', expect.stringContaining('customization'))

    // Scroll to trigger visibility
    act(() => {
      window.scrollY = 400
      window.dispatchEvent(new Event('scroll'))
    })
    expect(backToTop).toBeInTheDocument()

    // Test back to top analytics
    fireEvent.click(backToTop)
    expect(analytics.socialMediaClick).toHaveBeenCalledWith('back_to_top')
  })
})
