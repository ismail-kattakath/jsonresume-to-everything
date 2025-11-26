import { render, screen, fireEvent } from '@testing-library/react'
import Skills from '@/components/resume/preview/Skills'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData, SkillGroup } from '@/types/resume'

const mockSkillGroup: SkillGroup = {
  title: 'Programming Languages',
  skills: [
    { text: 'JavaScript', highlight: false },
    { text: 'TypeScript', highlight: true },
    { text: 'Python', highlight: false },
  ],
}

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Developer',
  email: 'john@example.com',
  phone: '+1234567890',
  location: 'Test City',
  summary: 'Test summary',
  website: 'https://example.com',
  showSummary: true,
  workExperience: [],
  education: [],
  skillGroups: [mockSkillGroup],
  projects: [],
  certifications: [],
  languages: [],
  socialMedia: {
    linkedin: '',
    github: '',
    twitter: '',
  },
  // Legacy skills field for backward compatibility
  skills: [mockSkillGroup],
}

const mockSetResumeData = jest.fn()

const renderWithContext = (
  title: string,
  skills: any[],
  editable = true,
  resumeData = mockResumeData
) => {
  return render(
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData: mockSetResumeData,
        editable,
      }}
    >
      <Skills title={title} skills={skills} />
    </ResumeContext.Provider>
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

    it('renders highlighted skill with special styling', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)
      const typescriptSkill = screen.getByText('TypeScript')
      expect(typescriptSkill).toHaveClass('bg-blue-100', 'font-semibold')
    })

    it('renders regular skill without highlight styling', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)
      const jsSkill = screen.getByText('JavaScript')
      expect(jsSkill).toHaveClass('editable')
      expect(jsSkill).not.toHaveClass('bg-blue-100')
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
      const jsSkill = screen.getByText('JavaScript')
      expect(jsSkill).toHaveAttribute('contentEditable', 'true')
    })

    it('disables editing when editable is false', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills, false)
      const title = screen.getByText('Programming Languages')
      const jsSkill = screen.getByText('JavaScript')

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

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        skills: [
          {
            title: 'Tech Stack',
            skills: mockSkillGroup.skills,
          },
        ],
      })
    })

    it('finds and updates correct skill group by title', () => {
      const resumeDataWithMultipleGroups: ResumeData = {
        ...mockResumeData,
        skills: [
          mockSkillGroup,
          {
            title: 'Frameworks',
            skills: [{ text: 'React', highlight: false }],
          },
        ],
      }

      renderWithContext(
        'Frameworks',
        [{ text: 'React', highlight: false }],
        true,
        resumeDataWithMultipleGroups
      )

      const titleElement = screen.getByText('Frameworks')
      titleElement.innerText = 'Libraries & Frameworks'
      fireEvent.blur(titleElement)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...resumeDataWithMultipleGroups,
        skills: [
          mockSkillGroup,
          {
            title: 'Libraries & Frameworks',
            skills: [{ text: 'React', highlight: false }],
          },
        ],
      })
    })
  })

  describe('Skill Editing', () => {
    it('skill elements are contentEditable when editable is true', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills, true)

      const jsSkill = screen.getByText('JavaScript')
      const tsSkill = screen.getByText('TypeScript')
      const pythonSkill = screen.getByText('Python')

      expect(jsSkill).toHaveAttribute('contentEditable', 'true')
      expect(tsSkill).toHaveAttribute('contentEditable', 'true')
      expect(pythonSkill).toHaveAttribute('contentEditable', 'true')
    })

    it('skill elements have blur handler attached', () => {
      const { container } = renderWithContext(
        'Programming Languages',
        mockSkillGroup.skills
      )

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
            skills: [
              { text: 'React', highlight: false },
              { text: 'Next.js', highlight: true },
            ],
          },
        ],
      }

      renderWithContext(
        'Frameworks',
        [
          { text: 'React', highlight: false },
          { text: 'Next.js', highlight: true },
        ],
        true,
        resumeDataWithMultipleGroups
      )

      // Should show Frameworks group
      expect(screen.getByText('Frameworks')).toBeInTheDocument()
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Next.js')).toBeInTheDocument()

      // Should not show Programming Languages group
      expect(
        screen.queryByText('Programming Languages')
      ).not.toBeInTheDocument()
      expect(screen.queryByText('JavaScript')).not.toBeInTheDocument()
    })

    it('updates correct group when editing skills in multi-group resume', () => {
      const resumeDataWithMultipleGroups: ResumeData = {
        ...mockResumeData,
        skills: [
          mockSkillGroup,
          {
            title: 'Frameworks',
            skills: [
              { text: 'React', highlight: false },
              { text: 'Next.js', highlight: true },
            ],
          },
        ],
      }

      renderWithContext(
        'Frameworks',
        [
          { text: 'React', highlight: false },
          { text: 'Next.js', highlight: true },
        ],
        true,
        resumeDataWithMultipleGroups
      )

      const reactSkill = screen.getByText('React')
      reactSkill.innerText = 'React 19'
      fireEvent.blur(reactSkill)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...resumeDataWithMultipleGroups,
        skills: [
          mockSkillGroup, // Unchanged
          {
            title: 'Frameworks',
            skills: [
              { text: 'React 19', highlight: false },
              { text: 'Next.js', highlight: true },
            ],
          },
        ],
      })
    })
  })

  describe('Edge Cases', () => {
    it('renders single skill without comma', () => {
      renderWithContext('Tools', [{ text: 'Git', highlight: false }])
      const container = screen.getByText('Git').parentElement
      expect(container?.textContent).toBe('Git')
    })

    it('handles skill with special characters', () => {
      renderWithContext('Frameworks', [
        { text: 'React.js', highlight: false },
        { text: 'Node.js', highlight: false },
      ])

      expect(screen.getByText('React.js')).toBeInTheDocument()
      expect(screen.getByText('Node.js')).toBeInTheDocument()
    })

    it('highlighted skills maintain bg-blue-100 class', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)

      const tsSkill = screen.getByText('TypeScript')
      const jsSkill = screen.getByText('JavaScript')

      // TypeScript is highlighted
      expect(tsSkill).toHaveClass('bg-blue-100', 'font-semibold')

      // JavaScript is not highlighted
      expect(jsSkill).not.toHaveClass('bg-blue-100')
    })

    it('renders correct number of skills for the group', () => {
      renderWithContext('Programming Languages', mockSkillGroup.skills)

      const container = screen.getByText('Programming Languages').nextSibling
      const skillElements =
        screen.getByText('JavaScript').parentElement?.parentElement

      // Verify all 3 skills are rendered
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })
})
