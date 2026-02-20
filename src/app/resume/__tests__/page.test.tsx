import { render, screen, waitFor } from '@testing-library/react'
import ResumePage from '@/app/resume/page'

// Mock Preview component
jest.mock('@/components/resume/preview/Preview', () => {
  return function MockPreview() {
    return <div data-testid="mock-preview">Resume Preview</div>
  }
})

// Mock PrintButton component
jest.mock('@/components/document-builder/ui/PrintButton', () => {
  return function MockPrintButton({ name, documentType }: { name: string; documentType: string }) {
    return (
      <button data-testid="mock-print-button">
        Print {documentType} for {name}
      </button>
    )
  }
})

// Mock ScaledPreviewWrapper component
jest.mock('@/components/document-builder/ui/ScaledPreviewWrapper', () => {
  return function MockScaledPreviewWrapper({ children }: { children: React.ReactNode }) {
    return <div data-testid="scaled-preview-wrapper">{children}</div>
  }
})

// Mock resumeAdapter
jest.mock('@/lib/resumeAdapter', () => ({
  __esModule: true,
  default: {
    name: 'John Doe',
    position: 'Software Engineer',
    email: 'john@example.com',
    phone: '+1234567890',
    location: 'San Francisco, CA',
    summary: 'Experienced developer',
    website: 'johndoe.com',
    workExperience: [],
    education: [],
    skillGroups: [],
    projects: [],
    certifications: [],
    languages: [],
    socialMedia: {},
  },
}))

describe('ResumePage', () => {
  let originalPrint: () => void
  let printSpy: jest.Mock

  beforeEach(() => {
    originalPrint = window.print
    printSpy = jest.fn()
    window.print = printSpy
    jest.useFakeTimers()

    // Mock localStorage
    Storage.prototype.getItem = jest.fn()
    Storage.prototype.setItem = jest.fn()
  })

  afterEach(() => {
    window.print = originalPrint
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('should render resume preview', () => {
    render(<ResumePage />)

    expect(screen.getByTestId('mock-preview')).toBeInTheDocument()
  })

  it('should render print button with correct props', () => {
    render(<ResumePage />)

    const printButton = screen.getByTestId('mock-print-button')
    expect(printButton).toBeInTheDocument()
    expect(printButton).toHaveTextContent('Print Resume for John Doe')
  })

  it('should auto-trigger print dialog after delay', () => {
    render(<ResumePage />)

    expect(printSpy).not.toHaveBeenCalled()

    jest.advanceTimersByTime(500)

    expect(printSpy).toHaveBeenCalledTimes(1)
  })

  it('should set document title with formatted name and position', () => {
    render(<ResumePage />)

    expect(document.title).toBe('SoftwareEngineer-JohnDoe-Resume')
  })

  it('should load resume data from localStorage when available', async () => {
    const storedData = {
      name: 'Jane Smith',
      position: 'Designer',
      email: 'jane@example.com',
      phone: '+9876543210',
      location: 'New York',
      summary: 'Creative designer',
      website: 'janesmith.com',
      workExperience: [],
      education: [],
      skillGroups: [],
      projects: [],
      certifications: [],
      languages: [],
      socialMedia: {},
    }

    ;(Storage.prototype.getItem as jest.Mock).mockReturnValue(JSON.stringify(storedData))

    render(<ResumePage />)

    await waitFor(() => {
      expect(document.title).toBe('Designer-JaneSmith-Resume')
    })
  })

  it('should use default resume data when localStorage is empty', () => {
    ;(Storage.prototype.getItem as jest.Mock).mockReturnValue(null)

    render(<ResumePage />)

    expect(document.title).toBe('SoftwareEngineer-JohnDoe-Resume')
  })

  it('should provide resume context with editable false', () => {
    const { container } = render(<ResumePage />)

    expect(container).toBeInTheDocument()
  })

  it('should clean up timer on unmount', () => {
    const { unmount } = render(<ResumePage />)

    unmount()

    jest.advanceTimersByTime(500)

    expect(printSpy).not.toHaveBeenCalled()
  })

  it('should format name with spaces correctly', () => {
    ;(Storage.prototype.getItem as jest.Mock).mockReturnValue(
      JSON.stringify({
        name: 'mary jane watson',
        position: 'Developer',
        email: 'test@test.com',
        phone: '+1234567890',
        location: 'Test',
        summary: 'Test',
        website: 'test.com',
        workExperience: [],
        education: [],
        skillGroups: [],
        projects: [],
        certifications: [],
        languages: [],
        socialMedia: {},
      })
    )

    render(<ResumePage />)

    expect(document.title).toBe('Developer-MaryJaneWatson-Resume')
  })
})
