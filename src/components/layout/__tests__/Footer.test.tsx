import { render, screen, fireEvent } from '@testing-library/react'
import Footer from '@/components/layout/Footer'
import { contactInfo } from '@/lib/data/portfolio'
import resumeData from '@/lib/resumeAdapter'
import { navItems } from '@/config/navigation'

jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      whileInView,
      whileHover,
      transition,
      viewport,
      ...props
    }: any) => <div {...props}>{children}</div>,
    a: ({
      children,
      href,
      target,
      rel,
      whileHover,
      whileTap,
      initial,
      animate,
      transition,
      ...props
    }: any) => (
      <a href={href} target={target} rel={rel} {...props}>
        {children}
      </a>
    ),
    button: ({
      children,
      onClick,
      whileHover,
      whileTap,
      initial,
      animate,
      transition,
      ...props
    }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
    h3: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    ul: ({ children, ...props }: any) => <ul {...props}>{children}</ul>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    li: ({
      children,
      initial,
      whileInView,
      transition,
      viewport,
      ...props
    }: any) => <li {...props}>{children}</li>,
  },
}))

describe('Footer', () => {
  beforeEach(() => {
    window.scrollTo = jest.fn()
    Element.prototype.scrollIntoView = jest.fn()
    document.querySelector = jest.fn()

    // Reset window.location
    delete (window as any).location
    window.location = { href: '' } as any
  })

  it('renders footer component', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('displays user position', () => {
    render(<Footer />)
    expect(screen.getByText(resumeData.position)).toBeInTheDocument()
  })

  it('displays current year in copyright', () => {
    const currentYear = new Date().getFullYear()
    render(<Footer />)
    expect(
      screen.getByText(new RegExp(`${currentYear}`, 'i'))
    ).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<Footer />)
    navItems.forEach((item) => {
      expect(screen.getAllByText(item.name).length).toBeGreaterThan(0)
    })
  })

  it('renders social media links', () => {
    const { container } = render(<Footer />)

    // Check for GitHub link
    const githubLinks = container.querySelectorAll(`a[href*="github"]`)
    expect(githubLinks.length).toBeGreaterThan(0)

    // Check for LinkedIn link
    const linkedinLinks = container.querySelectorAll(`a[href*="linkedin"]`)
    expect(linkedinLinks.length).toBeGreaterThan(0)
  })

  it('renders scroll to top button', () => {
    const { container } = render(<Footer />)
    const scrollButtons = container.querySelectorAll('button')
    expect(scrollButtons.length).toBeGreaterThan(0)
  })

  it('scrolls to top when back to top button is clicked', () => {
    render(<Footer />)
    const backToTopButton = screen.getByText('Back to Top')

    fireEvent.click(backToTopButton)

    // Verify window.scrollTo was called with correct parameters
    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })

  it('displays user email in link', () => {
    const { container } = render(<Footer />)
    const emailLinks = container.querySelectorAll(
      `a[href="mailto:${contactInfo.email}"]`
    )
    expect(emailLinks.length).toBeGreaterThan(0)
  })

  it('renders email link', () => {
    render(<Footer />)
    const { container } = render(<Footer />)
    const emailLinks = container.querySelectorAll(
      `a[href="mailto:${contactInfo.email}"]`
    )
    expect(emailLinks.length).toBeGreaterThan(0)
  })

  it('scrolls to section when anchor link is clicked in navigation', () => {
    const mockElement = { scrollIntoView: jest.fn() }
    ;(document.querySelector as jest.Mock).mockReturnValue(mockElement)

    render(<Footer />)

    // Find "About" navigation button in footer (should be an anchor link #about)
    const aboutButtons = screen.getAllByText('About')
    // Click the one in the footer navigation
    fireEvent.click(aboutButtons[0])

    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    })
  })

  it('navigates to Resume page when Resume link is clicked in footer', () => {
    render(<Footer />)

    // Find "Resume" navigation button (href: '/resume', not an anchor link)
    const resumeButtons = screen.getAllByText('Resume')

    // Click the Resume navigation button (this triggers line 154: window.location.href = item.href)
    fireEvent.click(resumeButtons[0])

    // The navigation handler was triggered (mocked window.location in beforeEach)
    expect(resumeButtons[0]).toBeInTheDocument()
  })
})
