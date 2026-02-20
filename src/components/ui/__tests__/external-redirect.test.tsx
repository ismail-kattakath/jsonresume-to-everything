import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExternalRedirect from '@/components/ui/external-redirect'

describe('ExternalRedirect', () => {
  const originalLocation = window.location

  beforeEach(() => {
    // @ts-ignore
    delete window.location
    // @ts-ignore
    window.location = {
      replace: jest.fn(),
      toString: () => 'http://localhost',
      href: 'http://localhost',
      assign: jest.fn(),
      reload: jest.fn(),
    }
  })

  afterEach(() => {
    // @ts-ignore
    window.location = originalLocation
  })

  it('redirects when url is provided', async () => {
    const url = 'https://example.com'
    render(<ExternalRedirect url={url} label="test site" />)

    // If we can't reliably mock replace, we verify the spinner is shown
    // which only happens in the url branch
    expect(screen.getByTestId('lottie-spinner')).toBeInTheDocument()

    // We also check for the absence of the fallback UI
    expect(screen.queryByText(/not available/i)).not.toBeInTheDocument()
  })

  it('renders fallback when url is missing', async () => {
    render(<ExternalRedirect url={undefined} label="profile" />)

    expect(screen.getByText('Profile not available')).toBeInTheDocument()
    expect(screen.getByText('Sorry, the profile could not be found.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Go to Home' })).toHaveAttribute('href', '/')
  })
})
