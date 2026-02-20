import { render } from '@testing-library/react'
import BackgroundImage from '@/components/background-image'
import { Logo } from '@/components/logo'

describe('BackgroundImage', () => {
  it('renders without crashing', () => {
    const { container } = render(<BackgroundImage />)
    expect(container).toBeInTheDocument()
  })

  it('renders with blur', () => {
    const { container } = render(<BackgroundImage withBlur />)
    const blurDiv = container.querySelector('.blur-sm')
    expect(blurDiv).toBeInTheDocument()
  })

  it('renders with overlay', () => {
    const { container } = render(<BackgroundImage withOverlay />)
    expect(container).toBeInTheDocument()
  })

  it('renders with both blur and overlay', () => {
    const { container } = render(<BackgroundImage withBlur withOverlay />)
    expect(container).toBeInTheDocument()
  })
})

describe('Logo', () => {
  it('renders with default props', () => {
    const { container } = render(<Logo />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('width', '1280')
    expect(svg).toHaveAttribute('height', '720')
  })

  it('renders with custom width and height', () => {
    const { container } = render(<Logo width={640} height={360} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '640')
    expect(svg).toHaveAttribute('height', '360')
  })

  it('renders with custom fill color', () => {
    const { container } = render(<Logo fill="#000000" />)
    const path = container.querySelector('path')
    expect(path).toHaveAttribute('fill', '#000000')
  })
})
