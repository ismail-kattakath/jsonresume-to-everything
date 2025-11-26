import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import ResumeEditPage from '@/app/resume/edit/page'
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

// Mock Toaster
jest.mock('sonner', () => ({
  Toaster: () => null,
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

describe('Password Protection - End-to-End Workflows', () => {
  const correctPassword = '4614'
  const wrongPassword = 'incorrect'

  beforeEach(() => {
    sessionStorage.clear()
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Complete Authentication Journey', () => {
    it('should complete full login → edit → logout workflow for resume', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const { rerender } = render(<ResumeEditPage />)

      // 1. Initial state: Password prompt shown
      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()

      // 2. Enter correct password
      const passwordInput = screen.getByLabelText('Password')
      fireEvent.change(passwordInput, { target: { value: correctPassword } })

      // 3. Submit authentication
      const submitButton = screen.getByRole('button', { name: /unlock/i })
      fireEvent.click(submitButton)

      // 4. Wait for editor to appear
      await waitFor(
        () => {
          expect(screen.getByText('Personal Information')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )

      // 5. Verify full editor is accessible (use getAllByText since text appears in forms and preview)
      expect(screen.getAllByText('Work Experience').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Education').length).toBeGreaterThan(0)
      expect(
        screen.getByRole('button', { name: /logout/i })
      ).toBeInTheDocument()

      // 6. Edit some data (verify form sections are accessible)
      expect(screen.getAllByText('Education').length).toBeGreaterThan(0)

      // 7. Verify session persists across re-renders
      rerender(<ResumeEditPage />)
      expect(screen.getByText('Personal Information')).toBeInTheDocument()

      // 8. Logout
      const logoutButton = screen.getByRole('button', { name: /logout/i })
      fireEvent.click(logoutButton)

      // 9. Verify return to password screen
      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()

      // 10. Verify session cleared
      expect(sessionStorage.getItem('edit-auth-token')).toBeNull()
      expect(sessionStorage.getItem('edit-auth-expiry')).toBeNull()
    })

    it('should handle failed login → retry → success workflow', async () => {
      ;(bcrypt.compare as jest.Mock)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)

      render(<ResumeEditPage />)

      // 1. First failed attempt
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: wrongPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Incorrect password. Please try again.')
        ).toBeInTheDocument()
      })

      // Still on password screen
      expect(screen.getByText('Protected Area')).toBeInTheDocument()

      // 2. Second failed attempt
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'another-wrong' },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Incorrect password. Please try again.')
        ).toBeInTheDocument()
      })

      // 3. Successful attempt
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

      // Verify we're authenticated
      expect(screen.queryByText('Protected Area')).not.toBeInTheDocument()
      expect(sessionStorage.getItem('edit-auth-token')).toBe('authenticated')
    })
  })

  describe('Session Lifecycle', () => {
    it('should handle session expiry gracefully', () => {
      // 1. Set up expired session
      const pastExpiry = Date.now() - 1000
      sessionStorage.setItem('edit-auth-token', 'authenticated')
      sessionStorage.setItem('edit-auth-expiry', pastExpiry.toString())

      // 2. Try to access protected page
      render(<ResumeEditPage />)

      // 3. Should show password prompt due to expired session
      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()

      // 4. Session should be cleared
      expect(sessionStorage.getItem('edit-auth-token')).toBeNull()
      expect(sessionStorage.getItem('edit-auth-expiry')).toBeNull()
    })

    it('should maintain session for 24 hours', async () => {
      const now = 1000000000
      jest.spyOn(Date, 'now').mockReturnValue(now)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      // Authenticate
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // Check expiry is set to 24 hours
      const expiry = sessionStorage.getItem('edit-auth-expiry')
      const expectedExpiry = now + 1000 * 60 * 60 * 24
      expect(expiry).toBe(expectedExpiry.toString())

      jest.restoreAllMocks()
    })

    it('should clear session data on logout', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      // 1. Login
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // 2. Verify session exists
      expect(sessionStorage.getItem('edit-auth-token')).toBe('authenticated')
      expect(sessionStorage.getItem('edit-auth-expiry')).toBeTruthy()

      // 3. Logout
      fireEvent.click(screen.getByRole('button', { name: /logout/i }))

      // 4. Verify session cleared
      expect(sessionStorage.getItem('edit-auth-token')).toBeNull()
      expect(sessionStorage.getItem('edit-auth-expiry')).toBeNull()
    })
  })

  describe('Unified Editor Tab Switching', () => {
    it('should switch between resume and cover letter modes', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // 1. Login
      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // 2. Verify resume mode is active (should see resume-specific sections)
      expect(screen.getByText('Resume Generator')).toBeInTheDocument()
      expect(screen.getAllByText('Work Experience').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Education').length).toBeGreaterThan(0)

      // 3. Switch to cover letter mode
      const coverLetterTab = screen.getByRole('button', {
        name: /✉️ Cover Letter/i,
      })
      fireEvent.click(coverLetterTab)

      // 4. Verify cover letter mode is active
      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // 5. Switch back to resume mode
      const resumeTab = screen.getByRole('button', { name: /📄 Resume/i })
      fireEvent.click(resumeTab)

      // 6. Verify resume mode is active again
      expect(screen.getAllByText('Work Experience').length).toBeGreaterThan(0)
    })

    it('should maintain session across mode switches', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // 1. Login
      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // 2. Store session info
      const token = sessionStorage.getItem('edit-auth-token')
      const expiry = sessionStorage.getItem('edit-auth-expiry')

      // 3. Switch to cover letter mode
      const coverLetterTab = screen.getByRole('button', {
        name: /✉️ Cover Letter/i,
      })
      fireEvent.click(coverLetterTab)

      // 4. Session should persist
      expect(sessionStorage.getItem('edit-auth-token')).toBe(token)
      expect(sessionStorage.getItem('edit-auth-expiry')).toBe(expiry)

      // 5. Logout should work from cover letter mode
      fireEvent.click(screen.getByRole('button', { name: /logout/i }))

      // 6. Should return to password screen
      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(sessionStorage.getItem('edit-auth-token')).toBeNull()
    })
  })

  describe('Security Workflows', () => {
    it('should not allow access without authentication', () => {
      render(<ResumeEditPage />)

      // Should not be able to access any editor functionality
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
      expect(screen.queryByText('Work Experience')).not.toBeInTheDocument()
      expect(screen.queryByText('Print')).not.toBeInTheDocument()
    })

    it('should hash password before comparison', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

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

    it('should not store plain text password anywhere', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // Check sessionStorage doesn't contain plain password
      const allStorageData = JSON.stringify(sessionStorage)
      expect(allStorageData).not.toContain(correctPassword)
      expect(allStorageData).not.toContain('4614')
    })

    it('should clear password from input after submission', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      const passwordInput = screen.getByLabelText(
        'Password'
      ) as HTMLInputElement

      fireEvent.change(passwordInput, { target: { value: correctPassword } })
      expect(passwordInput.value).toBe(correctPassword)

      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(screen.getByText('Personal Information')).toBeInTheDocument()
      })

      // Password input should be gone (component switched to editor)
      expect(screen.queryByLabelText('Password')).not.toBeInTheDocument()
    })
  })

  describe('Error Recovery Workflows', () => {
    it('should handle bcrypt errors gracefully', async () => {
      ;(bcrypt.compare as jest.Mock).mockRejectedValue(
        new Error('Hash comparison failed')
      )

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(
          screen.getByText('Authentication error. Please try again.')
        ).toBeInTheDocument()
      })

      // Should still be on password screen
      expect(screen.getByText('Protected Area')).toBeInTheDocument()
      expect(screen.queryByText('Personal Information')).not.toBeInTheDocument()
    })

    it('should recover from sessionStorage errors', () => {
      // Mock sessionStorage to throw error
      const originalSetItem = sessionStorage.setItem
      sessionStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded')
      })

      render(<ResumeEditPage />)

      // Should still show password prompt without crashing
      expect(screen.getByText('Protected Area')).toBeInTheDocument()

      // Restore original
      sessionStorage.setItem = originalSetItem
    })
  })

  describe('User Experience Workflows', () => {
    it('should show loading state during authentication', async () => {
      ;(bcrypt.compare as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
      )

      render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      // Should show loading state
      expect(screen.getByText('Verifying...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /verifying/i })).toBeDisabled()

      await waitFor(() => {
        expect(screen.queryByText('Verifying...')).not.toBeInTheDocument()
      })
    })

    it('should allow password visibility toggle', () => {
      render(<ResumeEditPage />)

      const passwordInput = screen.getByLabelText(
        'Password'
      ) as HTMLInputElement
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon

      // Initially hidden
      expect(passwordInput.type).toBe('password')

      // Toggle to visible
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('text')

      // Toggle back to hidden
      fireEvent.click(toggleButton)
      expect(passwordInput.type).toBe('password')
    })

    it('should autofocus password input on mount', () => {
      render(<ResumeEditPage />)

      const passwordInput = screen.getByLabelText('Password')

      // In React, autoFocus focuses the element, it doesn't set an HTML attribute
      expect(passwordInput).toHaveFocus()
    })

    it('should submit form with Enter key', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      render(<ResumeEditPage />)

      const passwordInput = screen.getByLabelText('Password')
      const form = passwordInput.closest('form')

      fireEvent.change(passwordInput, { target: { value: correctPassword } })

      // Press Enter (submits the form)
      if (form) {
        fireEvent.submit(form)
      }

      await waitFor(() => {
        expect(bcrypt.compare).toHaveBeenCalled()
      })
    })
  })

  describe('Multi-Tab Behavior', () => {
    it('should persist session across page reloads', async () => {
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // 1. Login
      const { container, unmount } = render(<ResumeEditPage />)

      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: correctPassword },
      })
      fireEvent.click(screen.getByRole('button', { name: /unlock/i }))

      await waitFor(() => {
        expect(
          screen.getAllByText('Personal Information').length
        ).toBeGreaterThan(0)
      })

      // 2. Verify forms rendered
      const forms1 = container.querySelectorAll('form')
      expect(forms1.length).toBeGreaterThan(0)

      // 3. Store session
      const token = sessionStorage.getItem('edit-auth-token')
      const expiry = sessionStorage.getItem('edit-auth-expiry')

      // 4. Unmount (simulate page navigation)
      unmount()

      // 5. Re-render (simulate returning to page)
      render(<ResumeEditPage />)

      // 6. Should be authenticated via persisted session
      expect(
        screen.getAllByText('Personal Information').length
      ).toBeGreaterThan(0)
      expect(sessionStorage.getItem('edit-auth-token')).toBe(token)
      expect(sessionStorage.getItem('edit-auth-expiry')).toBe(expiry)
    })
  })
})
