// @ts-nocheck
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Language from '@/components/resume/forms/Language'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import {
  renderWithContext,
  createMockResumeData,
} from '@/lib/__tests__/test-utils'

describe('Language Component', () => {
  describe('Rendering', () => {
    it('should render all languages as tags', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText('English')).toBeInTheDocument()
      expect(screen.getByText('Spanish')).toBeInTheDocument()
    })

    it('should render remove button for each language', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
      })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButtons = screen.getAllByTitle('Remove')
      expect(removeButtons).toHaveLength(2)
    })

    it('should render add input field', () => {
      renderWithContext(<Language />)
      expect(screen.getByPlaceholderText('Add language...')).toBeInTheDocument()
    })
  })

  describe('Add Functionality', () => {
    it('should add new language when pressing Enter', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add language...')
      fireEvent.change(input, { target: { value: 'Spanish' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', 'Spanish'],
      })
    })

    it('should add new language on blur', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add language...')
      fireEvent.change(input, { target: { value: 'French' } })
      fireEvent.blur(input)

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', 'French'],
      })
    })

    it('should not add empty language', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add language...')
      fireEvent.change(input, { target: { value: '   ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).not.toHaveBeenCalled()
    })

    it('should clear input after adding', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add language...')
      fireEvent.change(input, { target: { value: 'Spanish' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(input).toHaveValue('')
    })
  })

  describe('Delete Functionality', () => {
    it('should delete language when remove button is clicked', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish', 'French'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[1]) // Delete Spanish

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', 'French'],
      })
    })

    it('should delete first language correctly', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[0])

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['Spanish'],
      })
    })

    it('should delete last language correctly', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'Spanish'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const removeButtons = screen.getAllByTitle('Remove')
      fireEvent.click(removeButtons[1])

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English'],
      })
    })
  })

  describe('Layout and Styling', () => {
    it('should display languages as inline tags', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      const { container } = renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const tag = container.querySelector('.rounded-full')
      expect(tag).toBeInTheDocument()
    })

    it('should have purple focus color on input', () => {
      const mockData = createMockResumeData({ languages: [] })
      const { container } = renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const input = container.querySelector('.focus\\:border-purple-400')
      expect(input).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render correctly with empty languages array', () => {
      const mockData = createMockResumeData({ languages: [] })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByPlaceholderText('Add language...')).toBeInTheDocument()
      expect(screen.queryByTitle('Remove')).not.toBeInTheDocument()
    })

    it('should handle special characters in language input', () => {
      const mockData = createMockResumeData({
        languages: ['中文 (Chinese)'],
      })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      expect(screen.getByText('中文 (Chinese)')).toBeInTheDocument()
    })

    it('should trim whitespace when adding', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
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
          <Language />
        </ResumeContext.Provider>
      )

      const input = screen.getByPlaceholderText('Add language...')
      fireEvent.change(input, { target: { value: '  Spanish  ' } })
      fireEvent.keyDown(input, { key: 'Enter' })

      expect(mockSetResumeData).toHaveBeenCalledWith({
        ...mockData,
        languages: ['English', 'Spanish'],
      })
    })

    it('should handle multiple languages with same value', () => {
      const mockData = createMockResumeData({
        languages: ['English', 'English', 'English'],
      })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const englishTags = screen.getAllByText('English')
      expect(englishTags).toHaveLength(3)
    })
  })

  describe('Accessibility', () => {
    it('should have title attribute on remove buttons', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButton = screen.getByTitle('Remove')
      expect(removeButton).toHaveAttribute('title', 'Remove')
    })

    it('should use text input type', () => {
      const mockData = createMockResumeData({ languages: [] })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const input = screen.getByPlaceholderText('Add language...')
      expect(input).toHaveAttribute('type', 'text')
    })

    it('should have button type=button for remove buttons', () => {
      const mockData = createMockResumeData({
        languages: ['English'],
      })
      renderWithContext(<Language />, {
        contextValue: { ...({} as any), resumeData: mockData as any },
      })

      const removeButton = screen.getByTitle('Remove')
      expect(removeButton).toHaveAttribute('type', 'button')
    })
  })
})
