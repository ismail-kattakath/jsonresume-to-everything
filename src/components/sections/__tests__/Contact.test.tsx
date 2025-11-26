import { render, screen } from '@testing-library/react'
import Contact from '@/components/sections/Contact'
import { contactInfo } from '@/lib/data/portfolio'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial,
      whileInView,
      transition,
      viewport,
      ...props
    }: any) => <div {...props}>{children}</div>,
    a: ({
      children,
      initial,
      whileInView,
      whileHover,
      whileTap,
      transition,
      viewport,
      ...props
    }: any) => <a {...props}>{children}</a>,
  },
}))

describe('Contact', () => {
  it('renders contact section', () => {
    render(<Contact />)
    expect(screen.getByText('Get In Touch')).toBeInTheDocument()
  })

  it('displays all contact methods', () => {
    render(<Contact />)

    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Schedule Meeting')).toBeInTheDocument()
    expect(screen.getByText('LinkedIn')).toBeInTheDocument()
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('displays email contact info', () => {
    render(<Contact />)
    expect(screen.getByText(contactInfo.email)).toBeInTheDocument()
  })

  it('renders email mailto link', () => {
    render(<Contact />)
    const emailLinks = screen.getAllByRole('link', { name: /email/i })
    expect(emailLinks.length).toBeGreaterThan(0)
    expect(emailLinks[0]).toHaveAttribute('href', `mailto:${contactInfo.email}`)
  })

  it('renders calendar link with correct attributes', () => {
    render(<Contact />)
    const calendarLink = screen.getByRole('link', { name: /schedule meeting/i })
    expect(calendarLink).toHaveAttribute('href', contactInfo.calendar)
    expect(calendarLink).toHaveAttribute('target', '_blank')
    expect(calendarLink).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders LinkedIn link', () => {
    render(<Contact />)
    const linkedinLink = screen.getByRole('link', { name: /linkedin/i })
    expect(linkedinLink).toHaveAttribute(
      'href',
      `https://${contactInfo.linkedin}`
    )
  })

  it('renders GitHub link', () => {
    render(<Contact />)
    const githubLink = screen.getByRole('link', { name: /github/i })
    expect(githubLink).toHaveAttribute('href', `https://${contactInfo.github}`)
  })

  it('displays CTA buttons', () => {
    render(<Contact />)
    expect(screen.getByText('Send Me an Email')).toBeInTheDocument()
    expect(screen.getByText('Book a Meeting')).toBeInTheDocument()
  })

  it('renders section with correct id', () => {
    const { container } = render(<Contact />)
    const section = container.querySelector('section#contact')
    expect(section).toBeInTheDocument()
  })
})
