import React from 'react'
import { render, screen } from '@testing-library/react'
import { suppressConsoleError } from '@/lib/__tests__/test-utils'
import '@testing-library/jest-dom'
import Hero from '@/components/sections/hero'
import About from '@/components/sections/about'
import Contact from '@/components/sections/contact'
import Experience from '@/components/sections/experience'
import Projects from '@/components/sections/projects'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const motionMock = {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    img: ({ children, ...props }: any) => <img {...props}>{children}</img>,
    li: ({ children, ...props }: any) => <li {...props}>{children}</li>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  }
  return {
    motion: motionMock,
    m: motionMock,
    AnimatePresence: ({ children }: any) => <>{children}</>,
  }
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ChevronDown: () => <div data-testid="icon-chevron-down" />,
  Linkedin: () => <div data-testid="icon-linkedin" />,
  Github: () => <div data-testid="icon-github" />,
  Mail: () => <div data-testid="icon-mail" />,
  Calendar: () => <div data-testid="icon-calendar" />,
  Download: () => <div data-testid="icon-download" />,
  Sparkles: () => <div data-testid="icon-sparkles" />,
  Award: () => <div data-testid="icon-award" />,
  Users: () => <div data-testid="icon-users" />,
  Rocket: () => <div data-testid="icon-rocket" />,
  TrendingUp: () => <div data-testid="icon-trending-up" />,
  Code2: () => <div data-testid="icon-code2" />,
  Globe: () => <div data-testid="icon-globe" />,
  Briefcase: () => <div data-testid="icon-briefcase" />,
  Send: () => <div data-testid="icon-send" />,
  MessageCircle: () => <div data-testid="icon-message-circle" />,
  Code: () => <div data-testid="icon-code" />,
}))

// Mock rescueData and portfolio data
jest.mock('@/lib/resume-adapter', () => ({
  name: 'John Doe',
  position: 'Senior Engineer',
  summary: 'A passionate engineer. Second sentence.',
  profilePicture: '/test-image.jpg',
  socialMedia: [
    { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
    { socialMedia: 'Github', link: 'github.com/johndoe' },
  ],
}))

jest.mock('@/lib/data/portfolio', () => ({
  summary: 'A passionate engineer. Second sentence. Third sentence.',
  contactInfo: {
    email: 'john@example.com',
    calendar: 'https://calendly.com/johndoe',
    linkedin: 'linkedin.com/in/johndoe',
    github: 'github.com/johndoe',
  },
  experience: [
    {
      organization: 'Tech Corp',
      title: 'Senior Developer',
      duration: '2020 - Present',
      summary: 'Leading frontend team.',
      description: ['Achievement 1', 'Achievement 2'],
      technologies: ['React', 'Next.js'],
    },
  ],
  projects: [
    {
      name: 'Project Alpha',
      description: 'A great project.',
      highlights: ['Highlight 1'],
      technologies: ['TypeScript', 'Node.js'],
    },
  ],
}))

describe('Hero Component', () => {
  it('renders name and position from resume data', async () => {
    await suppressConsoleError(
      [/not valid as a React child/i, /whileHover|whileTap|whileInView|animate|initial|variants|transition|viewport/i],
      async () => {
        render(<Hero />)
      }
    )
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Senior Engineer')).toBeInTheDocument()
  })

  it('renders social media links correctly', async () => {
    await suppressConsoleError(
      [/whileHover|whileTap|whileInView|animate|initial|variants|transition|viewport/i],
      async () => {
        render(<Hero />)
      }
    )
    const linkedinLink = screen.getByTitle('LinkedIn Profile')
    const githubLink = screen.getByTitle('GitHub Profile')
    expect(linkedinLink).toHaveAttribute('href', 'https://linkedin.com/in/johndoe')
    expect(githubLink).toHaveAttribute('href', 'https://github.com/johndoe')
  })

  it('renders summary first sentence', async () => {
    await suppressConsoleError(
      [/whileHover|whileTap|whileInView|animate|initial|variants|transition|viewport/i],
      async () => {
        render(<Hero />)
      }
    )
    expect(screen.getByText(/A passionate engineer/)).toBeInTheDocument()
  })
})

describe('About Component', () => {
  it('renders stats and core competencies', async () => {
    await suppressConsoleError(
      [/not valid as a React child/i, /whileHover|whileTap|whileInView|animate|initial|variants|transition|viewport/i],
      async () => {
        render(<About />)
      }
    )
    expect(screen.getByText('About Me')).toBeInTheDocument()
    expect(screen.getByText('15+')).toBeInTheDocument()
    expect(screen.getByText('Years Experience')).toBeInTheDocument()
    expect(screen.getByText('GenAI & LLMOps')).toBeInTheDocument()
  })

  it('parses summary correctly into main and achievements', async () => {
    await suppressConsoleError(
      [/whileHover|whileTap|whileInView|animate|initial|variants|transition|viewport/i],
      async () => {
        render(<About />)
      }
    )
    // Main summary should have first two sentences
    expect(screen.getByText(/A passionate engineer/)).toBeInTheDocument()
    // Achievements should have the rest
    expect(screen.getByText(/Third sentence/)).toBeInTheDocument()
  })
})

describe('Contact Component', () => {
  it('renders contact methods with correct links', () => {
    render(<Contact />)
    expect(screen.getByText('Get In Touch')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()

    const emailLink = screen.getByRole('link', { name: /Send Me an Email/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com')
  })
})

describe('Experience Component', () => {
  it('renders experience items with details', () => {
    render(<Experience />)
    expect(screen.getByText('Professional Experience')).toBeInTheDocument()
    expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    expect(screen.getByText('Senior Developer')).toBeInTheDocument()
    expect(screen.getByText('Achievement 1')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
  })
})

describe('Projects Component', () => {
  it('rendersプロジェクト projects with technologies', () => {
    render(<Projects />)
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.getByText('Project Alpha')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })
})
