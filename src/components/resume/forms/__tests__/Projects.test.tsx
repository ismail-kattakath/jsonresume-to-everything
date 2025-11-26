import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Projects from '@/components/resume/forms/Projects'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types/resume'

// Store the onDragEnd callback for testing
let capturedOnDragEnd: ((result: unknown) => void) | null = null

// Mock @hello-pangea/dnd
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }: any) => {
    capturedOnDragEnd = onDragEnd
    return <div data-testid="drag-drop-context">{children}</div>
  },
  Droppable: ({ children, droppableId }: any) => (
    <div data-testid="droppable">
      {children(
        {
          droppableProps: { 'data-droppable-id': droppableId },
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
  Draggable: ({ children, draggableId, index }: any) => (
    <div data-testid="draggable">
      {children(
        {
          draggableProps: { 'data-draggable-id': draggableId },
          dragHandleProps: {},
          innerRef: jest.fn(),
        },
        { isDragging: false, isDropAnimating: false }
      )}
    </div>
  ),
}))

// Mock next/dynamic - same pattern as integration tests
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

const mockResumeData: ResumeData = {
  name: 'Test User',
  position: 'Developer',
  email: 'test@example.com',
  phone: '+1234567890',
  location: 'Test City',
  summary: 'Test summary',
  website: 'https://example.com',
  showSummary: true,
  workExperience: [],
  education: [],
  skillGroups: [],
  projects: [
    {
      name: 'Test Project',
      link: 'https://project.com',
      description: 'Test description',
      keyAchievements: 'Achievement 1\nAchievement 2',
      startYear: '2023-01',
      endYear: '2023-12',
    },
  ],
  certifications: [],
  languages: [],
  socialMedia: {
    linkedin: '',
    github: '',
    twitter: '',
  },
}

const mockSetResumeData = jest.fn()

const renderWithContext = (resumeData: ResumeData = mockResumeData) => {
  return render(
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData: mockSetResumeData,
      }}
    >
      <Projects />
    </ResumeContext.Provider>
  )
}

describe('Projects Form Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders projects section header', () => {
    renderWithContext()
    expect(screen.getByText('Projects')).toBeInTheDocument()
  })

  it('renders existing projects', () => {
    renderWithContext()
    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://project.com')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()
  })

  it('renders all form fields for a project', () => {
    renderWithContext()
    expect(screen.getByPlaceholderText(/project name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^link$/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/key achievements/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/start year/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/end year/i)).toBeInTheDocument()
  })

  it('updates project name on input change', () => {
    renderWithContext()
    const nameInput = screen.getByPlaceholderText(/project name/i)

    fireEvent.change(nameInput, { target: { value: 'Updated Project' } })

    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          expect.objectContaining({
            name: 'Updated Project',
          }),
        ]),
      })
    )
  })

  it('updates project link on input change', () => {
    renderWithContext()
    const linkInput = screen.getByPlaceholderText(/^link$/i)

    fireEvent.change(linkInput, {
      target: { value: 'https://newproject.com' },
    })

    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          expect.objectContaining({
            link: 'https://newproject.com',
          }),
        ]),
      })
    )
  })

  it('updates project description on textarea change', () => {
    renderWithContext()
    const descInput = screen.getByPlaceholderText(/description/i)

    fireEvent.change(descInput, {
      target: { value: 'Updated description' },
    })

    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          expect.objectContaining({
            description: 'Updated description',
          }),
        ]),
      })
    )
  })

  it('updates key achievements on textarea change', () => {
    renderWithContext()
    const achievementsInput = screen.getByPlaceholderText(/key achievements/i)

    fireEvent.change(achievementsInput, {
      target: { value: 'New achievement' },
    })

    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          expect.objectContaining({
            keyAchievements: 'New achievement',
          }),
        ]),
      })
    )
  })

  it('renders date inputs for project timeline', () => {
    const { container } = renderWithContext()
    const startYearInput = container.querySelector('input[name="startYear"]')
    const endYearInput = container.querySelector('input[name="endYear"]')

    expect(startYearInput).toBeInTheDocument()
    expect(endYearInput).toBeInTheDocument()
    expect(startYearInput).toHaveAttribute('type', 'date')
    expect(endYearInput).toHaveAttribute('type', 'date')
  })

  it('adds a new project when add button is clicked', () => {
    renderWithContext()
    const addButton = screen.getByText(/add project/i)

    fireEvent.click(addButton)

    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: expect.arrayContaining([
          mockResumeData.projects[0],
          expect.objectContaining({
            name: '',
            link: '',
            description: '',
            keyAchievements: '',
            startYear: '',
            endYear: '',
          }),
        ]),
      })
    )
  })

  it('removes a project when delete button is clicked', () => {
    renderWithContext()
    const deleteButton = screen.getByRole('button', {
      name: /delete this project/i,
    })

    fireEvent.click(deleteButton)

    expect(mockSetResumeData).toHaveBeenCalledWith(
      expect.objectContaining({
        projects: [],
      })
    )
  })

  it('renders multiple projects', () => {
    const dataWithMultipleProjects = {
      ...mockResumeData,
      projects: [
        mockResumeData.projects[0],
        {
          name: 'Second Project',
          link: 'https://second.com',
          description: 'Second description',
          keyAchievements: 'Second achievements',
          startYear: '2024-01',
          endYear: '2024-12',
        },
      ],
    }

    renderWithContext(dataWithMultipleProjects)

    expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Second Project')).toBeInTheDocument()
  })

  it('renders drag and drop context', () => {
    const { container } = renderWithContext()
    expect(
      container.querySelector('[data-testid="drag-drop-context"]')
    ).toBeInTheDocument()
  })

  it('renders empty state when no projects exist', () => {
    const emptyData = { ...mockResumeData, projects: [] }
    renderWithContext(emptyData)

    expect(screen.getByText(/add project/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/project name/i)).not.toBeInTheDocument()
  })

  describe('Drag and Drop Functionality', () => {
    const project1 = {
      name: 'Project 1',
      link: 'https://project1.com',
      description: 'First project',
      keyAchievements: 'Achievement 1',
      startYear: '2023-01',
      endYear: '2023-06',
    }

    const project2 = {
      name: 'Project 2',
      link: 'https://project2.com',
      description: 'Second project',
      keyAchievements: 'Achievement 2',
      startYear: '2023-07',
      endYear: '2023-12',
    }

    const project3 = {
      name: 'Project 3',
      link: 'https://project3.com',
      description: 'Third project',
      keyAchievements: 'Achievement 3',
      startYear: '2024-01',
      endYear: '2024-06',
    }

    it('should reorder projects from first to last position', () => {
      const dataWithProjects = {
        ...mockResumeData,
        projects: [project1, project2, project3],
      }
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: dataWithProjects,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Projects />
        </ResumeContext.Provider>
      )

      capturedOnDragEnd!({
        source: { droppableId: 'projects', index: 0 },
        destination: { droppableId: 'projects', index: 2 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...dataWithProjects,
        projects: [project2, project3, project1],
      })
    })

    it('should reorder projects from last to first position', () => {
      const dataWithProjects = {
        ...mockResumeData,
        projects: [project1, project2, project3],
      }
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: dataWithProjects,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Projects />
        </ResumeContext.Provider>
      )

      capturedOnDragEnd!({
        source: { droppableId: 'projects', index: 2 },
        destination: { droppableId: 'projects', index: 0 },
      })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...dataWithProjects,
        projects: [project3, project1, project2],
      })
    })

    it('should not reorder when dropped in same position', () => {
      const dataWithProjects = {
        ...mockResumeData,
        projects: [project1, project2],
      }
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: dataWithProjects,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Projects />
        </ResumeContext.Provider>
      )

      capturedOnDragEnd!({
        source: { droppableId: 'projects', index: 0 },
        destination: { droppableId: 'projects', index: 0 },
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should not reorder when dropped outside droppable area', () => {
      const dataWithProjects = {
        ...mockResumeData,
        projects: [project1, project2],
      }
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: dataWithProjects,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Projects />
        </ResumeContext.Provider>
      )

      capturedOnDragEnd!({
        source: { droppableId: 'projects', index: 0 },
        destination: null,
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })
  })
})
