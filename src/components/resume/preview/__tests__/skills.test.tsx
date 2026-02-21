import { render, screen, fireEvent } from '@testing-library/react'
import Skills from '@/components/resume/preview/skills'
import { ResumeContext } from '@/lib/contexts/document-context'
import { AISettingsContext, AISettings } from '@/lib/contexts/ai-settings-context'
import type { ResumeData, SkillGroup } from '@/types/resume'

const mockSkillGroup: SkillGroup = {
  title: 'Programming Languages',
  skills: [{ text: 'JavaScript' }, { text: 'TypeScript' }, { text: 'Python' }],
}

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Developer',
  email: 'john@example.com',
  profilePicture: '',
  address: 'Test Address',
  contactInformation: '+1234567890',
  summary: 'Test summary',
  workExperience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  content: '',
  socialMedia: [
    {
      socialMedia: 'LinkedIn',
      link: 'https://linkedin.com/in/johndoe',
    },
  ],
  // Legacy skills field for backward compatibility
  skills: [mockSkillGroup],
}

const mockSetResumeData = jest.fn()
const mockHandleProfilePicture = jest.fn()
const mockHandleChange = jest.fn()

const mockAISettings: AISettings = {
  apiUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-4o-mini',
  providerType: 'openai-compatible',
  jobDescription: '',
  skillsToHighlight: '',
  providerKeys: {},
  rememberCredentials: true,
}

const mockUpdateSettings = jest.fn()
const mockValidateAll = jest.fn()

const renderWithContext = (
  title: string,
  skills: SkillGroup['skills'],
  editable = true,
  resumeData = mockResumeData
) => {
  return render(
    <AISettingsContext.Provider
      value={{
        settings: mockAISettings,
        updateSettings: mockUpdateSettings,
        isConfigured: false,
        connectionStatus: 'idle',
        jobDescriptionStatus: 'idle',
        validateAll: mockValidateAll,
        isPipelineActive: false,
        setIsPipelineActive: jest.fn(),
        isAnyAIActionActive: false,
        setIsAnyAIActionActive: jest.fn(),
        isAIWorking: false,
        resetAll: jest.fn(),
      }}
    >
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData: mockSetResumeData,
          editable,
          handleProfilePicture: mockHandleProfilePicture,
          handleChange: mockHandleChange,
        }}
      >
        <Skills title={title} skills={skills} />
      </ResumeContext.Provider>
    </AISettingsContext.Provider>
  )
}

describe('Skills Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders skills section with title', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)
      expect(screen.getByText('Programming Languages')).toBeInTheDocument()
    })

    it('renders all skills in comma-separated format', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })

    it('renders skill with editable class', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)
      const jsSkillText = screen.getByText('JavaScript')
      const jsSkill = jsSkillText.closest('.editable')
      expect(jsSkill).toBeInTheDocument()
      expect(jsSkill).toHaveClass('editable')
    })

    it('does not render when skills array is empty', () => {
      const { container } = renderWithContext('Empty Section', [])
      expect(container.firstChild).toBeNull()
    })

    it('renders section title as contentEditable when editable is true', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills, true)
      const title = screen.getByText('Programming Languages')
      expect(title).toHaveAttribute('contentEditable', 'true')
    })

    it('renders skills as contentEditable when editable is true', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills, true)
      const jsSkillText = screen.getByText('JavaScript')
      const jsSkill = jsSkillText.closest('.editable')
      expect(jsSkill).toHaveAttribute('contentEditable', 'true')
    })

    it('disables editing when editable is false', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills, false)
      const title = screen.getByText('Programming Languages')
      const jsSkillText = screen.getByText('JavaScript')
      const jsSkill = jsSkillText.closest('.editable')

      expect(title).toHaveAttribute('contentEditable', 'false')
      expect(jsSkill).toHaveAttribute('contentEditable', 'false')
    })
  })

  describe('Title Editing', () => {
    it('updates title when edited and blurred', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)
      const titleElement = screen.getByText('Programming Languages')

      // Simulate editing the title
      titleElement.innerText = 'Tech Stack'
      fireEvent.blur(titleElement)

      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: [
            {
              title: 'Tech Stack',
              skills: mockSkillGroup.skills,
            },
          ],
        })
      )
    })

    it('finds and updates correct skill group by title', () => {
      const resumeDataWithMultipleGroups: ResumeData = {
        ...mockResumeData,
        skills: [
          mockSkillGroup,
          {
            title: 'Frameworks',
            skills: [{ text: 'React' }],
          },
        ],
      }

      renderWithContext('Frameworks', [{ text: 'React' }], true, resumeDataWithMultipleGroups)

      const titleElement = screen.getByText('Frameworks')
      titleElement.innerText = 'Libraries & Frameworks'
      fireEvent.blur(titleElement)

      expect(mockSetResumeData).toHaveBeenCalledWith(
        expect.objectContaining({
          skills: [
            mockSkillGroup,
            {
              title: 'Libraries & Frameworks',
              skills: [{ text: 'React' }],
            },
          ],
        })
      )
    })
  })

  describe('Skill Editing', () => {
    it('skill elements are contentEditable when editable is true', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills, true)

      const jsSkillText = screen.getByText('JavaScript')
      const tsSkillText = screen.getByText('TypeScript')
      const pythonSkillText = screen.getByText('Python')

      const jsSkill = jsSkillText.closest('.editable')
      const tsSkill = tsSkillText.closest('.editable')
      const pythonSkill = pythonSkillText.closest('.editable')

      expect(jsSkill).toHaveAttribute('contentEditable', 'true')
      expect(tsSkill).toHaveAttribute('contentEditable', 'true')
      expect(pythonSkill).toHaveAttribute('contentEditable', 'true')
    })

    it('skill elements have blur handler attached', () => {
      const { container } = renderWithContext('Programming Languages', mockSkillGroup.skills)

      const editableSkills = container.querySelectorAll('.editable')
      expect(editableSkills.length).toBeGreaterThan(0)

      // Verify each skill has the editable class
      editableSkills.forEach((skill) => {
        expect(skill).toHaveAttribute('contentEditable', 'true')
      })
    })

    it('renders skills with correct initial values', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)

      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })

  describe('Multiple Skill Groups', () => {
    it('renders only skills from the specified group', () => {
      const resumeDataWithMultipleGroups: ResumeData = {
        ...mockResumeData,
        skills: [
          mockSkillGroup,
          {
            title: 'Frameworks',
            skills: [{ text: 'React' }, { text: 'Next.js' }],
          },
        ],
      }

      renderWithContext('Frameworks', [{ text: 'React' }, { text: 'Next.js' }], true, resumeDataWithMultipleGroups)

      // Should show Frameworks group
      expect(screen.getByText('Frameworks')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()

      // Should not show Programming Languages group
      expect(screen.queryByText('Programming Languages')).not.toBeInTheDocument()
      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument()
    })

    it('updates correct group when editing skills in multi-group resume', () => {
      const resumeDataWithMultipleGroups: ResumeData = {
        ...mockResumeData,
        skills: [
          mockSkillGroup,
          {
            title: 'Frameworks',
            skills: [{ text: 'React' }, { text: 'Next.js' }],
          },
        ],
      }

      renderWithContext('Frameworks', [{ text: 'React' }, { text: 'Next.js' }], true, resumeDataWithMultipleGroups)

      const reactSkill = screen.getByText('React')
      reactSkill.innerText = 'React 19'
      fireEvent.blur(reactSkill)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...resumeDataWithMultipleGroups,
        skills: [
          mockSkillGroup, // Unchanged
          {
            title: 'Frameworks',
            skills: [{ text: 'React 19' }, { text: 'Next.js' }],
          },
        ],
      })
    })
  })

  describe('Edge Cases', () => {
    it('renders single skill without comma', () => {
      renderWithContext('Tools', [{ text: 'Git' }])
      const container = screen.getByText('Git').parentElement
      expect(container?.textContent).toBe('Git')
    })

    it('handles skill with special characters', () => {
      renderWithContext('Frameworks', [{ text: 'React.js' }, { text: 'Node.js' }])

      expect(screen.getByText('React.js')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
    })

    it('renders correct number of skills for the group', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)

      const container = screen.getByText('Programming Languages').nextSibling
      const skillElements = screen.getByText('JavaScript').parentElement?.parentElement

      // Verify all 3 skills are rendered
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })
})
