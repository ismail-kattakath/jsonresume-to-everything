import React from 'react'
import { screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Preview from '@/components/resume/preview/Preview'
import {
  renderWithContext,
  createMockResumeData,
} from '@/lib/__tests__/test-utils'

// Store the onDragEnd callback for testing
let capturedOnDragEnd: ((result: unknown) => void) | null = null

// Mock dynamic imports
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({
    children,
    onDragEnd,
  }: {
    children: React.ReactNode
    onDragEnd: (result: unknown) => void
  }) => {
    capturedOnDragEnd = onDragEnd
    return <div data-testid="drag-drop-context">{children}</div>
  },
  Droppable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode
  }) => (
    <div data-testid="droppable">
      {children(
        {
          droppableProps: {},
          innerRef: jest.fn(),
          placeholder: null,
        },
        {
          isDraggingOver: false,
          draggingOverWith: null,
          draggingFromThisWith: null,
          isUsingPlaceholder: false,
        }
      )}
    </div>
  ),
  Draggable: ({
    children,
  }: {
    children: (provided: unknown, snapshot: unknown) => React.ReactNode
  }) => (
    <div data-testid="draggable">
      {children(
        {
          draggableProps: {},
          dragHandleProps: {},
          innerRef: jest.fn(),
        },
        {
          isDragging: false,
          isDropAnimating: false,
        }
      )}
    </div>
  ),
}))

jest.mock('react-highlight-menu', () => ({
  HighlightMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="highlight-menu">{children}</div>
  ),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode
  }) => <a {...props}>{children}</a>,
}))

jest.mock('@/hooks/useKeyboardShortcut', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('Preview Component', () => {
  describe('Basic Rendering', () => {
    it('should render name from resume data', async () => {
      const mockData = createMockResumeData({
        name: 'John Doe',
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(await screen.findByText('John Doe')).toBeInTheDocument()
    })

    it('should render position from resume data', () => {
      const mockData = createMockResumeData({
        position: 'Software Engineer',
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Software Engineer')).toBeInTheDocument()
    })

    it('should render contact information', () => {
      const mockData = createMockResumeData({
        contactInformation: '+1 (555) 123-4567',
        email: 'john@example.com',
        address: '123 Main St, City, State',
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('+1 (555) 123-4567')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
      expect(screen.getByText('123 Main St, City, State')).toBeInTheDocument()
    })
  })

  describe('Profile Picture', () => {
    it('should render profile picture when provided', () => {
      const mockData = createMockResumeData({
        profilePicture: '/images/profile.jpg',
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      const img = screen.getByAltText('profile')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/images/profile.jpg')
    })

    it('should not render profile picture when not provided', () => {
      const mockData = createMockResumeData({
        profilePicture: '',
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.queryByAltText('profile')).not.toBeInTheDocument()
    })
  })

  describe('Social Media', () => {
    it('should render social media links', () => {
      const mockData = createMockResumeData({
        socialMedia: [
          { socialMedia: 'Github', link: 'github.com/johndoe' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('github.com/johndoe')).toBeInTheDocument()
      expect(screen.getByText('linkedin.com/in/johndoe')).toBeInTheDocument()
    })

    it('should not render social media section when empty', () => {
      const mockData = createMockResumeData({
        socialMedia: [],
      })
      const { container } = renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      const socialMediaGrid = container.querySelector('.grid.grid-cols-3')
      expect(socialMediaGrid).toBeInTheDocument()
      expect(socialMediaGrid?.children).toHaveLength(0)
    })
  })

  describe('Summary Section', () => {
    it('should render summary when summary exists', () => {
      const mockData = createMockResumeData({
        summary: 'Experienced software engineer with 5 years of expertise',
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Summary')).toBeInTheDocument()
      expect(
        screen.getByText(
          'Experienced software engineer with 5 years of expertise'
        )
      ).toBeInTheDocument()
    })

    it('should not render summary when summary is empty', () => {
      const mockData = createMockResumeData({
        summary: '',
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.queryByText('Summary')).not.toBeInTheDocument()
    })
  })

  describe('Education Section', () => {
    it('should render education section when education data exists', () => {
      const mockData = createMockResumeData({
        education: [
          {
            studyType: 'Bachelor of Science',
            area: 'Computer Science',
            school: 'University of Example',
            url: 'university.edu',
            startYear: '2015-09-01',
            endYear: '2019-06-01',
          },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Education')).toBeInTheDocument()
      expect(
        screen.getByText('Bachelor of Science in Computer Science')
      ).toBeInTheDocument()
      expect(screen.getByText('University of Example')).toBeInTheDocument()
    })

    it('should not render education section when empty', () => {
      const mockData = createMockResumeData({
        education: [],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.queryByText('Education')).not.toBeInTheDocument()
    })

    it('should render multiple education entries', () => {
      const mockData = createMockResumeData({
        education: [
          {
            studyType: 'Bachelor of Science',
            area: 'Computer Science',
            school: 'University A',
            url: '',
            startYear: '2015',
            endYear: '2019',
          },
          {
            studyType: 'Master of Science',
            area: 'Engineering',
            school: 'University B',
            url: '',
            startYear: '2019',
            endYear: '2021',
          },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(
        screen.getByText('Bachelor of Science in Computer Science')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Master of Science in Engineering')
      ).toBeInTheDocument()
      expect(screen.getByText('University A')).toBeInTheDocument()
      expect(screen.getByText('University B')).toBeInTheDocument()
    })
  })

  describe('Work Experience Section', () => {
    it('should render work experience section when data exists', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Tech Corp',
            position: 'Senior Developer',
            url: 'techcorp.com',
            description: 'Led development of key features',
            keyAchievements: [{ text: 'Increased performance by 50%' }],
            startYear: '2020-01-01',
            endYear: 'Present',
            technologies: ['React', 'Node.js'],
          },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Experience')).toBeInTheDocument()
      expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      expect(screen.getByText('Tech Corp')).toBeInTheDocument()
    })

    it('should not render work experience section when empty', () => {
      const mockData = createMockResumeData({
        workExperience: [],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.queryByText('Experience')).not.toBeInTheDocument()
    })

    it('should render technologies as comma-separated values', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Tech Corp',
            position: 'Senior Developer',
            url: 'techcorp.com',
            description: 'Led development',
            keyAchievements: [{ text: 'Achievement 1' }],
            startYear: '2020-01-01',
            endYear: 'Present',
            technologies: ['React', 'Node.js', 'TypeScript', 'Docker'],
          },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Tech Stack:')).toBeInTheDocument()
      expect(
        screen.getByText('React, Node.js, TypeScript, Docker')
      ).toBeInTheDocument()
    })

    it('should not render technologies when showTechnologies is false', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Tech Corp',
            position: 'Senior Developer',
            url: 'techcorp.com',
            description: 'Led development',
            keyAchievements: [{ text: 'Achievement 1' }],
            startYear: '2020-01-01',
            endYear: 'Present',
            technologies: ['React', 'Node.js'],
            showTechnologies: false,
          },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.queryByText('Tech Stack:')).not.toBeInTheDocument()
      expect(screen.queryByText('React, Node.js')).not.toBeInTheDocument()
    })

    it('should not render technologies when technologies array is empty', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Tech Corp',
            position: 'Senior Developer',
            url: 'techcorp.com',
            description: 'Led development',
            keyAchievements: [{ text: 'Achievement 1' }],
            startYear: '2020-01-01',
            endYear: 'Present',
            technologies: [],
          },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.queryByText('Tech Stack:')).not.toBeInTheDocument()
    })

    it('should apply select-all class to technologies text', () => {
      const mockData = createMockResumeData({
        workExperience: [
          {
            organization: 'Tech Corp',
            position: 'Senior Developer',
            url: 'techcorp.com',
            description: 'Led development',
            keyAchievements: [{ text: 'Achievement 1' }],
            startYear: '2020-01-01',
            endYear: 'Present',
            technologies: ['React', 'Node.js'],
          },
        ],
      })
      const { container } = renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      const techText = container.querySelector('.select-all')
      expect(techText).toBeInTheDocument()
      expect(techText).toHaveTextContent('React, Node.js')
    })
  })

  describe('Skills Section', () => {
    it('should render skills section when skills exist', async () => {
      const mockData = createMockResumeData({
        skills: [
          {
            title: 'Programming Languages',
            skills: [
              { text: 'JavaScript', highlight: true },
              { text: 'Python', highlight: false },
            ],
          },
        ],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(
        await screen.findByText('Programming Languages')
      ).toBeInTheDocument()
      expect(screen.getByText('JavaScript')).toBeInTheDocument()
      expect(screen.getByText('Python')).toBeInTheDocument()
    })
  })

  describe('Editable vs Non-Editable States', () => {
    it('should set contentEditable to true when editable is true', () => {
      const mockData = createMockResumeData({
        name: 'John Doe',
      })
      const { container } = renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData, editable: true },
      })

      const nameElement = container.querySelector('.name')
      expect(nameElement).toHaveAttribute('contenteditable', 'true')
    })

    it('should set contentEditable to false when editable is false', () => {
      const mockData = createMockResumeData({
        name: 'John Doe',
      })
      const { container } = renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData, editable: false },
      })

      const nameElement = container.querySelector('.name')
      expect(nameElement).toHaveAttribute('contenteditable', 'false')
    })

    it('should default to editable true when not specified', () => {
      const mockData = createMockResumeData({
        name: 'John Doe',
      })
      const { container } = renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      const nameElement = container.querySelector('.name')
      expect(nameElement).toHaveAttribute('contenteditable', 'true')
    })

    it('should apply editable class to editable elements', () => {
      const mockData = createMockResumeData({
        name: 'John Doe',
        position: 'Software Engineer',
      })
      const { container } = renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      const editableElements = container.querySelectorAll('.editable')
      expect(editableElements.length).toBeGreaterThan(0)
    })
  })

  describe('Languages Section', () => {
    it('should render languages when languages exist', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Languages')).toBeInTheDocument()
    })
  })

  describe('Certifications Section', () => {
    it('should render certifications when data exists', () => {
      const mockData = createMockResumeData({
        certifications: ['AWS Certified Solutions Architect'],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.getByText('Certifications')).toBeInTheDocument()
    })

    it('should not render certifications section when empty', () => {
      const mockData = createMockResumeData({
        certifications: [],
      })
      renderWithContext(<Preview />, {
        contextValue: { resumeData: mockData },
      })

      expect(screen.queryByText('Certifications')).not.toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should render drag-drop context', () => {
      renderWithContext(<Preview />)
      expect(screen.getByTestId('drag-drop-context')).toBeInTheDocument()
    })

    it('should render highlight menu', () => {
      renderWithContext(<Preview />)
      expect(screen.getByTestId('highlight-menu')).toBeInTheDocument()
    })

    it('should use grid layout for two-column design', () => {
      const { container } = renderWithContext(<Preview />)
      const gridLayout = container.querySelector('.grid.grid-cols-3')
      expect(gridLayout).toBeInTheDocument()
    })
  })

  describe('Drag and Drop Functionality', () => {
    const mockSetResumeData = jest.fn()

    beforeEach(() => {
      jest.clearAllMocks()
      capturedOnDragEnd = null
    })

    describe('onDragEnd - No Destination', () => {
      it('should not update data when dropped outside droppable area', () => {
        const mockData = createMockResumeData({
          workExperience: [
            {
              organization: 'Company A',
              position: 'Developer',
              startYear: '2020',
              endYear: 'Present',
              description: 'Work description',
              keyAchievements: [{ text: 'Achievement 1' }],
              technologies: [],
              url: '',
            },
          ],
        })

        renderWithContext(<Preview />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        capturedOnDragEnd!({
          source: { droppableId: 'work-experience', index: 0 },
          destination: null,
        })

        expect(mockSetResumeData).not.toHaveBeenCalled()
      })
    })

    describe('onDragEnd - Same Position', () => {
      it('should not update data when dropped at same position', () => {
        const mockData = createMockResumeData({
          workExperience: [
            {
              organization: 'Company A',
              position: 'Developer',
              startYear: '2020',
              endYear: 'Present',
              description: 'Work description',
              keyAchievements: [{ text: 'Achievement 1' }],
              technologies: [],
              url: '',
            },
          ],
        })

        renderWithContext(<Preview />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        capturedOnDragEnd!({
          source: { droppableId: 'work-experience', index: 0 },
          destination: { droppableId: 'work-experience', index: 0 },
        })

        expect(mockSetResumeData).not.toHaveBeenCalled()
      })
    })

    describe('onDragEnd - Work Experience Reordering', () => {
      it('should reorder work experience items', () => {
        const mockData = createMockResumeData({
          workExperience: [
            {
              organization: 'Company A',
              position: 'Developer A',
              startYear: '2020',
              endYear: '2021',
              description: 'Work A',
              keyAchievements: [{ text: 'Achievement A' }],
              technologies: [],
              url: '',
            },
            {
              organization: 'Company B',
              position: 'Developer B',
              startYear: '2021',
              endYear: '2022',
              description: 'Work B',
              keyAchievements: [{ text: 'Achievement B' }],
              technologies: [],
              url: '',
            },
            {
              organization: 'Company C',
              position: 'Developer C',
              startYear: '2022',
              endYear: 'Present',
              description: 'Work C',
              keyAchievements: [{ text: 'Achievement C' }],
              technologies: [],
              url: '',
            },
          ],
        })

        renderWithContext(<Preview />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        // Move first item to last position
        capturedOnDragEnd!({
          source: { droppableId: 'work-experience', index: 0 },
          destination: { droppableId: 'work-experience', index: 2 },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          workExperience: [
            mockData.workExperience[1],
            mockData.workExperience[2],
            mockData.workExperience[0],
          ],
        })
      })
    })

    describe('onDragEnd - Work Experience Key Achievements', () => {
      it('should reorder key achievements within work experience', () => {
        const mockData = createMockResumeData({
          workExperience: [
            {
              organization: 'Company A',
              position: 'Developer',
              startYear: '2020',
              endYear: 'Present',
              description: 'Work description',
              keyAchievements: [
                { text: 'Achievement 1' },
                { text: 'Achievement 2' },
                { text: 'Achievement 3' },
              ],
              technologies: [],
              url: '',
            },
          ],
        })

        renderWithContext(<Preview />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        // Move first achievement to last position within work experience index 0
        capturedOnDragEnd!({
          source: {
            droppableId: 'WORK_EXPERIENCE_KEY_ACHIEVEMENT-0',
            index: 0,
          },
          destination: {
            droppableId: 'WORK_EXPERIENCE_KEY_ACHIEVEMENT-0',
            index: 2,
          },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          workExperience: [
            {
              ...mockData.workExperience[0],
              keyAchievements: [
                { text: 'Achievement 2' },
                { text: 'Achievement 3' },
                { text: 'Achievement 1' },
              ],
            },
          ],
        })
      })
    })

    describe('onDragEnd - Skills Reordering', () => {
      it('should reorder skills groups', () => {
        const mockData = createMockResumeData({
          skills: [
            {
              title: 'Programming Languages',
              skills: [{ text: 'JavaScript', highlight: false }],
            },
            {
              title: 'Frameworks',
              skills: [{ text: 'React', highlight: false }],
            },
            {
              title: 'Tools',
              skills: [{ text: 'Git', highlight: false }],
            },
          ],
        })

        renderWithContext(<Preview />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        // Move first skill group to last position
        capturedOnDragEnd!({
          source: { droppableId: 'skills', index: 0 },
          destination: { droppableId: 'skills', index: 2 },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          skills: [mockData.skills[1], mockData.skills[2], mockData.skills[0]],
        })
      })
    })

    describe('onDragEnd - Projects Reordering', () => {
      it('should reorder projects', () => {
        const mockData = createMockResumeData({
          projects: [
            {
              name: 'Project A',
              description: 'Description A',
              keyAchievements: [{ text: 'Achievement A' }],
              url: '',
              technologies: [],
            },
            {
              name: 'Project B',
              description: 'Description B',
              keyAchievements: [{ text: 'Achievement B' }],
              url: '',
              technologies: [],
            },
            {
              name: 'Project C',
              description: 'Description C',
              keyAchievements: [{ text: 'Achievement C' }],
              url: '',
              technologies: [],
            },
          ],
        })

        renderWithContext(<Preview />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        // Move first project to last position
        capturedOnDragEnd!({
          source: { droppableId: 'projects', index: 0 },
          destination: { droppableId: 'projects', index: 2 },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          projects: [
            mockData.projects[1],
            mockData.projects[2],
            mockData.projects[0],
          ],
        })
      })
    })

    describe('onDragEnd - Project Key Achievements', () => {
      it('should reorder key achievements within projects', () => {
        const mockData = createMockResumeData({
          projects: [
            {
              name: 'Project A',
              description: 'Description A',
              keyAchievements: [
                { text: 'Achievement 1' },
                { text: 'Achievement 2' },
                { text: 'Achievement 3' },
              ],
              url: '',
              technologies: [],
            },
          ],
        })

        renderWithContext(<Preview />, {
          contextValue: {
            resumeData: mockData,
            setResumeData: mockSetResumeData,
          },
        })

        expect(capturedOnDragEnd).toBeTruthy()

        // Move first achievement to last position within project index 0
        capturedOnDragEnd!({
          source: { droppableId: 'PROJECTS_KEY_ACHIEVEMENT-0', index: 0 },
          destination: { droppableId: 'PROJECTS_KEY_ACHIEVEMENT-0', index: 2 },
        })

        expect(mockSetResumeData).toHaveBeenCalledWith({
          ...mockData,
          projects: [
            {
              ...mockData.projects[0],
              keyAchievements: [
                { text: 'Achievement 2' },
                { text: 'Achievement 3' },
                { text: 'Achievement 1' },
              ],
            },
          ],
        })
      })
    })
  })
})
