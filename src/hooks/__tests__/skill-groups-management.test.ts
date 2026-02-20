// @ts-nocheck
import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { useSkillGroupsManagement } from '@/hooks/useSkillGroupsManagement'
import { ResumeContext } from '@/lib/contexts/DocumentContext'

jest.mock('sonner', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
}))

import { toast } from 'sonner'

const makeSkillGroup = (title: string) => ({
    title,
    skills: [{ text: 'Skill1', highlight: false }],
})

const makeResumeData = (overrides = {}) => ({
    name: 'Test',
    position: 'Dev',
    email: 'test@test.com',
    contactInformation: '',
    address: '',
    profilePicture: '',
    summary: '',
    socialMedia: [],
    workExperience: [],
    education: [],
    skills: [makeSkillGroup('Frontend'), makeSkillGroup('Backend')],
    languages: [],
    certifications: [],
    ...overrides,
})

const createWrapper = (resumeData, setResumeData) => {
    const Wrapper = ({ children }) =>
        React.createElement(ResumeContext.Provider, { value: { resumeData, setResumeData } }, children)
    return Wrapper
}

describe('useSkillGroupsManagement', () => {
    beforeEach(() => jest.clearAllMocks())

    describe('addGroup', () => {
        it('adds a new skill group', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.addGroup('DevOps'))
            expect(setData).toHaveBeenCalledWith(expect.objectContaining({
                skills: expect.arrayContaining([
                    expect.objectContaining({ title: 'DevOps', skills: [] }),
                ]),
            }))
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('DevOps'))
        })

        it('shows error and does not call setData when title is empty', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.addGroup(''))
            expect(setData).not.toHaveBeenCalled()
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('empty'))
        })

        it('shows error and does not call setData when title is whitespace only', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.addGroup('   '))
            expect(setData).not.toHaveBeenCalled()
            expect(toast.error).toHaveBeenCalled()
        })

        it('shows error when title already exists (case insensitive)', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.addGroup('frontend'))
            expect(setData).not.toHaveBeenCalled()
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('already exists'))
        })
    })

    describe('removeGroup', () => {
        it('removes a skill group by title', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.removeGroup('Frontend'))
            expect(setData).toHaveBeenCalledWith(expect.objectContaining({
                skills: [makeSkillGroup('Backend')],
            }))
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Frontend'))
        })

        it('leaves other groups when removing one that matches', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.removeGroup('Backend'))
            const callArg = setData.mock.calls[0][0]
            expect(callArg.skills).toHaveLength(1)
            expect(callArg.skills[0].title).toBe('Frontend')
        })
    })

    describe('renameGroup', () => {
        it('renames a skill group', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.renameGroup('Frontend', 'UI'))
            const callArg = setData.mock.calls[0][0]
            const renamed = callArg.skills.find((g) => g.title === 'UI')
            expect(renamed).toBeDefined()
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('UI'))
        })

        it('shows error when new title is empty', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.renameGroup('Frontend', ''))
            expect(setData).not.toHaveBeenCalled()
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('empty'))
        })

        it('shows error when new title conflicts with another group (case insensitive)', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.renameGroup('Frontend', 'BACKEND'))
            expect(setData).not.toHaveBeenCalled()
            expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('already exists'))
        })

        it('does not conflict with its own title when renaming to same name', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            // Renaming Frontend to Frontend (case match) — exists check excludes oldTitle
            act(() => result.current.renameGroup('Frontend', 'NewName'))
            expect(setData).toHaveBeenCalled()
            expect(toast.error).not.toHaveBeenCalled()
        })
    })

    describe('reorderGroups', () => {
        it('reorders skill groups', () => {
            const data = makeResumeData()
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.reorderGroups(0, 1))
            const callArg = setData.mock.calls[0][0]
            expect(callArg.skills[0].title).toBe('Backend')
            expect(callArg.skills[1].title).toBe('Frontend')
        })

        it('does nothing when splice returns undefined (safety check)', () => {
            const data = makeResumeData({ skills: [] })
            const setData = jest.fn()
            const { result } = renderHook(
                () => useSkillGroupsManagement(),
                { wrapper: createWrapper(data, setData) }
            )
            act(() => result.current.reorderGroups(0, 1))
            // Should not call setData because removed is undefined
            expect(setData).not.toHaveBeenCalled()
        })
    })
})
