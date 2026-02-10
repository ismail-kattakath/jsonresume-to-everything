import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Certification from '@/components/resume/forms/Certification'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  renderWithContext,
  createMockResumeData,
} from '@/lib/__tests__/test-utils'

describe('Certification Component', () => {
  describe('Rendering', () => {
    it('should render all certifications as tags', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'Google Cloud Professional', date: '', issuer: '', url: '' },
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText('AWS Solutions Architect')).toBeInTheDocument()
      expect(screen.getByText('Google Cloud Professional')).toBeInTheDocument()
    })

    it('should render remove button for each certification', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'Google Cloud Professional', date: '', issuer: '', url: '' },
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButtons = screen.getAllByTitle('Remove')
      expect(removeButtons).toHaveLength(2)
    })

    it('should render add input field', () => {
      renderWithContext(<Certification />)
      expect(
        screen.getByPlaceholderText('Add certification...')
      ).toBeInTheDocument()
    })
  })

  describe('Add Functionality', () => {
    it('should add new certification when pressing Enter', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
        ],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add certification...')
      fireEvent.change(input, { target: { value: 'Azure Administrator' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'Azure Administrator', date: '', issuer: '', url: '' },
        ],
      })
    })

    it('should add new certification on blur', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
        ],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add certification...')
      fireEvent.change(input, { target: { value: 'CompTIA Security+' } })
      fireEvent.blur(input)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'CompTIA Security+', date: '', issuer: '', url: '' },
        ],
      })
    })

    it('should not add empty certification', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
        ],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add certification...')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should clear input after adding', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
        ],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add certification...')
      fireEvent.change(input, { target: { value: 'Azure' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(input).toHaveValue('')
    })
  })

  describe('Delete Functionality', () => {
    it('should delete certification when remove button is clicked', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'Google Cloud Professional', date: '', issuer: '', url: '' },
          { name: 'Azure Administrator', date: '', issuer: '', url: '' },
        ],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[1]!) // Delete Google Cloud Professional

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'Azure Administrator', date: '', issuer: '', url: '' },
        ],
      })
    })

    it('should delete first certification correctly', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'Google Cloud Professional', date: '', issuer: '', url: '' },
        ],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[0]!)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [
          { name: 'Google Cloud Professional', date: '', issuer: '', url: '' },
        ],
      })
    })

    it('should delete last certification correctly', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
          { name: 'Google Cloud Professional', date: '', issuer: '', url: '' },
        ],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[1]!)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
        ],
      })
    })
  })

  describe('Layout and Styling', () => {
    it('should display certifications as inline tags', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS Solutions Architect', date: '', issuer: '', url: '' },
        ],
      })
      const { container } = renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const tag = container.querySelector('.rounded-full')
      expect(tag).toBeInTheDocument()
    })

    it('should have purple focus color on input', () => {
      const mockData = createMockResumeData({ certifications: [] })
      const { container } = renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const input = container.querySelector('.focus\\:border-purple-400')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render correctly with empty certifications array', () => {
      const mockData = createMockResumeData({ certifications: [] })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(
        screen.getByPlaceholderText('Add certification...')
      ).toBeInTheDocument()
      expect(screen.queryByTitle('Remove')).not.toBeInTheDocument()
    })

    it('should handle special characters in certification input', () => {
      const mockData = createMockResumeData({
        certifications: [
          {
            name: 'Cisco CCNA® Routing & Switching',
            date: '',
            issuer: '',
            url: '',
          },
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(
        screen.getByText('Cisco CCNA® Routing & Switching')
      ).toBeInTheDocument()
    })

    it('should trim whitespace when adding', () => {
      const mockData = createMockResumeData({
        certifications: [{ name: 'AWS', date: '', issuer: '', url: '' }],
      })
      const mockSetResumeData = jest.fn()

      render(
        <ResumeContext.Provider
          value={{
            resumeData: mockData as any,
            setResumeData: mockSetResumeData,
            handleProfilePicture: jest.fn(),
            handleChange: jest.fn(),
          }}
        >
          <Certification />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add certification...')
      fireEvent.change(input, { target: { value: '  Azure  ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        certifications: [
          { name: 'AWS', date: '', issuer: '', url: '' },
          { name: 'Azure', date: '', issuer: '', url: '' },
        ],
      })
    })

    it('should handle long certification names', () => {
      const longName =
        'Microsoft Certified: Azure Solutions Architect Expert with Advanced Cloud Infrastructure Management Specialization'
      const mockData = createMockResumeData({
        certifications: [{ name: longName, date: '', issuer: '', url: '' }],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText(longName)).toBeInTheDocument()
    })

    it('should handle multiple certifications with same value', () => {
      const mockData = createMockResumeData({
        certifications: [
          { name: 'AWS', date: '', issuer: '', url: '' },
          { name: 'AWS', date: '', issuer: '', url: '' },
          { name: 'AWS', date: '', issuer: '', url: '' },
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const awsTags = screen.getAllByText('AWS')
      expect(awsTags).toHaveLength(3)
    })

    it('should handle certification names with numbers', () => {
      const mockData = createMockResumeData({
        certifications: [
          {
            name: 'ISO/IEC 27001:2013 Lead Auditor',
            date: '',
            issuer: '',
            url: '',
          },
        ],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(
        screen.getByText('ISO/IEC 27001:2013 Lead Auditor')
      ).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have title attribute on remove buttons', () => {
      const mockData = createMockResumeData({
        certifications: [{ name: 'AWS', date: '', issuer: '', url: '' }],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButton = screen.getByTitle('Remove')
      expect(removeButton).toHaveAttribute('title', 'Remove')
    })

    it('should use text input type', () => {
      const mockData = createMockResumeData({ certifications: [] })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const input = screen.getByPlaceholderText('Add certification...')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should have button type=button for remove buttons', () => {
      const mockData = createMockResumeData({
        certifications: [{ name: 'AWS', date: '', issuer: '', url: '' }],
      })
      renderWithContext(<Certification />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButton = screen.getByTitle('Remove')
      expect(removeButton).toHaveAttribute('type', 'button')
    })
  })
})
