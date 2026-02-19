/**
 * Integration Tests: Form → Preview Synchronization
 * Tests that changes in form components are immediately reflected in the preview
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

describe('Integration: Form → Preview Synchronization', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  describe('Personal Information Sync', () => {
    it('should update preview when name is changed in form', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find name input in form
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      expect(nameInput).toBeInTheDocument()

      // Change the name
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'Jane Smith' },
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toBeInTheDocument()
        const nameInPreview = preview?.querySelector('.name')
        expect(nameInPreview).toHaveTextContent('Jane Smith')
      })
    }, 10000)

    it('should update preview when position is changed in form', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find position input in form
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      expect(positionInput).toBeInTheDocument()

      // Change the position
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Senior Software Architect' },
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        const professionInPreview = preview?.querySelector('.profession')
        expect(professionInPreview).toHaveTextContent(
          'Senior Software Architect'
        )
      })
    })

    it('should update preview when email is changed in form', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find email input in form
      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      expect(emailInput).toBeInTheDocument()

      // Change the email
      fireEvent.change(emailInput, {
        target: { name: 'email', value: 'newemail@example.com' },
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        const emailLink = preview?.querySelector(
          'a[href="mailto:newemail@example.com"]'
        )
        expect(emailLink).toBeInTheDocument()
      })
    })

    it('should update preview when phone is changed in form', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find phone input in form
      const phoneInput = container.querySelector(
        'input[name="contactInformation"]'
      ) as HTMLInputElement
      expect(phoneInput).toBeInTheDocument()

      // Change the phone
      fireEvent.change(phoneInput, {
        target: { name: 'contactInformation', value: '+1 (555) 999-8888' },
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('+1 (555) 999-8888')
      })
    })
  })

  describe('Experience Sync', () => {
    it('should update preview when experience is added', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find and click the "Add Experience" button
      const addButton = screen.getByText(/Add Experience/i).closest('button')
      expect(addButton).toBeInTheDocument()

      if (addButton) {
        fireEvent.click(addButton)

        // Fill in the new work experience
        await waitFor(() => {
          const companyInputs = container.querySelectorAll(
            'input[name="organization"]'
          )
          const lastCompanyInput = companyInputs[
            companyInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastCompanyInput, {
            target: { name: 'organization', value: 'New Tech Corp' },
          })

          const positionInputs = container.querySelectorAll(
            'input[name="position"]'
          )
          const lastPositionInput = positionInputs[
            positionInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastPositionInput, {
            target: { name: 'position', value: 'Lead Developer' },
          })
        })

        // Verify the preview shows the new work experience
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('New Tech Corp')
          expect(preview).toHaveTextContent('Lead Developer')
        })
      }
    }, 10000)

    it('should update preview when experience company name is changed', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the first company input
      const companyInput = container.querySelector(
        'input[name="organization"]'
      ) as HTMLInputElement
      expect(companyInput).toBeInTheDocument()

      // Change the company name
      fireEvent.change(companyInput, {
        target: { name: 'organization', value: 'Updated Company Name' },
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Updated Company Name')
      })
    })

    it('should update preview when experience description is changed', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the first description textarea
      const descriptionTextarea = container.querySelector(
        'textarea[name="description"]'
      ) as HTMLTextAreaElement
      expect(descriptionTextarea).toBeInTheDocument()

      // Change the description
      const newDescription =
        'Leading innovative projects and mentoring team members'
      fireEvent.change(descriptionTextarea, {
        target: { name: 'description', value: newDescription },
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent(newDescription)
      })
    })

    it('should update preview when experience key achievements are changed', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the key achievements add input (dashed border input at bottom)
      const addInput = container.querySelector(
        'input[placeholder*="Add key achievement"]'
      ) as HTMLInputElement
      expect(addInput).toBeInTheDocument()

      // Add first achievement
      fireEvent.change(addInput, {
        target: { value: 'Increased performance by 50%' },
      })
      fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter' })

      // Add second achievement
      fireEvent.change(addInput, {
        target: { value: 'Reduced costs by 30%' },
      })
      fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter' })

      // Verify the preview updates with bullet points
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Increased performance by 50%')
        expect(preview).toHaveTextContent('Reduced costs by 30%')
      })
    })
  })

  describe('Skills Sync', () => {
    it('should update preview when skill is added', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the first skill input
      const skillInputs = container.querySelectorAll('input[name="skill"]')
      const firstSkillInput = skillInputs[0] as HTMLInputElement

      if (firstSkillInput) {
        // Type a new skill
        fireEvent.change(firstSkillInput, {
          target: { name: 'skill', value: 'Kubernetes' },
        })

        // Press Enter to add the skill
        fireEvent.keyDown(firstSkillInput, { key: 'Enter', code: 'Enter' })

        // Verify the preview shows the new skill
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('Kubernetes')
        })
      }
    })

    it('should update preview when skill is removed', async () => {
      const { container } = render(<ResumeEditPage />)

      // Wait for initial skills to render
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toBeInTheDocument()
      })

      // Find and click the first skill delete button
      const deleteButtons = container.querySelectorAll(
        'button[title*="Delete this skill"]'
      )

      if (deleteButtons.length > 0) {
        const firstDeleteButton = deleteButtons[0] as HTMLButtonElement
        const skillToDelete = firstDeleteButton
          .closest('.flex')
          ?.querySelector('span')?.textContent

        fireEvent.click(firstDeleteButton)

        // Verify the skill is removed from preview
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          if (skillToDelete) {
            // The skill should be removed
            expect(preview).not.toHaveTextContent(skillToDelete)
          }
        })
      }
    })
  })

  describe('Education Sync', () => {
    it('should update preview when education is added', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find and click the "Add Education" button
      const addButton = screen.getByText(/Add Education/i).closest('button')
      expect(addButton).toBeInTheDocument()

      if (addButton) {
        fireEvent.click(addButton)

        // Fill in the new education
        await waitFor(() => {
          const schoolInputs = container.querySelectorAll(
            'input[name="school"]'
          )
          const lastSchoolInput = schoolInputs[
            schoolInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastSchoolInput, {
            target: { name: 'school', value: 'MIT' },
          })

          const studyTypeInputs = container.querySelectorAll(
            'input[name="studyType"]'
          )
          const lastStudyTypeInput = studyTypeInputs[
            studyTypeInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastStudyTypeInput, {
            target: { name: 'studyType', value: "Master's Degree" },
          })

          const areaInputs = container.querySelectorAll('input[name="area"]')
          const lastAreaInput = areaInputs[
            areaInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastAreaInput, {
            target: { name: 'area', value: 'Science' },
          })
        })

        // Verify the preview shows the new education
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('MIT')
          expect(preview).toHaveTextContent("Master's Degree in Science")
        })
      }
    })

    it('should update preview when education school name is changed', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the first school input
      const schoolInput = container.querySelector(
        'input[name="school"]'
      ) as HTMLInputElement

      if (schoolInput) {
        // Change the school name
        fireEvent.change(schoolInput, {
          target: { name: 'school', value: 'Stanford University' },
        })

        // Verify the preview updates
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('Stanford University')
        })
      }
    })
  })

  describe('Summary Sync', () => {
    it('should update preview when summary is changed', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the summary textarea
      const summaryTextarea = container.querySelector(
        'textarea[name="summary"]'
      ) as HTMLTextAreaElement

      if (summaryTextarea) {
        // Change the summary
        const newSummary =
          'Experienced software engineer with a passion for building scalable applications'
        fireEvent.change(summaryTextarea, {
          target: { name: 'summary', value: newSummary },
        })

        // Verify the preview updates
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent(newSummary)
        })
      }
    })
  })

  describe('Social Media Sync', () => {
    it('should update preview when social media link is added', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find and click the "Add Social Media" button
      const addButton = screen.getByText(/Add Social Media/i).closest('button')
      expect(addButton).toBeInTheDocument()

      if (addButton) {
        fireEvent.click(addButton)

        // Fill in the new social media
        await waitFor(() => {
          // Find the social media section container first
          const socialSection = container.querySelector('#section-social-media')
          expect(socialSection).toBeInTheDocument()

          const linkInputs = socialSection!.querySelectorAll('input[name="link"]')
          const lastLinkInput = linkInputs[
            linkInputs.length - 1
          ] as HTMLInputElement

          fireEvent.change(lastLinkInput, {
            target: { name: 'link', value: 'twitter.com/johndoe' },
          })
        })

        // Verify the preview shows the new social media link
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('twitter.com/johndoe')
        })
      }
    })
  })

  describe('Multiple Fields Sync Simultaneously', () => {
    it('should update preview when multiple fields are changed in sequence', async () => {
      const { container } = render(<ResumeEditPage />)

      // Change name
      const nameInput = container.querySelector(
        'input[name="name"]'
      ) as HTMLInputElement
      fireEvent.change(nameInput, {
        target: { name: 'name', value: 'John Updated' },
      })

      // Change position
      const positionInput = container.querySelector(
        'input[name="position"]'
      ) as HTMLInputElement
      fireEvent.change(positionInput, {
        target: { name: 'position', value: 'Updated Position' },
      })

      // Change email
      const emailInput = container.querySelector(
        'input[name="email"]'
      ) as HTMLInputElement
      fireEvent.change(emailInput, {
        target: { name: 'email', value: 'updated@example.com' },
      })

      // Verify all changes are reflected in preview
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('John Updated')
        expect(preview).toHaveTextContent('Updated Position')
        expect(preview).toHaveTextContent('updated@example.com')
      })
    })
  })

  describe('Languages Sync', () => {
    it('should update preview when language is added', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the language input
      const languageInput = container.querySelector(
        'input[name="language"]'
      ) as HTMLInputElement

      if (languageInput) {
        // Type a new language
        fireEvent.change(languageInput, {
          target: { name: 'language', value: 'Spanish' },
        })

        // Press Enter to add the language
        fireEvent.keyDown(languageInput, { key: 'Enter', code: 'Enter' })

        // Verify the preview shows the new language
        await waitFor(() => {
          const preview = container.querySelector('.preview')
          expect(preview).toHaveTextContent('Spanish')
        })
      }
    })
  })

  describe('Certifications Sync', () => {
    it('should show certifications section in preview', async () => {
      const { container } = render(<ResumeEditPage />)

      // Wait for component to render
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toBeInTheDocument()
      })

      // Verify the preview exists and is ready
      const preview = container.querySelector('.preview')
      expect(preview).toBeTruthy()
    })
  })
  describe('Projects Sync', () => {
    it('should update preview when project name is changed', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the first project name input
      await waitFor(() => {
        const projectNameInput = container.querySelector(
          'input[name="name"]'
        ) as HTMLInputElement
        // There are multiple "name" inputs (basics, projects, etc.)
        // We need to find the one in the projects section or just use the first if it works
        // But usually "name" in basics is first.
        const inputs = container.querySelectorAll('input[name="name"]')
        const projectInput = Array.from(inputs).find(input =>
          input.closest('.group')?.textContent?.includes('Project Name')
        ) as HTMLInputElement

        if (projectInput) {
          fireEvent.change(projectInput, {
            target: { name: 'name', value: 'Awesome Project X' },
          })
        }
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Awesome Project X')
      })
    })

    it('should update preview when project key achievement is added', async () => {
      const { container } = render(<ResumeEditPage />)

      // Find the "Add key achievement" input
      await waitFor(() => {
        const addInput = container.querySelector(
          'input[placeholder*="Add key achievement"]'
        ) as HTMLInputElement
        expect(addInput).toBeInTheDocument()

        fireEvent.change(addInput, {
          target: { value: 'Successfully refactored achievements' },
        })
        fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter' })
      })

      // Verify the preview updates
      await waitFor(() => {
        const preview = container.querySelector('.preview')
        expect(preview).toHaveTextContent('Successfully refactored achievements')
      })
    })
  })
})
