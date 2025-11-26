import { render, screen } from '@testing-library/react'
import About from '@/components/sections/About'

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
  },
}))

describe('About', () => {
  it('renders about section', () => {
    render(<About />)
    expect(screen.getByText(/about me/i)).toBeInTheDocument()
  })

  it('renders section with correct id', () => {
    const { container } = render(<About />)
    const section = container.querySelector('section#about')
    expect(section).toBeInTheDocument()
  })
})
