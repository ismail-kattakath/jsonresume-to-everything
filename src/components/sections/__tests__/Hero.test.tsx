import { render, screen } from '@testing-library/react'
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
  it('renders hero section', () => {
    render(<Hero />)
    expect(screen.getByText(resumeData.name)).toBeInTheDocument()
  })

  it('displays user position/title', () => {
    render(<Hero />)
    expect(screen.getByText(resumeData.position)).toBeInTheDocument()
  })

  it('displays user summary if showSummary is true', () => {
    render(<Hero />)
    if (resumeData.showSummary && resumeData.summary) {
      // Summary might be split across elements, check for partial text
      const firstWords = resumeData.summary.split(' ').slice(0, 5).join(' ')
      expect(screen.getByText(new RegExp(firstWords, 'i'))).toBeInTheDocument()
    }
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
})
