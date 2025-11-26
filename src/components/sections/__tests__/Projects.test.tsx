import { render, screen } from '@testing-library/react'
import Projects from '@/components/sections/Projects'

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
  },
}))

describe('Projects', () => {
  it('renders projects section', () => {
    render(<Projects />)
    expect(screen.getByText(/projects/i)).toBeInTheDocument()
  })

  it('renders section with correct id', () => {
    const { container } = render(<Projects />)
    const section = container.querySelector('section#projects')
    expect(section).toBeInTheDocument()
  })
})
