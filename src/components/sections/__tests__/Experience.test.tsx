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
})
