/**
 * Integration Tests: Complete Edit → Preview → Print Workflow
 * Tests the end-to-end user workflow from editing to viewing and printing
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

// Mock window.print
const mockPrint = jest.fn()
window.print = mockPrint

describe('Integration: Complete Edit → Preview → Print Workflow', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    mockPrint.mockClear()
  })

  describe('Basic Edit → Preview Workflow', () => {
    it('should allow user to create a resume from scratch and see live preview', async () => {
      const { container } = render(<ResumeEditPage />)

      // Step 1: Fill in personal information
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Alice Johnson' },
      })

      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'UX Designer' },
      })

      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      fireEvent.change(emailInput, {
        target: { name: 'email', value: 'alice@example.com' },
      })

      // Step 2: Verify preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Alice Johnson')
        expect(preview).toHaveTextContent('UX Designer')
        expect(preview).toHaveTextContent('alice@example.com')
      })

      // Step 3: Add work experience
      const addWorkButton = screen
        .getByText(/Add Experience/i)
        .closest('button')
      if (addWorkButton) {
        fireEvent.click(addWorkButton)

        await waitFor(() => {
          const companyInputs = container.querySelectorAll(
            'input[name="organization"]'
          )
          const lastCompanyInput = companyInputs[
            companyInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastCompanyInput, {
            target: { name: 'organization', value: 'Design Studio' },
          })

          const positionInputs = container.querySelectorAll(
            'input[name="position"]'
          )
          const lastPositionInput = positionInputs[
            positionInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastPositionInput, {
            target: { name: 'position', value: 'Senior UX Designer' },
          })
        })

        // Verify work experience appears in preview
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('Design Studio')
          expect(preview).toHaveTextContent('Senior UX Designer')
        })
      }

      // Step 4: Verify print button is present
      const printButtons = screen.getAllByText(/Print/i)
      expect(printButtons.length).toBeGreaterThan(0)
      expect(printButtons[0]).toBeInTheDocument()
    }, 10000)

    it('should maintain data consistency throughout the edit workflow', async () => {
      const { container } = render(<ResumeEditPage />)

      // Add multiple pieces of data
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Bob Smith' },
      })

      const summaryTextarea = container.querySelector(
        'textarea[name="summary"]'
      ) as HTMLTextAreaElement

      if (summaryTextarea) {
        fireEvent.change(summaryTextarea, {
          target: {
            name: 'summary',
            value: 'Experienced professional with a passion for innovation',
          },
        })
      }

      // Verify both pieces appear in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Bob Smith')
        expect(preview).toHaveTextContent(
          'Experienced professional with a passion for innovation'
        )
      })

      // Make another edit
      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      fireEvent.change(emailInput, {
        target: { name: 'email', value: 'bob@example.com' },
      })

      // Verify all data is still present
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Bob Smith')
        expect(preview).toHaveTextContent('bob@example.com')
        expect(preview).toHaveTextContent(
          'Experienced professional with a passion for innovation'
        )
      })
    }, 10000)
  })

  describe('Import → Edit → Preview Workflow', () => {
    const createMockJSONResumeFile = (data: unknown) => {
      const jsonString = JSON.stringify(data)
      const blob = new Blob([jsonString], { type: 'application/json' })
      return new File([blob], 'resume.json', { type: 'application/json' })
    }

    const sampleResume = {
      basics: {
        name: 'Charlie Brown',
        label: 'Product Manager',
        email: 'charlie@example.com',
        phone: '+1 (555) 111-2222',
        summary: 'Innovative product manager',
        location: {
          address: '456 Oak Ave',
          city: 'San Francisco',
          region: 'CA',
          postalCode: '94102',
        },
      },
      work: [
        {
          name: 'Product Co',
          position: 'Senior PM',
          startDate: '2021-01-01',
          endDate: '2023-12-31',
          summary: 'Led product development',
          highlights: ['Launched 3 major features'],
        },
      ],
    }

    it('should allow importing a resume, editing it, and seeing changes in preview', async () => {
      const { container } = render(<ResumeEditPage />)

      // Step 1: Import resume
      const importButton = screen.getByLabelText(/Import Json Resume/i)
      const file = createMockJSONResumeFile(sampleResume)
      fireEvent.change(importButton, { target: { files: [file] } })

      // Step 2: Wait for import to complete
      await waitFor(
        () => {
          const nameInput = container.querySelector(
            'input[name="name"]'
          ) as HTMLInputElement
          expect(nameInput?.value).toBe('Charlie Brown')
        },
        { timeout: 3000 }
      )

      // Step 3: Edit the imported data
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Charlie Brown Updated' },
      })

      // Step 4: Verify preview shows the edit
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Charlie Brown Updated')
        expect(preview).toHaveTextContent('Product Manager')
        expect(preview).toHaveTextContent('Product Co')
      })
    }, 10000)

    it('should allow adding new sections to imported resume', async () => {
      const { container } = render(<ResumeEditPage />)

      // Import base resume
      const importButton = screen.getByLabelText(/Import Json Resume/i)
      const file = createMockJSONResumeFile(sampleResume)
      fireEvent.change(importButton, { target: { files: [file] } })

      await waitFor(
        () => {
          const nameInput = container.querySelector(
            'input[name="name"]'
          ) as HTMLInputElement
          expect(nameInput?.value).toBe('Charlie Brown')
        },
        { timeout: 3000 }
      )

      // Add education (not in imported resume)
      const addEducationButton = screen
        .getByText(/Add Education/i)
        .closest('button')
      if (addEducationButton) {
        fireEvent.click(addEducationButton)

        await waitFor(() => {
          const schoolInputs = container.querySelectorAll(
            'input[name="school"]'
          )
          const lastSchoolInput = schoolInputs[
            schoolInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastSchoolInput, {
            target: { name: 'school', value: 'Stanford University' },
          })

          const degreeInputs = container.querySelectorAll(
            'input[name="degree"]'
          )
          const lastDegreeInput = degreeInputs[
            degreeInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastDegreeInput, {
            target: { name: 'degree', value: 'MBA' },
          })
        })

        // Verify preview shows both imported and new data
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('Charlie Brown')
          expect(preview).toHaveTextContent('Product Co')
          expect(preview).toHaveTextContent('Stanford University')
          expect(preview).toHaveTextContent('MBA')
        })
      }
    }, 10000)
  })

  describe('Export Workflow', () => {
    it('should allow exporting edited resume as JSON', async () => {
      const { container } = render(<ResumeEditPage />)

      // Edit some data
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Export Test User' },
      })

      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Export Test User')
      })

      // Find and verify export button exists
      const exportButton = screen.getByLabelText(/Export Json Resume/i)
      expect(exportButton).toBeInTheDocument()

      // Note: Actual file download testing is complex in JSDOM,
      // but we can verify the button is clickable
      expect(exportButton).not.toBeDisabled()
    })
  })

  describe('Print Workflow', () => {
    it('should display print button that is accessible throughout editing', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify print button is present initially
      const printButtons = screen.getAllByText(/Print/i)
      expect(printButtons.length).toBeGreaterThan(0)

      // Make some edits
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Print Test User' },
      })

      // Verify print button is still present
      await waitFor(() => {
        const printButtonsAfterEdit = screen.getAllByText(/Print/i)
        expect(printButtonsAfterEdit.length).toBeGreaterThan(0)
      })
    })

    it('should trigger print dialog when print button is clicked', async () => {
      render(<ResumeEditPage />)

      // Find print button
      const printButtons = screen.getAllByText(/Print/i)
      const printButton = printButtons[0]

      // Click print button
      if (printButton) {
        fireEvent.click(printButton)
      }

      // Verify print was called
      await waitFor(() => {
        expect(mockPrint).toHaveBeenCalled()
      })
    })

    it('should show formatted preview ready for printing', async () => {
      const { container } = render(<ResumeEditPage />)

      // Fill in comprehensive data
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Print Ready User' },
      })

      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Software Engineer' },
      })

      // Verify preview has the print-ready class
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toBeInTheDocument()
        expect(preview).toHaveClass('preview')
      })

      // Verify content is properly formatted
      const preview = container.querySelector('.preview')
      expect(preview).toHaveTextContent('Print Ready User')
      expect(preview).toHaveTextContent('Software Engineer')

      // Verify preview has white background (print-ready)
      expect(preview).toHaveClass('bg-white')
    }, 10000) // Increase timeout to 10s for comprehensive workflow test
  })

  describe('Complex Multi-Step Workflow', () => {
    it('should handle complete resume creation from blank to print-ready', async () => {
      const { container } = render(<ResumeEditPage />)

      // Step 1: Personal Information
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'David Martinez' },
      })

      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Full Stack Developer' },
      })

      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      fireEvent.change(emailInput, {
        target: { name: 'email', value: 'david@example.com' },
      })

      // Step 2: Summary
      const summaryTextarea = container.querySelector(
        'textarea[name="summary"]'
      ) as HTMLTextAreaElement

      if (summaryTextarea) {
        fireEvent.change(summaryTextarea, {
          target: {
            name: 'summary',
            value: 'Passionate developer with 5 years of experience',
          },
        })
      }

      // Step 3: Experience
      const addWorkButton = screen
        .getByText(/Add Experience/i)
        .closest('button')
      if (addWorkButton) {
        fireEvent.click(addWorkButton)

        await waitFor(() => {
          const companyInputs = container.querySelectorAll(
            'input[name="organization"]'
          )
          const lastCompanyInput = companyInputs[
            companyInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastCompanyInput, {
            target: { name: 'organization', value: 'Tech Solutions Inc' },
          })

          const positionInputs = container.querySelectorAll(
            'input[name="position"]'
          )
          const lastPositionInput = positionInputs[
            positionInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastPositionInput, {
            target: { name: 'position', value: 'Senior Developer' },
          })

          const descriptionTextareas = container.querySelectorAll(
            'textarea[name="description"]'
          )
          const lastDescriptionTextarea = descriptionTextareas[
            descriptionTextareas.length - 1
          ] as HTMLTextAreaElement

          fireEvent.change(lastDescriptionTextarea, {
            target: {
              name: 'description',
              value: 'Led development of microservices architecture',
            },
          })
        })
      }

      // Step 4: Education
      const addEducationButton = screen
        .getByText(/Add Education/i)
        .closest('button')
      if (addEducationButton) {
        fireEvent.click(addEducationButton)

        await waitFor(() => {
          const schoolInputs = container.querySelectorAll(
            'input[name="school"]'
          )
          const lastSchoolInput = schoolInputs[
            schoolInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastSchoolInput, {
            target: { name: 'school', value: 'Tech University' },
          })

          const degreeInputs = container.querySelectorAll(
            'input[name="degree"]'
          )
          const lastDegreeInput = degreeInputs[
            degreeInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastDegreeInput, {
            target: { name: 'degree', value: 'Bachelor of Computer Science' },
          })
        })
      }

      // Step 5: Verify complete preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')

        // Personal info
        expect(preview).toHaveTextContent('David Martinez')
        expect(preview).toHaveTextContent('Full Stack Developer')
        expect(preview).toHaveTextContent('david@example.com')

        // Summary
        expect(preview).toHaveTextContent(
          'Passionate developer with 5 years of experience'
        )

        // Experience
        expect(preview).toHaveTextContent('Tech Solutions Inc')
        expect(preview).toHaveTextContent('Senior Developer')
        expect(preview).toHaveTextContent(
          'Led development of microservices architecture'
        )

        // Education
        expect(preview).toHaveTextContent('Tech University')
        expect(preview).toHaveTextContent('Bachelor of Computer Science')
      })

      // Step 6: Verify print button is ready
      const printButtons = screen.getAllByText(/Print/i)
      expect(printButtons.length).toBeGreaterThan(0)
      expect(printButtons[0]).toBeInTheDocument()
    }, 20000)

    it('should allow editing, reviewing in preview, making corrections, and printing', async () => {
      const { container } = render(<ResumeEditPage />)

      // Step 1: Initial entry
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Emma Wilson' },
      })

      // Step 2: Review in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Emma Wilson')
      })

      // Step 3: Make correction
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Emma Wilson PhD' },
      })

      // Step 4: Verify correction in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Emma Wilson PhD')
      })

      // Step 5: Add more details
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Research Scientist' },
      })

      // Step 6: Final review in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Emma Wilson PhD')
        expect(preview).toHaveTextContent('Research Scientist')
      })

      // Step 7: Ready to print
      const printButtons = screen.getAllByText(/Print/i)
      expect(printButtons[0]).toBeInTheDocument()

      if (printButtons[0]) {
        fireEvent.click(printButtons[0])
      }

      await waitFor(() => {
        expect(mockPrint).toHaveBeenCalled()
      })
    })
  })

  describe('Responsive Preview Behavior', () => {
    it('should maintain preview visibility during editing on desktop layout', async () => {
      const { container } = render(<ResumeEditPage />)

      // Verify both form and preview are present
      const form = container.querySelector('form')
      const preview = container.querySelector('.preview')

      expect(form).toBeInTheDocument()
      expect(preview).toBeInTheDocument()

      // Make an edit
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Responsive Test' },
      })

      // Verify both are still present after edit
      await waitFor(() => {
        expect(form).toBeInTheDocument()
        expect(preview).toBeInTheDocument()
        expect(preview).toHaveTextContent('Responsive Test')
      })
    })

    it('should display preview with proper styling for print media', async () => {
      const { container } = render(<ResumeEditPage />)

      const preview = container.querySelector('.preview')

      // Verify preview has print-friendly styling
      expect(preview).toHaveClass('bg-white')
      expect(preview).toHaveClass('text-black')

      // Form should have exclude-print class
      const form = container.querySelector('form')
      expect(form).toHaveClass('exclude-print')
    })
  })

  describe('Data Persistence During Workflow', () => {
    it('should maintain all data when user adds multiple sections sequentially', async () => {
      const { container } = render(<ResumeEditPage />)

      // Add personal info
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Frank Chen' },
      })

      // Add work experience
      const addWorkButton = screen
        .getByText(/Add Experience/i)
        .closest('button')
      if (addWorkButton) {
        fireEvent.click(addWorkButton)

        await waitFor(() => {
          const companyInputs = container.querySelectorAll(
            'input[name="organization"]'
          )
          const lastCompanyInput = companyInputs[
            companyInputs.length - 1
          ] as HTMLInputElement
          fireEvent.change(lastCompanyInput, {
            target: { name: 'organization', value: 'Company A' },
          })
        })
      }

      // Verify first company is in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Company A')
      })

      // Add another work experience
      if (addWorkButton) {
        fireEvent.click(addWorkButton)

        await waitFor(() => {
          const companyInputs = container.querySelectorAll(
            'input[name="organization"]'
          )
          const lastCompanyInput = companyInputs[
            companyInputs.length - 1
          ] as HTMLInputElement
          fireEvent.change(lastCompanyInput, {
            target: { name: 'organization', value: 'Company B' },
          })
        })
      }

      // Verify all data persists in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Frank Chen')
        expect(preview).toHaveTextContent('Company A')
        expect(preview).toHaveTextContent('Company B')
      })
    }, 10000) // Increase timeout to 10s for complex multi-step workflow
  })
})
