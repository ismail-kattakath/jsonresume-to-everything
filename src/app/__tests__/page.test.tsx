// @ts-nocheck
import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock all child components to isolate page component testing
jest.mock('@/components/layout/header', () => {
  return function MockHeader() {
    return <header data-testid="header">Header</header>
  }
})

jest.mock('@/components/layout/footer', () => {
  return function MockFooter() {
    return <footer data-testid="footer">Footer</footer>
  }
})

jest.mock('@/components/sections/hero', () => {
  return function MockHero() {
    return <section data-testid="hero">Hero</section>
  }
})

jest.mock('@/components/sections/about', () => {
  return function MockAbout() {
    return <section data-testid="about">About</section>
  }
})

jest.mock('@/components/sections/skills', () => {
  return function MockSkills() {
    return <section data-testid="skills">Skills</section>
  }
})

jest.mock('@/components/sections/experience', () => {
  return function MockExperience() {
    return <section data-testid="experience">Experience</section>
  }
})

jest.mock('@/components/sections/contact', () => {
  return function MockContact() {
    return <section data-testid="contact">Contact</section>
  }
})

describe('Home Page', () => {
  it('should render the home page with all sections', () => {
    render(<Home />)

    // Verify root container has correct styling
    const container = screen.getByText('Header').closest('div')
    expect(container).toHaveClass('min-h-screen')
  })

  it('should render Header component', () => {
    render(<Home />)
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('should render Footer component', () => {
    render(<Home />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('should render main content area', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('should render Hero section inside main', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    const hero = screen.getByTestId('hero')
    expect(main).toContainElement(hero)
  })

  it('should render About section inside main', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    const about = screen.getByTestId('about')
    expect(main).toContainElement(about)
  })

  it('should render Skills section inside main', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    const skills = screen.getByTestId('skills')
    expect(main).toContainElement(skills)
  })

  it('should render Experience section inside main', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    const experience = screen.getByTestId('experience')
    expect(main).toContainElement(experience)
  })

  it('should render Contact section inside main', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    const contact = screen.getByTestId('contact')
    expect(main).toContainElement(contact)
  })

  it('should render sections in correct order', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    const sections = main.children

    expect(sections[0]).toHaveAttribute('data-testid', 'hero')
    expect(sections[1]).toHaveAttribute('data-testid', 'about')
    expect(sections[2]).toHaveAttribute('data-testid', 'skills')
    expect(sections[3]).toHaveAttribute('data-testid', 'experience')
    expect(sections[4]).toHaveAttribute('data-testid', 'contact')
  })

  it('should have correct page structure (Header -> Main -> Footer)', () => {
    render(<Home />)
    const container = screen.getByText('Header').closest('div')
    const children = container!.children

    expect(children[0]).toHaveAttribute('data-testid', 'header')
    expect(children[1].tagName).toBe('MAIN')
    expect(children[2]).toHaveAttribute('data-testid', 'footer')
  })
})
