// @ts-nocheck
import { render, screen, fireEvent } from '@testing-library/react'
import ContactInfo from '@/components/document-builder/shared-preview/ContactInfo'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types/resume'
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md'

const mockResumeData: ResumeData = {
  name: 'John Doe',
  position: 'Senior Developer',
  email: 'john@example.com',
  phone: '+1234567890',
  location: 'Test City',
  summary: 'Test summary',
  website: 'https://example.com',
  contactInformation: '+1 (234) 567-8900',
  address: '123 Test Street, Test City, TS 12345',
  profilePicture: '',
  workExperience: [],
  education: [],
  skillGroups: [],
  projects: [],
  certifications: [],
  languages: [],
  socialMedia: [],
}

const mockSetResumeData = jest.fn()

const renderWithContext = (
  resumeData: ResumeData = mockResumeData,
  editable = true,
  props = {}
) => {
  const defaultProps = {
    mainclass: 'flex flex-row gap-1',
    linkclass: 'inline-flex items-center gap-1',
    teldata: resumeData.contactInformation,
    emaildata: resumeData.email,
    addressdata: resumeData.address,
    telicon: <MdPhone />,
    emailicon: <MdEmail />,
    addressicon: <MdLocationOn />,
    ...props,
  }

  return render(
    <ResumeContext.Provider
      value={{
        resumeData,
        setResumeData: mockSetResumeData,
        editable,
      }}
    >
      <ContactInfo {...defaultProps} />
    </ResumeContext.Provider>
  )
}

describe('ContactInfo Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders phone number with icon', () => {
      renderWithContext()
      const phoneLink = screen.getByLabelText('Phone Number')
      expect(phoneLink).toBeInTheDocument()
      expect(phoneLink).toHaveTextContent('+1 (234) 567-8900')
    })

    it('renders email with icon', () => {
      renderWithContext()
      const emailLink = screen.getByLabelText('Email Address')
      expect(emailLink).toBeInTheDocument()
      expect(emailLink).toHaveTextContent('john@example.com')
    })

    it('renders address with icon', () => {
      renderWithContext()
      const addressLink = screen.getByLabelText('Address')
      expect(addressLink).toBeInTheDocument()
      expect(addressLink).toHaveTextContent(
        '123 Test Street, Test City, TS 12345'
      )
    })

    it('does not render phone when empty', () => {
      const dataWithoutPhone = { ...mockResumeData, contactInformation: '' }
      renderWithContext(dataWithoutPhone)
      expect(screen.queryByLabelText('Phone Number')).not.toBeInTheDocument()
    })

    it('does not render email when empty', () => {
      const dataWithoutEmail = { ...mockResumeData, email: '' }
      renderWithContext(dataWithoutEmail)
      expect(screen.queryByLabelText('Email Address')).not.toBeInTheDocument()
    })

    it('does not render address when empty', () => {
      const dataWithoutAddress = { ...mockResumeData, address: '' }
      renderWithContext(dataWithoutAddress)
      expect(screen.queryByLabelText('Address')).not.toBeInTheDocument()
    })

    it('does not render phone when only whitespace', () => {
      const dataWithWhitespace = {
        ...mockResumeData,
        contactInformation: '   ',
      }
      renderWithContext(dataWithWhitespace)
      expect(screen.queryByLabelText('Phone Number')).not.toBeInTheDocument()
    })
  })

  describe('Links and Attributes', () => {
    it('has correct tel link for phone', () => {
      renderWithContext()
      const phoneLink = screen.getByLabelText('Phone Number')
      expect(phoneLink).toHaveAttribute('href', 'tel:+12345678900')
    })

    it('strips formatting from phone number in tel link', () => {
      const dataWithFormattedPhone = {
        ...mockResumeData,
        contactInformation: '+1 (555) 123-4567',
      }
      renderWithContext(dataWithFormattedPhone)
      const phoneLink = screen.getByLabelText('Phone Number')
      expect(phoneLink).toHaveAttribute('href', 'tel:+15551234567')
    })

    it('has correct mailto link for email', () => {
      renderWithContext()
      const emailLink = screen.getByLabelText('Email Address')
      expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com')
    })

    it('has correct Google Maps link for address', () => {
      renderWithContext()
      const addressLink = screen.getByLabelText('Address')
      const expectedUrl =
        'https://www.google.com/maps/search/?api=1&query=123%20Test%20Street%2C%20Test%20City%2C%20TS%2012345'
      expect(addressLink).toHaveAttribute('href', expectedUrl)
    })

    it('opens address link in new tab', () => {
      renderWithContext()
      const addressLink = screen.getByLabelText('Address')
      expect(addressLink).toHaveAttribute('target', '_blank')
      expect(addressLink).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  describe('ContentEditable', () => {
    it('makes phone editable when editable is true', () => {
      renderWithContext(mockResumeData, true)
      const phoneLink = screen.getByLabelText('Phone Number')
      expect(phoneLink).toHaveAttribute('contentEditable', 'true')
    })

    it('makes email editable when editable is true', () => {
      renderWithContext(mockResumeData, true)
      const emailLink = screen.getByLabelText('Email Address')
      expect(emailLink).toHaveAttribute('contentEditable', 'true')
    })

    it('makes address editable when editable is true', () => {
      renderWithContext(mockResumeData, true)
      const addressLink = screen.getByLabelText('Address')
      expect(addressLink).toHaveAttribute('contentEditable', 'true')
    })

    it('disables editing when editable is false', () => {
      renderWithContext(mockResumeData, false)
      const phoneLink = screen.getByLabelText('Phone Number')
      const emailLink = screen.getByLabelText('Email Address')
      const addressLink = screen.getByLabelText('Address')
      expect(phoneLink).toHaveAttribute('contentEditable', 'false')
      expect(emailLink).toHaveAttribute('contentEditable', 'false')
      expect(addressLink).toHaveAttribute('contentEditable', 'false')
    })
  })

  describe('Editing Handlers', () => {
    it('updates phone number when edited and blurred', () => {
      renderWithContext()
      const phoneLink = screen.getByLabelText('Phone Number')

      // Simulate editing the phone number
      phoneLink.innerText = '+1 (999) 888-7777'
      fireEvent.blur(phoneLink)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        contactInformation: '+1 (999) 888-7777',
      })
    })

    it('updates email when edited and blurred', () => {
      renderWithContext()
      const emailLink = screen.getByLabelText('Email Address')

      // Simulate editing the email
      emailLink.innerText = 'newemail@example.com'
      fireEvent.blur(emailLink)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        email: 'newemail@example.com',
      })
    })

    it('updates address when edited and blurred', () => {
      renderWithContext()
      const addressLink = screen.getByLabelText('Address')

      // Simulate editing the address
      addressLink.innerText = '456 New Street, New City, NC 54321'
      fireEvent.blur(addressLink)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockResumeData,
        address: '456 New Street, New City, NC 54321',
      })
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined contact information', () => {
      const dataWithUndefined = {
        ...mockResumeData,
        contactInformation: undefined as any,
      }
      const { container } = renderWithContext(dataWithUndefined)
      expect(container.querySelector('.flex')).toBeInTheDocument()
      expect(screen.queryByLabelText('Phone Number')).not.toBeInTheDocument()
    })

    it('handles null email', () => {
      const dataWithNull = {
        ...mockResumeData,
        email: null as any,
      }
      const { container } = renderWithContext(dataWithNull)
      expect(screen.queryByLabelText('Email Address')).not.toBeInTheDocument()
    })

    it('applies custom classes', () => {
      const customProps = {
        mainclass: 'custom-main-class',
        linkclass: 'custom-link-class',
      }
      const { container } = renderWithContext(mockResumeData, true, customProps)
      expect(container.querySelector('.custom-main-class')).toBeInTheDocument()
    })

    it('handles phone number with only special characters', () => {
      const dataWithSpecialChars = {
        ...mockResumeData,
        contactInformation: '() - -',
      }
      renderWithContext(dataWithSpecialChars)
      const phoneLink = screen.getByLabelText('Phone Number')
      expect(phoneLink).toHaveAttribute('href', 'tel:')
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-label for phone', () => {
      renderWithContext()
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument()
    })

    it('has proper aria-label for email', () => {
      renderWithContext()
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument()
    })

    it('has proper aria-label for address', () => {
      renderWithContext()
      expect(screen.getByLabelText('Address')).toBeInTheDocument()
    })
  })
})
