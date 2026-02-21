import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Header } from '@/components/layout/header'
import { navigateTo } from '@/lib/navigation'
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
    header: mockMotion('header'),
    div: mockMotion('div'),
    button: mockMotion('button'),
    span: mockMotion('span'),
  }

  return {
    motion: motionMock,
    m: motionMock,
    AnimatePresence: function AnimatePresence({ children }: any) {
      return <>{children}</>
    },
  }
})

// Mock lucide-react
jest.mock('lucide-react', () => {
  const Menu = () => <span data-testid="menu-icon" />
  Menu.displayName = 'Menu'
  const X = () => <span data-testid="x-icon" />
  X.displayName = 'X'
  const ChevronDown = ({ style, className }: any) => (
    <span data-testid="chevron-icon" style={style} className={className} />
  )
  ChevronDown.displayName = 'ChevronDown'

  return {
    Menu,
    X,
    ChevronDown,
  }
})

// Mock logo component
jest.mock('@/components/logo', () => {
  const MockLogo = () => <div data-testid="logo" />
  MockLogo.displayName = 'Logo'
  return {
    Logo: MockLogo,
  }
})

// Mock navigation library
jest.mock('@/lib/navigation', () => ({
  navigateTo: jest.fn(),
}))

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  analytics: {
    socialMediaClick: jest.fn(),
  },
}))

// Mock navigation config
jest.mock('@/config/navigation', () => ({
  navItems: [
    { name: 'Home', href: '/' },
    {
      name: 'Sections',
      submenu: [
        { name: 'Skills', href: '#skills' },
        { name: 'Projects', href: '/projects' },
      ],
    },
    { name: 'NoHref' },
  ],
}))

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Reset window properties
    window.innerWidth = 1024
    window.history.pushState({}, '', '/')
    // Mock document.querySelector
    document.querySelector = jest.fn()
  })

  it('renders correctly and handles scroll', () => {
    render(<Header />)
    expect(screen.getByTestId('logo-button')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()

    // Test scroll
    act(() => {
      window.scrollY = 100
      window.dispatchEvent(new Event('scroll'))
    })
  })

  it('handles logo behavior', () => {
    // Test scroll to top on homepage
    window.history.pushState({}, '', '/')
    const scrollToMock = jest.fn()
    window.scrollTo = scrollToMock
    render(<Header />)

    const logoButton = screen.getByTestId('logo-button')
    fireEvent.click(logoButton)
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })

    // Test navigation on other page
    window.history.pushState({}, '', '/other')
    fireEvent.click(logoButton)
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('handles direct horizontal navigation', () => {
    render(<Header />)
    const homeButton = screen.getByText('Home').closest('button')!
    fireEvent.click(homeButton)
    expect(navigateTo).toHaveBeenCalledWith('/')

    window.history.pushState({}, '', '/other')
    fireEvent.click(homeButton)
    expect(navigateTo).toHaveBeenCalledWith('/')
  })

  it('shows dropdown on hover and handles submenu calls', () => {
    // Navigate to a non-home page to trigger navigateTo for anchors
    window.history.pushState({}, '', '/some-other-page')
    render(<Header />)

    const sectionsItem = screen.getByTestId('nav-item-sections')
    fireEvent.mouseEnter(sectionsItem)

    // The dropdown should be visible now
    const skillsLink = screen.getByTestId('submenu-desktop-skills')
    fireEvent.click(skillsLink)
    expect(navigateTo).toHaveBeenCalledWith('/#skills')

    // Re-hover as click closed the dropdown
    fireEvent.mouseEnter(sectionsItem)
    const projectsLink = screen.getByTestId('submenu-desktop-projects')
    fireEvent.click(projectsLink)
    expect(navigateTo).toHaveBeenCalledWith('/projects')

    // Test mouse leave
    jest.useFakeTimers()
    fireEvent.mouseLeave(sectionsItem)
    act(() => {
      jest.advanceTimersByTime(250)
    })
    expect(screen.queryByTestId('submenu-desktop-skills')).not.toBeInTheDocument()
    jest.useRealTimers()
  })

  it('handles mobile menu toggles and item clicks', () => {
    // Mock window.innerWidth
    window.innerWidth = 500
    render(<Header />)

    // Open menu
    const menuButton = screen.getByTestId('menu-toggle')
    fireEvent.click(menuButton)
    expect(screen.getByTestId('x-icon')).toBeInTheDocument()

    // Test direct click in mobile
    const homeMobile = screen.getByTestId('mobile-direct-home')
    fireEvent.click(homeMobile)
    expect(navigateTo).toHaveBeenCalledWith('/')

    // Menu should close
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument()

    // Re-open
    fireEvent.click(menuButton)

    // Expand submenu in mobile
    const sectionsButton = screen.getByTestId('mobile-submenu-toggle-sections')
    fireEvent.click(sectionsButton)

    // The submenu item "Skills" should now be visible in mobile
    const skillsMobile = screen.getByTestId('submenu-mobile-skills')
    fireEvent.click(skillsMobile)
    // Menu should auto-close on anchor click
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument()

    // Test scroll path in mobile
    window.history.pushState({}, '', '/')
    fireEvent.click(menuButton)
    fireEvent.click(sectionsButton)
    const element = { scrollIntoView: jest.fn() }
    document.querySelector = jest.fn().mockReturnValue(element)
    fireEvent.click(screen.getByTestId('submenu-mobile-skills'))
    expect(element.scrollIntoView).toHaveBeenCalled()

    // Test branch where element is null
    document.querySelector = jest.fn().mockReturnValue(null)
    fireEvent.click(menuButton)
    fireEvent.click(sectionsButton)
    fireEvent.click(screen.getByTestId('submenu-mobile-skills'))
    // Should not crash

    // Test toggle mobile menu off manually
    fireEvent.click(menuButton)
    expect(screen.getByTestId('x-icon')).toBeInTheDocument()
    fireEvent.click(menuButton)
    expect(screen.getByTestId('menu-icon')).toBeInTheDocument()
  })

  it('handles anchor navigation on homepage in desktop', () => {
    window.history.pushState({}, '', '/')
    const element = { scrollIntoView: jest.fn() }
    document.querySelector = jest.fn().mockReturnValue(element)
    render(<Header />)

    const sectionsItem = screen.getByTestId('nav-item-sections')
    fireEvent.mouseEnter(sectionsItem)

    const skillsLink = screen.getByTestId('submenu-desktop-skills')
    fireEvent.click(skillsLink)
    expect(element.scrollIntoView).toHaveBeenCalled()
  })

  it('handles scrolled state for coverage', () => {
    render(<Header />)
    act(() => {
      window.scrollY = 50
      window.dispatchEvent(new Event('scroll'))
    })
  })

  it('handles noHref item for coverage', () => {
    render(<Header />)
    const noHrefButton = screen.getByText('NoHref').closest('button')!
    fireEvent.click(noHrefButton)
    expect(navigateTo).not.toHaveBeenCalled()
  })
})
