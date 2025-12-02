/**
 * Integration Tests: Shared Fields Synchronization Between Resume and Cover Letter Tabs
 * Tests that Personal Information and Social Media sections stay in sync across both tabs
 * Issue #96: https://github.com/ismail-kattakath/jsonresume-to-everything/issues/96
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ResumeEditPage from '@/app/resume/builder/page'

// Mock dynamic imports to avoid SSR issues
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args: unknown[]) => {
    const dynamicModule = jest.requireActual('next/dynamic')
    const dynamicActualComp = dynamicModule.default
    const RequiredComponent = dynamicActualComp(...args)
    void (RequiredComponent.preload
      ? RequiredComponent.preload()
      : RequiredComponent.render.preload())
    return RequiredComponent
  },
}))

// Mock useKeyboardShortcut hook
jest.mock('@/hooks/useKeyboardShortcut', () => ({
  __esModule: true,
  default: jest.fn(),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

describe('Integration: Shared Fields Synchronization Between Tabs', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Personal Information Synchronization', () => {
    it('should sync name changes from resume tab to cover letter tab', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find tab buttons in mode switcher
      const modeSwitcher = container.querySelector('#mode-switcher')
      expect(modeSwitcher).toBeInTheDocument()
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement

      // Change name in resume tab
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      expect(nameInput).toBeInTheDocument()
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'John Doe' },
      })

      // Switch to cover letter tab
      fireEvent.click(coverLetterTab)

      // Wait for tab switch and verify name is synced
      await waitFor(() => {
        const coverLetterNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        expect(coverLetterNameInput).toBeInTheDocument()
        expect(coverLetterNameInput.value).toBe('John Doe')
      })
    }, 10000)

    it('should sync position/job title changes from resume tab to cover letter tab', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement

      // Change position in resume tab
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      expect(positionInput).toBeInTheDocument()
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Senior Software Engineer' },
      })

      // Switch to cover letter tab
      fireEvent.click(coverLetterTab)

      // Wait for tab switch and verify position is synced
      await waitFor(() => {
        const coverLetterPositionInput = container.querySelector(
          'input[name="position"]'
        ) as HTMLInputElement
        expect(coverLetterPositionInput).toBeInTheDocument()
        expect(coverLetterPositionInput.value).toBe('Senior Software Engineer')
      })
    }, 10000)

    it('should sync email changes from cover letter tab to resume tab', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement
      const resumeTab = modeSwitcher?.querySelector(
        'button:nth-child(1)'
      ) as HTMLButtonElement

      // Switch to cover letter tab first
      fireEvent.click(coverLetterTab)

      // Wait for tab switch
      await waitFor(() => {
        const emailInput = container.querySelector(
          'input[name="email"]'
        ) as HTMLInputElement
        expect(emailInput).toBeInTheDocument()
      })

      // Change email in cover letter tab
      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      fireEvent.change(emailInput, {
        target: { name: 'email', value: 'john.doe@example.com' },
      })

      // Switch back to resume tab
      fireEvent.click(resumeTab)

      // Wait for tab switch and verify email is synced
      await waitFor(() => {
        const resumeEmailInput = container.querySelector(
          'input[name="email"]'
        ) as HTMLInputElement
        expect(resumeEmailInput).toBeInTheDocument()
        expect(resumeEmailInput.value).toBe('john.doe@example.com')
      })
    }, 10000)

    it('should sync phone/contactInformation changes bidirectionally', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement
      const resumeTab = modeSwitcher?.querySelector(
        'button:nth-child(1)'
      ) as HTMLButtonElement

      // Change phone in resume tab
      const phoneInput = container.querySelector(
        'input[name="contactInformation"]'
      ) as HTMLInputElement
      expect(phoneInput).toBeInTheDocument()
      fireEvent.change(phoneInput, {
        target: { name: 'contactInformation', value: '+1 (555) 123-4567' },
      })

      // Verify sync in cover letter
      fireEvent.click(coverLetterTab)
      await waitFor(() => {
        const clPhoneInput = container.querySelector(
          'input[name="contactInformation"]'
        ) as HTMLInputElement
        expect(clPhoneInput.value).toBe('+1 (555) 123-4567')
      })

      // Change phone in cover letter tab
      const clPhoneInput = container.querySelector(
        'input[name="contactInformation"]'
      ) as HTMLInputElement
      fireEvent.change(clPhoneInput, {
        target: { name: 'contactInformation', value: '+1 (555) 987-6543' },
      })

      // Verify sync back to resume
      fireEvent.click(resumeTab)
      await waitFor(() => {
        const resumePhoneInput = container.querySelector(
          'input[name="contactInformation"]'
        ) as HTMLInputElement
        expect(resumePhoneInput.value).toBe('+1 (555) 987-6543')
      })
    }, 10000)

    it('should sync address changes from resume to cover letter', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement

      // Change address in resume tab
      const addressInput = container.querySelector(
        'input[name="address"]'
      ) as HTMLInputElement
      expect(addressInput).toBeInTheDocument()
      fireEvent.change(addressInput, {
        target: { name: 'address', value: '123 Main St, New York, NY 10001' },
      })

      // Switch to cover letter and verify
      fireEvent.click(coverLetterTab)
      await waitFor(() => {
        const clAddressInput = container.querySelector(
          'input[name="address"]'
        ) as HTMLInputElement
        expect(clAddressInput.value).toBe('123 Main St, New York, NY 10001')
      })
    }, 10000)
  })

  describe('Multiple Field Changes', () => {
    it('should sync multiple personal information fields at once', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement

      // Change multiple fields in resume tab
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement

      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Alice Johnson' },
      })
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Product Manager' },
      })
      fireEvent.change(emailInput, {
        target: { name: 'email', value: 'alice.j@example.com' },
      })

      // Switch to cover letter and verify all fields
      fireEvent.click(coverLetterTab)
      await waitFor(() => {
        const clNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        const clPositionInput = container.querySelector(
          'input[name="position"]'
        ) as HTMLInputElement
        const clEmailInput = container.querySelector(
          'input[name="email"]'
        ) as HTMLInputElement

        expect(clNameInput.value).toBe('Alice Johnson')
        expect(clPositionInput.value).toBe('Product Manager')
        expect(clEmailInput.value).toBe('alice.j@example.com')
      })
    }, 10000)
  })

  describe('Tab Switching Persistence', () => {
    it('should maintain sync after switching tabs multiple times', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement
      const resumeTab = modeSwitcher?.querySelector(
        'button:nth-child(1)'
      ) as HTMLButtonElement

      // Change name in resume
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Bob Smith' },
      })

      // Switch to cover letter
      fireEvent.click(coverLetterTab)
      await waitFor(() => {
        const clNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        expect(clNameInput.value).toBe('Bob Smith')
      })

      // Switch back to resume
      fireEvent.click(resumeTab)
      await waitFor(() => {
        const resumeNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        expect(resumeNameInput.value).toBe('Bob Smith')
      })

      // Change position in resume
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Data Scientist' },
      })

      // Switch to cover letter again
      fireEvent.click(coverLetterTab)
      await waitFor(() => {
        const clNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        const clPositionInput = container.querySelector(
          'input[name="position"]'
        ) as HTMLInputElement
        expect(clNameInput.value).toBe('Bob Smith')
        expect(clPositionInput.value).toBe('Data Scientist')
      })
    }, 10000)
  })

  describe('Edge Cases', () => {
    it('should handle empty values correctly', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement

      // Clear name field
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: '' },
      })

      // Switch to cover letter and verify empty value syncs
      fireEvent.click(coverLetterTab)
      await waitFor(() => {
        const clNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        expect(clNameInput.value).toBe('')
      })
    }, 10000)

    it('should handle special characters in fields', async () => {
      const { container } = render(<ResumeEditPage />)

      const modeSwitcher = container.querySelector('#mode-switcher')
      const coverLetterTab = modeSwitcher?.querySelector(
        'button:nth-child(2)'
      ) as HTMLButtonElement

      // Set name with special characters
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: "O'Brien-Smith Jr." },
      })

      // Switch and verify
      fireEvent.click(coverLetterTab)
      await waitFor(() => {
        const clNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        expect(clNameInput.value).toBe("O'Brien-Smith Jr.")
      })
    }, 10000)
  })
})
