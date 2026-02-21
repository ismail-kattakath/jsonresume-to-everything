import { render, screen, fireEvent } from '@testing-library/react'
import ProfileHeader from '@/components/document-builder/shared-preview/profile-header'
import { ResumeContext } from '@/lib/contexts/document-context'
import { AISettingsContext } from '@/lib/contexts/ai-settings-context'
import type { ResumeData } from '@/types/resume'

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Senior Developer',
  email: 'john@example.com',
  contactInformation: '+1234567890',
  address: 'Test City',
  summary: 'Test summary',
  skills: [],
  profilePicture: '',
  workExperience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  socialMedia: [
    { socialMedia: 'GitHub', link: 'github.com/johndoe' },
    { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
    { socialMedia: 'Twitter', link: 'twitter.com/johndoe' },
  ],
}

const mockSetResumeData = jest.fn()

const mockAISettings = {
  settings: {
    apiUrl: 'https://api.openai.com',
    apiKey: '',
    model: 'gpt-4o-mini',
    jobDescription: '',
    providerType: 'openai-compatible' as const,
    rememberCredentials: false,
    skillsToHighlight: '',
    providerKeys: {},
  },
  updateSettings: jest.fn(),
  isConfigured: false,
  connectionStatus: 'idle' as const,
  jobDescriptionStatus: 'idle' as const,
  validateAll: jest.fn(),
  isPipelineActive: false,
  setIsPipelineActive: jest.fn(),
  isAnyAIActionActive: false,
  setIsAnyAIActionActive: jest.fn(),
  isAIWorking: false,
  resetAll: jest.fn(),
}

const renderWithContext = (resumeData: ResumeData = mockResumeData, editable = true) => {
  return render(
    <AISettingsContext.Provider value={mockAISettings}>
      <ResumeContext.Provider
        value={{
          resumeData,
          setResumeData: mockSetResumeData,
          editable,
          handleChange: jest.fn(),
          handleProfilePicture: jest.fn(),
        }}
      >
        <ProfileHeader />
      </ResumeContext.Provider>
    </AISettingsContext.Provider>
  )
}

describe('ProfileHeader Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders name and position', () => {
      renderWithContext()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Senior Developer')).toBeInTheDocument()
    })

    it('renders profile picture when provided', () => {
      const dataWithPicture = {
        ...mockResumeData,
        profilePicture: '/profile.jpg',
      }
      renderWithContext(dataWithPicture)
      const img = screen.getByAltText('profile')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/profile.jpg')
    })

    it('does not render profile picture when not provided', () => {
      renderWithContext()
      expect(screen.queryByAltText('profile')).not.toBeInTheDocument()
    })

    it('renders social media links', () => {
      renderWithContext()
      expect(screen.getByText('github.com/johndoe')).toBeInTheDocument()
      expect(screen.getByText('linkedin.com/in/johndoe')).toBeInTheDocument()
      expect(screen.getByText('twitter.com/johndoe')).toBeInTheDocument()
    })

    it('renders social media links with correct icons', () => {
      const { container } = renderWithContext()
      const githubLink = screen.getByText('github.com/johndoe').closest('a')
      expect(githubLink).toHaveAttribute('aria-label', 'GitHub')
      expect(githubLink).toHaveAttribute('title', 'GitHub')
    })
  })

  describe('ContentEditable', () => {
    it('makes name editable when editable is true', () => {
      renderWithContext(mockResumeData, true)
      const nameElement = screen.getByText('John Doe')
      expect(nameElement).toHaveAttribute('contentEditable', 'true')
    })

    it('makes position editable when editable is true', () => {
      renderWithContext(mockResumeData, true)
      const positionElement = screen.getByText('Senior Developer')
      expect(positionElement).toHaveAttribute('contentEditable', 'true')
    })

    it('disables editing when editable is false', () => {
      renderWithContext(mockResumeData, false)
      const nameElement = screen.getByText('John Doe')
      const positionElement = screen.getByText('Senior Developer')
      expect(nameElement).toHaveAttribute('contentEditable', 'false')
      expect(positionElement).toHaveAttribute('contentEditable', 'false')
    })

    it('makes social media links editable when editable is true', () => {
      renderWithContext(mockResumeData, true)
      const githubLink = screen.getByText('github.com/johndoe').closest('a')
      expect(githubLink).toHaveAttribute('contentEditable', 'true')
    })
  })

  describe('Social Media Editing', () => {
    it('updates social media link when edited and blurred', () => {
      const { container } = renderWithContext()
      const links = container.querySelectorAll('.grid a')
      const githubLink = links[0] as HTMLElement

      // Simulate editing the link
      githubLink.innerText = 'github.com/johndoe-updated'
      fireEvent.blur(githubLink)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'GitHub', link: 'github.com/johndoe-updated' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/in/johndoe' },
          { socialMedia: 'Twitter', link: 'twitter.com/johndoe' },
        ],
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles empty social media array', () => {
      const dataWithoutSocial = {
        ...mockResumeData,
        socialMedia: [],
      }
      renderWithContext(dataWithoutSocial)
      expect(screen.queryByText('github.com/johndoe')).not.toBeInTheDocument()
    })

    it('handles undefined social media', () => {
      const dataWithoutSocial = {
        ...mockResumeData,
        socialMedia: undefined as unknown as ResumeData['socialMedia'],
      }
      const { container } = renderWithContext(dataWithoutSocial)
      expect(container.querySelector('.grid')).toBeInTheDocument()
    })

    it('renders all supported social media icons', () => {
      const dataWithAllSocial = {
        ...mockResumeData,
        socialMedia: [
          { socialMedia: 'GitHub', link: 'github.com/test' },
          { socialMedia: 'LinkedIn', link: 'linkedin.com/test' },
          { socialMedia: 'Twitter', link: 'twitter.com/test' },
          { socialMedia: 'Facebook', link: 'facebook.com/test' },
          { socialMedia: 'Instagram', link: 'instagram.com/test' },
          { socialMedia: 'YouTube', link: 'youtube.com/test' },
          { socialMedia: 'Website', link: 'example.com' },
        ],
      }
      renderWithContext(dataWithAllSocial)
      expect(screen.getByText('github.com/test')).toBeInTheDocument()
      expect(screen.getByText('linkedin.com/test')).toBeInTheDocument()
      expect(screen.getByText('twitter.com/test')).toBeInTheDocument()
      expect(screen.getByText('facebook.com/test')).toBeInTheDocument()
      expect(screen.getByText('instagram.com/test')).toBeInTheDocument()
      expect(screen.getByText('youtube.com/test')).toBeInTheDocument()
      expect(screen.getByText('example.com')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-label for social media links', () => {
      const { container } = renderWithContext()
      const links = container.querySelectorAll('.grid a')
      expect(links[0]).toHaveAttribute('aria-label', 'GitHub')
    })

    it('opens social media links in new tab', () => {
      const { container } = renderWithContext()
      const links = container.querySelectorAll('.grid a')
      expect(links[0]).toHaveAttribute('target', '_blank')
      expect(links[0]).toHaveAttribute('rel', 'noreferrer')
    })

    it('has profile picture alt text', () => {
      const dataWithPicture = {
        ...mockResumeData,
        profilePicture: '/profile.jpg',
      }
      renderWithContext(dataWithPicture)
      expect(screen.getByAltText('profile')).toBeInTheDocument()
    })
  })
})
