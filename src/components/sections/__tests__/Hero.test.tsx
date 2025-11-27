import { render, screen, fireEvent } from '@testing-library/react'
import Hero from '@/components/sections/Hero'
import resumeData from '@/lib/resumeAdapter'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      whileHover,
      transition,
      viewport,
      style,
      ...props
    }: any) => <div {...props}>{children}</div>,
    h1: ({ children, variants, initial, animate, ...props }: any) => (
      <h1 {...props}>{children}</h1>
    ),
    p: ({ children, variants, initial, animate, ...props }: any) => (
      <p {...props}>{children}</p>
    ),
    a: ({
      children,
      variants,
      initial,
      animate,
      whileHover,
      whileTap,
      ...props
    }: any) => <a {...props}>{children}</a>,
    img: ({
      variants,
      initial,
      animate,
      whileHover,
      transition,
      ...props
    }: any) => <img {...props} />,
  },
}))

describe('Hero', () => {
  beforeEach(() => {
    // Mock getElementById and scrollIntoView
    document.getElementById = jest.fn()
    Element.prototype.scrollIntoView = jest.fn()
  })

  it('renders hero section', () => {
    render(<Hero />)
    expect(screen.getByText(resumeData.name)).toBeInTheDocument()
  })

  it('displays user position/title', () => {
    render(<Hero />)
    expect(screen.getByText(resumeData.position)).toBeInTheDocument()
  })

  it('renders profile picture', () => {
    render(<Hero />)
    const images = screen.getAllByRole('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('renders CTA buttons', () => {
    render(<Hero />)
    expect(screen.getByText(/view resume/i)).toBeInTheDocument()
    expect(screen.getByText(/get in touch/i)).toBeInTheDocument()
  })

  it('renders social media links', () => {
    const { container } = render(<Hero />)
    // Social links are rendered with icons
    const links = container.querySelectorAll(
      'a[href*="linkedin"], a[href*="github"]'
    )
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders scroll indicator', () => {
    render(<Hero />)
    expect(screen.getByText(/scroll/i)).toBeInTheDocument()
  })

  it('scrolls to about section when scroll indicator is clicked', () => {
    const mockAboutElement = { scrollIntoView: jest.fn() }
    ;(document.getElementById as jest.Mock).mockReturnValue(mockAboutElement)

    const { container } = render(<Hero />)

    // Find the scroll indicator div (contains "Scroll" text and is clickable)
    const scrollIndicator =
      screen.getByText(/scroll/i).parentElement?.parentElement

    expect(scrollIndicator).toBeInTheDocument()
    fireEvent.click(scrollIndicator!)

    // Verify getElementById was called with 'about'
    expect(document.getElementById).toHaveBeenCalledWith('about')

    // Verify scrollIntoView was called
    expect(mockAboutElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
    })
  })

  it('handles scroll indicator click when about element is not found', () => {
    ;(document.getElementById as jest.Mock).mockReturnValue(null)

    const { container } = render(<Hero />)

    // Find the scroll indicator div
    const scrollIndicator =
      screen.getByText(/scroll/i).parentElement?.parentElement

    // Should not throw when element is not found (tests the ?. operator)
    expect(() => fireEvent.click(scrollIndicator!)).not.toThrow()

    // Verify getElementById was called
    expect(document.getElementById).toHaveBeenCalledWith('about')
  })
})
