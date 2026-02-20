import { render, screen } from '@testing-library/react'
import Skills from '@/components/sections/Skills'

jest.mock('@/lib/data/portfolio', () => ({
  skills: [
    { category: 'Frontend', items: ['React', 'Next.js'] },
    { category: 'Backend', items: ['Node.js'] },
  ],
}))

describe('Skills Component', () => {
  it('renders categories and skill items', () => {
    render(<Skills />)
    expect(screen.getByText('Frontend')).toBeInTheDocument()
    expect(screen.getByText('Backend')).toBeInTheDocument()
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Node.js')).toBeInTheDocument()
  })
})
