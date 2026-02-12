import { useState, useEffect, useRef } from 'react'
import defaultResumeData from '@/lib/resumeAdapter'
import { DEFAULT_COVER_LETTER_CONTENT } from '@/data/cover-letter'
import type { ResumeData, CoverLetterData } from '@/types'

export function useUnifiedData() {
    // Resume data
    const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData)

    // Cover letter data
    const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
        ...defaultResumeData,
        content: DEFAULT_COVER_LETTER_CONTENT,
    })

    // Load saved data on mount
    useEffect(() => {
        const savedResumeData = localStorage.getItem('resumeData')
        let initialResumeData = resumeData

        if (savedResumeData) {
            try {
                const parsedResume = JSON.parse(savedResumeData)
                initialResumeData = parsedResume
                setResumeData(parsedResume)
            } catch (error) {
                console.error('Error loading saved resume data:', error)
            }
        }

        if (!initialResumeData.projects && defaultResumeData.projects) {
            const dataWithProjects = {
                ...initialResumeData,
                projects: defaultResumeData.projects
            };
            setResumeData(dataWithProjects);
            initialResumeData = dataWithProjects;
        }

        if (initialResumeData.skills && initialResumeData.skills.length > 0) {
            const needsMigration = initialResumeData.skills.some((skillCategory) =>
                skillCategory.skills.some(
                    (skill) =>
                        typeof skill === 'string' ||
                        ('underline' in skill && skill.highlight === undefined)
                )
            )

            if (needsMigration) {
                const migratedData = {
                    ...initialResumeData,
                    skills: initialResumeData.skills.map((skillCategory) => ({
                        ...skillCategory,
                        skills: skillCategory.skills.map((skill) => {
                            if (typeof skill === 'string') {
                                return { text: skill, highlight: false }
                            }
                            if ('underline' in skill && skill.highlight === undefined) {
                                return {
                                    text: skill.text,
                                    highlight: (skill as { underline: boolean }).underline,
                                }
                            }
                            return skill
                        }),
                    })),
                }
                setResumeData(migratedData)
                initialResumeData = migratedData
            }
        }

        const savedCLData = localStorage.getItem('coverLetterData')
        if (savedCLData) {
            try {
                const parsedData = JSON.parse(savedCLData)
                setCoverLetterData({
                    ...defaultResumeData,
                    ...parsedData,
                    content:
                        parsedData.content && parsedData.content.trim()
                            ? parsedData.content
                            : DEFAULT_COVER_LETTER_CONTENT,
                })
            } catch (error) {
                console.error('Error loading saved cover letter data:', error)
            }
        }
    }, [])

    // Save data on changes
    useEffect(() => {
        if (resumeData !== defaultResumeData) {
            localStorage.setItem('resumeData', JSON.stringify(resumeData))
        }
    }, [resumeData])

    useEffect(() => {
        const isDefaultContent = coverLetterData.content === DEFAULT_COVER_LETTER_CONTENT
        const isDefaultData = JSON.stringify({ ...coverLetterData, content: '' }) === JSON.stringify({ ...defaultResumeData, content: '' })

        if (!(isDefaultContent && isDefaultData)) {
            localStorage.setItem('coverLetterData', JSON.stringify(coverLetterData))
        }
    }, [coverLetterData])

    // Sync logic
    const lastSyncedResumeData = useRef({
        name: resumeData.name,
        position: resumeData.position,
        email: resumeData.email,
        contactInformation: resumeData.contactInformation,
        address: resumeData.address,
        profileImage: resumeData.profileImage,
        socialMedia: resumeData.socialMedia,
    })
    const lastSyncedCoverLetterData = useRef({
        name: coverLetterData.name,
        position: coverLetterData.position,
        email: coverLetterData.email,
        contactInformation: coverLetterData.contactInformation,
        address: coverLetterData.address,
        profileImage: coverLetterData.profileImage,
        socialMedia: coverLetterData.socialMedia,
    })

    useEffect(() => {
        const currentResumeFields = {
            name: resumeData.name,
            position: resumeData.position,
            email: resumeData.email,
            contactInformation: resumeData.contactInformation,
            address: resumeData.address,
            profileImage: resumeData.profileImage,
            socialMedia: resumeData.socialMedia,
        }

        const resumeChanged = Object.keys(currentResumeFields).some(
            (key) => JSON.stringify(currentResumeFields[key as keyof typeof currentResumeFields]) !== JSON.stringify(lastSyncedResumeData.current[key as keyof typeof currentResumeFields])
        )

        if (resumeChanged) {
            setCoverLetterData((prev) => {
                const updated = { ...prev, ...currentResumeFields }
                lastSyncedCoverLetterData.current = {
                    name: updated.name,
                    position: updated.position,
                    email: updated.email,
                    contactInformation: updated.contactInformation,
                    address: updated.address,
                    profileImage: updated.profileImage,
                    socialMedia: updated.socialMedia,
                }
                return updated
            })
            lastSyncedResumeData.current = currentResumeFields
        }
    }, [resumeData.name, resumeData.position, resumeData.email, resumeData.contactInformation, resumeData.address, resumeData.profileImage, resumeData.socialMedia])

    useEffect(() => {
        const currentCoverLetterFields = {
            name: coverLetterData.name,
            position: coverLetterData.position,
            email: coverLetterData.email,
            contactInformation: coverLetterData.contactInformation,
            address: coverLetterData.address,
            profileImage: coverLetterData.profileImage,
            socialMedia: coverLetterData.socialMedia,
        }

        const coverLetterChanged = Object.keys(currentCoverLetterFields).some(
            (key) => JSON.stringify(currentCoverLetterFields[key as keyof typeof currentCoverLetterFields]) !== JSON.stringify(lastSyncedCoverLetterData.current[key as keyof typeof currentCoverLetterFields])
        )

        if (coverLetterChanged) {
            setResumeData((prev) => {
                const updated = { ...prev, ...currentCoverLetterFields }
                lastSyncedResumeData.current = {
                    name: updated.name,
                    position: updated.position,
                    email: updated.email,
                    contactInformation: updated.contactInformation,
                    address: updated.address,
                    profileImage: updated.profileImage,
                    socialMedia: updated.socialMedia,
                }
                return updated
            })
            lastSyncedCoverLetterData.current = currentCoverLetterFields
        }
    }, [coverLetterData.name, coverLetterData.position, coverLetterData.email, coverLetterData.contactInformation, coverLetterData.address, coverLetterData.profileImage, coverLetterData.socialMedia])

    return {
        resumeData,
        setResumeData,
        coverLetterData,
        setCoverLetterData
    }
}
