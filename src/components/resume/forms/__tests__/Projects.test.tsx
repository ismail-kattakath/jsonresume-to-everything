// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import Projects from '@/components/resume/forms/Projects'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types'
import React from 'react'

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

// Mock next/dynamic
jest.mock('next/dynamic', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: (loader: any) => {
      const DynamicComponent = (props: any) => {
        const { children, onDragEnd, droppableId, draggableId } = props

        // Handle DragDropContext
        if (onDragEnd) {
          capturedOnDragEnd = onDragEnd
          return <div data-testid="drag-drop-context">{children}</div>
        }

        // Handle Droppable or Draggable (they have functional children)
        if (typeof children === 'function') {
          const provided = {
            droppableProps: { 'data-droppable-id': droppableId },
            draggableProps: { 'data-draggable-id': draggableId },
            dragHandleProps: {},
            innerRef: (el: any) => el,
            placeholder: null,
          }
          const snapshot = { isDragging: false, isDraggingOver: false }
          return (
            <div data-testid={droppableId ? 'droppable' : 'draggable'}>
              {children(provided, snapshot)}
            </div>
          )
        }

        // Fallback for other dynamic components
        return <div data-testid="dynamic-component">{children}</div>
      }
      DynamicComponent.displayName = 'DynamicComponent'
      return DynamicComponent
    },
  }
})

const mockResumeData: ResumeData = {
  name: 'Test User',
  position: 'Developer',
  email: 'test@example.com',
  summary: 'Test summary',
  location: { city: 'Test City', countryCode: 'US' },
  profiles: [],
  workExperience: [],
  education: [],
  skills: [],
  projects: [
    {
      name: 'Test Project',
      link: 'https://project.com',
      description: 'Test description',
      keyAchievements: [
        { text: 'Achievement 1' },
        { text: 'Achievement 2' },
      ],
      startYear: '2023-01-01',
      endYear: '2023-12-31',
    },
  ],
  languages: [],
  certifications: [],
}

const mockSetResumeData = jest.fn()

const renderWithContext = (resumeData: ResumeData = mockResumeData) => {
  return render(
    <React.Suspense fallback={<div>Loading...</div>}>
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData: mockSetResumeData,
          handleProfilePicture: jest.fn(),
          handleChange: jest.fn(),
        }}
      >
        <Projects />
      </ResumeContext.Provider>
    </React.Suspense>
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
    expect(
      screen.getByPlaceholderText(/add key achievement/i)
    ).toBeInTheDocument()
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

  it('adds key achievement when Enter is pressed', () => {
    renderWithContext()
    const addInput = screen.getByPlaceholderText(/add key achievement/i)

    // Type achievement and press Enter
    fireEvent.change(addInput, {
      target: { value: 'New achievement' },
    })
    fireEvent.keyDown(addInput, { key: 'Enter', code: 'Enter' })

    expect(mockSetResumeData).toHaveBeenCalled()

    // Get the function that was passed to setResumeData and call it
    const updateFunction = mockSetResumeData.mock.calls[0][0]
    const result =
      typeof updateFunction === 'function'
        ? updateFunction(mockResumeData)
        : updateFunction

    expect(result.projects[0].keyAchievements).toEqual(
      expect.arrayContaining([{ text: 'New achievement' }])
    )
  })

  it('renders date inputs for project timeline', () => {
    const { container } = renderWithContext()
    const dateInputs = container.querySelectorAll('input[type="date"]')
    expect(dateInputs.length).toBeGreaterThanOrEqual(2)
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
            keyAchievements: [],
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
          keyAchievements: [{ text: 'Second achievements' }],
          startYear: '2024-01-01',
          endYear: '2024-12-31',
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
      keyAchievements: [{ text: 'Achievement 1' }],
      startYear: '2023-01-01',
      endYear: '2023-06-30',
    }

    const project2 = {
      name: 'Project 2',
      link: 'https://project2.com',
      description: 'Second project',
      keyAchievements: [{ text: 'Achievement 2' }],
      startYear: '2023-07-01',
      endYear: '2023-12-31',
    }

    const project3 = {
      name: 'Project 3',
      link: 'https://project3.com',
      description: 'Third project',
      keyAchievements: [{ text: 'Achievement 3' }],
      startYear: '2024-01-01',
      endYear: '2024-06-30',
    }

    it('should reorder projects from first to last position', () => {
      const dataWithProjects = {
        ...mockResumeData,
        projects: [project1, project2, project3],
      }
      const mockSetResumeData = jest.fn()

      render(
        <React.Suspense fallback={null}>
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
        </React.Suspense>
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
        <React.Suspense fallback={null}>
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
        </React.Suspense>
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
        <React.Suspense fallback={null}>
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
        </React.Suspense>
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
        <React.Suspense fallback={null}>
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
        </React.Suspense>
      )

      capturedOnDragEnd!({
        source: { droppableId: 'projects', index: 0 },
        destination: null,
      })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })
  })
})
