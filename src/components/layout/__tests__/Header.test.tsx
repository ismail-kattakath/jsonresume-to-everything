import { render, screen, fireEvent } from '@testing-library/react'
import Header from '@/components/layout/Header'
import { navItems } from '@/config/navigation'

jest.mock('framer-motion', () => ({
  motion: {
    header: ({ children, initial, animate, transition, ...props }: any) => (
      <header {...props}>{children}</header>
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
    div: ({
      children,
      initial,
      animate,
      exit,
      transition,
      whileHover,
      whileTap,
      ...props
    }: any) => <div {...props}>{children}</div>,
    span: ({ children, initial, whileHover, transition, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
  },
}))

describe('Header', () => {
  beforeEach(() => {
    // Mock window.scrollTo and scrollIntoView
    window.scrollTo = jest.fn()
    Element.prototype.scrollIntoView = jest.fn()
  })

  it('renders header component', () => {
    render(<Header />)
    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('renders navigation items', () => {
    render(<Header />)
    navItems.forEach((item) => {
      expect(screen.getAllByText(item.name).length).toBeGreaterThan(0)
    })
  })

  it('renders mobile menu toggle button', () => {
    const { container } = render(<Header />)
    const menuButtons = container.querySelectorAll('button.md\\:hidden')
    expect(menuButtons.length).toBeGreaterThan(0)
  })

  it('toggles mobile menu on button click', () => {
    const { container } = render(<Header />)
    const menuButton = container.querySelector('button.md\\:hidden')

    // Click to open
    fireEvent.click(menuButton!)

    // Menu should toggle
    expect(menuButton).toBeInTheDocument()
  })

  it('scrolls to top when logo is clicked', () => {
    const { container } = render(<Header />)
    const logo = container.querySelector('button.group')

    fireEvent.click(logo!)

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })
})
