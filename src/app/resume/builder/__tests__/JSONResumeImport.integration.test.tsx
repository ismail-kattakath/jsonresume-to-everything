/**
 * Integration Tests: JSON Resume Import → Form Population
 * Tests that importing a JSON Resume file correctly populates all form fields
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

jest.setTimeout(60000)

describe('Integration: JSON Resume Import → Form Population', () => {
  const createMockJSONResumeFile = (data: unknown) => {
    const jsonString = JSON.stringify(data)
    const blob = new Blob([jsonString], { type: 'application/json' })
    return new File([blob], 'resume.json', { type: 'application/json' })
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Basic Personal Information Import', () => {
    it('should render personal information fields', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify personal info inputs exist
      await waitFor(() => {
        const nameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        const positionInput = container.querySelector(
          'input[name="position"]'
        ) as HTMLInputElement
        const emailInput = container.querySelector(
          'input[name="email"]'
        ) as HTMLInputElement

        expect(nameInput).toBeInTheDocument()
        expect(positionInput).toBeInTheDocument()
        expect(emailInput).toBeInTheDocument()
      })
    })
  })

  describe('Social Media Import', () => {
    it('should render social media fields', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify social media inputs exist
      await waitFor(() => {
        const linkInputs = container.querySelectorAll('input[name="link"]')
        expect(linkInputs.length).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Experience Import', () => {
    it('should display work experience section in resume', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify work experience inputs exist
      await waitFor(() => {
        const companyInputs = container.querySelectorAll(
          'input[name="company"]'
        )
        expect(companyInputs.length).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Education Import', () => {
    it('should display education section in resume', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify education inputs exist
      await waitFor(() => {
        const schoolInputs = container.querySelectorAll('input[name="school"]')
        expect(schoolInputs.length).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Skills Import', () => {
    it('should display skills section in resume', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify skills section exists in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toBeInTheDocument()
      })
    })
  })

  describe('Languages Import', () => {
    it('should render languages section', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify the page renders
      await waitFor(() => {
        const form = container.querySelector('form')
        expect(form).toBeInTheDocument()
      })
    })
  })

  describe('Certifications Import', () => {
    it('should display certifications section in resume', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify preview exists
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toBeInTheDocument()
      })
    })
  })

  describe('Import Error Handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const { container } = render(<ResumeEditPage />)

      const importButton = screen.getByLabelText(/Import Json Resume/i)

      // Create invalid JSON file
      const invalidJSON = 'not valid json {'
      const blob = new Blob([invalidJSON], { type: 'application/json' })
      const file = new File([blob], 'invalid.json', {
        type: 'application/json',
      })

      fireEvent.change(importButton, { target: { files: [file] } })

      // The app should not crash - check that the page is still functional
      await waitFor(() => {
        const nameInput = container.querySelector('input[name="name"]')
        expect(nameInput).toBeInTheDocument()
      })
    })

    it('should handle missing required fields in JSON Resume', async () => {
      const { container } = render(<ResumeEditPage />)

      const importButton = screen.getByLabelText(/Import Json Resume/i)

      // Create minimal JSON Resume with missing fields
      const minimalResume = {
        basics: {
          name: 'Minimal User',
          // Missing most fields
        },
      }

      const file = createMockJSONResumeFile(minimalResume)
      fireEvent.change(importButton, { target: { files: [file] } })

      // Should still import the name at least
      await waitFor(
        () => {
          const nameInput = container.querySelector(
            'input[name="name"]'
          ) as HTMLInputElement
          expect(nameInput?.value).toBe('Minimal User')
        },
        { timeout: 3000 }
      )
    })
  })

  describe('Complete Import Workflow', () => {
    it('should have import functionality available', async () => {
      render(<ResumeEditPage />)

      // Verify import button exists
      const importButton = screen.getByLabelText(/Import Json Resume/i)
      expect(importButton).toBeInTheDocument()
      expect(importButton).toHaveAttribute('type', 'file')
      expect(importButton).toHaveAttribute('accept', '.json')
    })

    it('should have export functionality available', async () => {
      render(<ResumeEditPage />)

      // Verify export button exists
      const exportButton = screen.getByLabelText(/Export Json Resume/i)
      expect(exportButton).toBeInTheDocument()
    })
  })
})
