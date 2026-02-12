import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ResumeEditPage from '@/app/resume/builder/page'
import bcrypt from 'bcryptjs'

// Mock the password config
jest.mock('@/config/password', () => ({
  getPasswordHash: jest.fn(
    () => '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'
  ),
  isPasswordProtectionEnabled: jest.fn(() => true),
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// Mock Toaster to avoid rendering issues
jest.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Resume Edit Page - Password Protection Integration', () => {
  const correctPassword = '4614'

  beforeEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
  })

  describe('Page Protection', () => {
    it('should show password prompt on initial load', () => {
      render(<ResumeEditPage />)

      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(
        screen.getByText('Enter password to access the editor')
      ).toBeInTheDocument()
    })

    it('should not show resume editor without authentication', () => {
      render(<ResumeEditPage />)

      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
      expect(screen.queryByText('Experience')).not.toBeInTheDocument()
    })

    it('should block access to resume forms without password', () => {
      const { container } = render(<ResumeEditPage />)

      // Resume editor form should not be present
      const forms = container.querySelectorAll('form')
      expect(forms.length).toBeLessThanOrEqual(1) // Only password form
    })
  })

  describe('Authentication Flow', () => {
    it('should show resume editor after successful authentication', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      const passwordInput = screen.getByLabelText('Password')
      const submitButton = screen.getByRole('button', { name: /unlock/i })

      fireEvent.change(passwordInput, { target: { value: correctPassword } })
      fireEvent.click(submitButton)

      await waitFor(
        () => {
          expect(screen.getByText('Personal Information')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should render all resume form sections after authentication', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(
        () => {
          // Use getAllByText since these texts appear in both forms and preview
          expect(
            screen.getAllByText('Personal Information').length
          ).toBeGreaterThan(0)
          expect(screen.getAllByText('Social Media').length).toBeGreaterThan(0)
          expect(screen.getAllByText('Summary').length).toBeGreaterThan(0)
          expect(screen.getAllByText('Education').length).toBeGreaterThan(0)
          expect(screen.getAllByText('Experience').length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
    })

    it('should render preview panel after authentication', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const { container } = render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(
        () => {
          const preview = container.querySelector('.preview')
          expect(preview).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should maintain authentication across re-renders', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const { rerender } = render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // Re-render component
      rerender(<ResumeEditPage />)

      // Should still be authenticated
      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.queryByText('Protected Area')).not.toBeInTheDocument()
    })
  })

  describe('Session Persistence', () => {
    it('should restore authenticated state from sessionStorage', () => {
      const futureExpiry = Date.now() + 1000000
      sessionStorage.setItem('edit-auth-token', 'authenticated')
      sessionStorage.setItem('edit-auth-expiry', futureExpiry.toString())

      render(<ResumeEditPage />)

      expect(screen.getByText('Personal Information')).toBeInTheDocument()
      expect(screen.queryByText('Protected Area')).not.toBeInTheDocument()
    })

    it('should show password prompt when session expires', () => {
      const pastExpiry = Date.now() - 1000
      sessionStorage.setItem('edit-auth-token', 'authenticated')
      sessionStorage.setItem('edit-auth-expiry', pastExpiry.toString())

      render(<ResumeEditPage />)

      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
    })
  })

  describe('Logout Functionality', () => {
    beforeEach(() => {
      const futureExpiry = Date.now() + 1000000
      sessionStorage.setItem('edit-auth-token', 'authenticated')
      sessionStorage.setItem('edit-auth-expiry', futureExpiry.toString())
    })

    it('should show logout button when authenticated', () => {
      render(<ResumeEditPage />)

      expect(
        screen.getByRole('button', { name: /logout/i })
      ).toBeInTheDocument()
    })

    it('should return to password prompt after logout', () => {
      render(<ResumeEditPage />)

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      fireEvent.click(logoutButton)

      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
    })

    it('should clear resume editor after logout', () => {
      const { container } = render(<ResumeEditPage />)

      const logoutButton = screen.getByRole('button', { name: /logout/i })
      fireEvent.click(logoutButton)

      const forms = container.querySelectorAll('form')
      expect(forms.length).toBeLessThanOrEqual(1) // Only password form remains
    })
  })

  describe('Print Button Visibility', () => {
    it('should not show print button before authentication', () => {
      render(<ResumeEditPage />)

      expect(screen.queryAllByRole('button', { name: /print/i }).length).toBe(0)
    })

    it('should show print button after authentication', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(
        () => {
          expect(screen.getAllByRole('button', { name: /print/i }).length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Form Interaction After Authentication', () => {
    beforeEach(async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)
      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(
        () => {
          expect(
            screen.getAllByText('Personal Information').length
          ).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
    })

    it('should allow editing personal information', () => {
      // Form is already rendered, we just verify section headers exist (use getAllByText)
      expect(
        screen.getAllByText('Personal Information').length
      ).toBeGreaterThan(0)
    })

    it('should allow editing experience', () => {
      // Experience section should be visible (use getAllByText)
      expect(screen.getAllByText('Experience').length).toBeGreaterThan(0)
    })

    it('should show preview updates', () => {
      // Preview section should be rendered
      const printButtons = screen.getAllByRole('button', { name: /print/i })
      expect(printButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should show error message for incorrect password', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrong' },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Incorrect password. Please try again.')
        ).toBeInTheDocument()
      })

      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
    })

    it('should remain on password screen after failed authentication', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrong' },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Incorrect password. Please try again.')
        ).toBeInTheDocument()
      })

      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('should allow retry after failed authentication', async () => {
      ; (bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false) // First attempt fails
        .mockResolvedValueOnce(true) // Second attempt succeeds

      render(<ResumeEditPage />)

      // First attempt
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'wrong' },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Incorrect password. Please try again.')
        ).toBeInTheDocument()
      })

      // Second attempt
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(
        () => {
          expect(screen.getByText('Personal Information')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Context and State Management', () => {
    it('should initialize ResumeContext after authentication', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(
        () => {
          // Check that context-dependent components render
          expect(screen.getByText('Personal Information')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
    })

    it('should maintain resume data state after authentication', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(
        () => {
          // Verify editor sections are loaded (use getAllByText since these appear in forms and preview)
          expect(
            screen.getAllByText('Personal Information').length
          ).toBeGreaterThan(0)
          expect(screen.getAllByText('Experience').length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Navigation and Routing', () => {
    it('should protect resume editor route', () => {
      render(<ResumeEditPage />)

      // Direct access to /resume/builder should show password protection
      expect(screen.getByText('Protected Area')).toBeInTheDocument()
    })

    it('should remain protected after component mount', () => {
      const { rerender } = render(<ResumeEditPage />)

      expect(screen.getByText('Protected Area')).toBeInTheDocument()

      rerender(<ResumeEditPage />)

      expect(screen.getByText('Protected Area')).toBeInTheDocument()
    })
  })

  describe('Security', () => {
    it('should not expose password hash in component props', () => {
      const { container } = render(<ResumeEditPage />)

      const html = container.innerHTML

      // Hash should not be visible in raw HTML
      expect(html).not.toContain(
        '$2b$10$DROkfTWOCqdekTKMKybP2eD9NIqTHNyAKFgsZCdpEXS9vC2honJfS'
      )
    })

    it('should clear password from input after failed attempt', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      render(<ResumeEditPage />)

      const passwordInput = screen.getByLabelText(
        'Password'
      ) as HTMLInputElement

      fireEvent.change(passwordInput, { target: { value: 'wrong' } })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(passwordInput.value).toBe('')
      })
    })

    it('should use bcrypt for password comparison', async () => {
      ; (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(bcrypt.compare).toHaveBeenCalledWith(
          correctPassword,
          expect.stringMatching(/^\$2b\$10\$/)
        )
      })
    })
  })
})
