import { render, screen } from '@testing-library/react'
import Experience from '@/components/sections/Experience'

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
    h2: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      transition,
      viewport,
      ...props
    }: any) => <h2 {...props}>{children}</h2>,
    h3: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      transition,
      viewport,
      ...props
    }: any) => <h3 {...props}>{children}</h3>,
    h4: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      transition,
      viewport,
      ...props
    }: any) => <h4 {...props}>{children}</h4>,
    h5: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      transition,
      viewport,
      ...props
    }: any) => <h5 {...props}>{children}</h5>,
    p: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      transition,
      viewport,
      ...props
    }: any) => <p {...props}>{children}</p>,
    a: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      whileHover,
      whileTap,
      transition,
      viewport,
      ...props
    }: any) => <a {...props}>{children}</a>,
    span: ({
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
    }: any) => <span {...props}>{children}</span>,
    li: ({
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
    }: any) => <li {...props}>{children}</li>,
  },
}))

describe('Experience', () => {
  it('renders experience section', () => {
    render(<Experience />)
    expect(screen.getByText(/experience/i)).toBeInTheDocument()
  })

  it('renders section with correct id', () => {
    const { container } = render(<Experience />)
    const section = container.querySelector('section#experience')
    expect(section).toBeInTheDocument()
  })

  it('renders duration badge for mobile (hidden on desktop)', () => {
    const { container } = render(<Experience />)
    const mobileDurationBadges = container.querySelectorAll('.md\\:hidden')
    // Should have at least one mobile duration badge
    expect(mobileDurationBadges.length).toBeGreaterThan(0)
  })

  it('renders duration badge for desktop (hidden on mobile)', () => {
    const { container } = render(<Experience />)
    const desktopDurationBadges =
      container.querySelectorAll('.hidden.md\\:flex')
    // Should have at least one desktop duration badge
    expect(desktopDurationBadges.length).toBeGreaterThan(0)
  })

  it('renders organization names', () => {
    const { container } = render(<Experience />)
    const organizations = container.querySelectorAll('h3')
    // Should have organization headers
    expect(organizations.length).toBeGreaterThan(0)
  })

  it('renders job titles', () => {
    const { container } = render(<Experience />)
    const titles = container.querySelectorAll('h4')
    // Should have job title headers
    expect(titles.length).toBeGreaterThan(0)
  })

  it('uses responsive flex layout for experience cards', () => {
    const { container } = render(<Experience />)
    const headerDivs = container.querySelectorAll(
      '.flex.flex-col.md\\:flex-row'
    )
    // Should have responsive flex containers
    expect(headerDivs.length).toBeGreaterThan(0)
  })

  it('renders Calendar icons in duration badges', () => {
    const { container } = render(<Experience />)
    const calendarIcons = container.querySelectorAll('svg')
    // Should have multiple icons (Calendar, Briefcase, Sparkles)
    expect(calendarIcons.length).toBeGreaterThan(0)
  })

  it('renders key achievements section', () => {
    render(<Experience />)
    const achievementsHeadings = screen.getAllByText(/Key Achievements/i)
    expect(achievementsHeadings.length).toBeGreaterThan(0)
  })

  it('renders tech stack section', () => {
    render(<Experience />)
    const techStackHeadings = screen.getAllByText(/Tech Stack/i)
    expect(techStackHeadings.length).toBeGreaterThan(0)
  })

  it('renders timeline markers with Briefcase icons', () => {
    const { container } = render(<Experience />)
    const timelineMarkers = container.querySelectorAll('.rounded-full.border-4')
    // Should have timeline markers for each experience entry
    expect(timelineMarkers.length).toBeGreaterThan(0)
  })

  it('renders connecting timeline lines between cards', () => {
    const { container } = render(<Experience />)
    const timelineLines = container.querySelectorAll('.bg-gradient-to-b')
    // Should have gradient elements (timeline lines, accent borders)
    expect(timelineLines.length).toBeGreaterThan(0)
  })
})
