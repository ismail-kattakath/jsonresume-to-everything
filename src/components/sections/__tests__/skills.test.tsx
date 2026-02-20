import { render, screen } from '@testing-library/react'
import Skills from '@/components/sections/Skills'

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
    }: Record<string, unknown> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
    h2: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      transition,
      viewport,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => <h2 {...props}>{children}</h2>,
    h3: ({
      children,
      variants,
      initial,
      animate,
      whileInView,
      transition,
      viewport,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => <h3 {...props}>{children}</h3>,
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
    }: Record<string, unknown> & { children?: React.ReactNode }) => <span {...props}>{children}</span>,
  },
}))

describe('Skills', () => {
  it('renders skills section', () => {
    render(<Skills />)
    expect(screen.getByText(/skills/i)).toBeInTheDocument()
  })

  it('renders section with correct id', () => {
    const { container } = render(<Skills />)
    const section = container.querySelector('section#skills')
    expect(section).toBeInTheDocument()
  })
})
