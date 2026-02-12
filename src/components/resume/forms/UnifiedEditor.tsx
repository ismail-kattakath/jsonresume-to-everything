'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Toaster } from 'sonner'
import { ArrowDownUp, Sparkles, User, Share2, FileText, GraduationCap, Briefcase, Code, Mail, Layers } from 'lucide-react'
import { tooltips } from '@/config/tooltips'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { AISettingsProvider } from '@/lib/contexts/AISettingsContext'
import { useDocumentHandlers } from '@/hooks/useDocumentHandlers'
import MainLayout from '@/components/layout/MainLayout'
import PrintButton from '@/components/document-builder/ui/PrintButton'
import CollapsibleSection from '@/components/document-builder/ui/CollapsibleSection'
import ScaledPreviewWrapper from '@/components/document-builder/ui/ScaledPreviewWrapper'
import ImportExport from '@/components/document-builder/shared-forms/ImportExport'
import AISettings from '@/components/document-builder/shared-forms/AISettings'
import PersonalInformation from '@/components/document-builder/shared-forms/PersonalInformation'
import SocialMedia from '@/components/document-builder/shared-forms/SocialMedia'
import Summary from '@/components/resume/forms/Summary'
import Education from '@/components/resume/forms/Education'
import WorkExperience from '@/components/resume/forms/WorkExperience'
import { SkillsSection } from '@/components/resume/forms/SkillsSection'
import Projects from '@/components/resume/forms/Projects'
import AdditionalSections from '@/components/resume/forms/AdditionalSections'
import CoverLetterContent from '@/components/cover-letter/forms/CoverLetterContent'
import Preview from '@/components/resume/preview/Preview'
import CoverLetterPreview from '@/components/cover-letter/preview/CoverLetterPreview'
import { AISettingsStatusIndicator } from '@/components/document-builder/ui/AISettingsStatusIndicator'
import { Tooltip } from '@/components/ui/Tooltip'
import { registerServiceWorker } from '@/lib/pwa/registerServiceWorker'
import defaultResumeData from '@/lib/resumeAdapter'
import { DEFAULT_COVER_LETTER_CONTENT } from '@/data/cover-letter'
import type { ResumeData, CoverLetterData } from '@/types'

type EditorMode = 'resume' | 'coverLetter'

export function UnifiedEditor() {
    // Editor mode state
    const [mode, setMode] = useState<EditorMode>('resume')

    // Accordion state - track which section is expanded
    const [expandedSection, setExpandedSection] = useState<string | null>(null)

    // Helper function to create accordion toggle handler
    const createToggleHandler = (sectionId: string) => () => {
        setExpandedSection((prev) => (prev === sectionId ? null : sectionId))
    }

    // Resume data
    const [resumeData, setResumeData] = useState(defaultResumeData)
    const resumeHandlers = useDocumentHandlers(resumeData, setResumeData)

    // Cover letter data
    const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
        ...defaultResumeData,
        content: DEFAULT_COVER_LETTER_CONTENT,
    })
    const coverLetterHandlers = useDocumentHandlers(
        coverLetterData as ResumeData,
        setCoverLetterData as React.Dispatch<React.SetStateAction<ResumeData>>
    )

    // Get current context based on mode
    const currentContext =
        mode === 'resume'
            ? {
                resumeData,
                setResumeData,
                handleProfilePicture: resumeHandlers.handleProfilePicture,
                handleChange: resumeHandlers.handleChange,
            }
            : {
                resumeData: coverLetterData as ResumeData,
                setResumeData: setCoverLetterData as React.Dispatch<
                    React.SetStateAction<ResumeData>
                >,
                handleProfilePicture: coverLetterHandlers.handleProfilePicture,
                handleChange: coverLetterHandlers.handleChange,
            }

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

    useEffect(() => {
        registerServiceWorker()
    }, [])

    return (
        <>
            <Toaster
                position="bottom-right"
                theme="dark"
                expand={true}
                visibleToasts={10}
                richColors
                closeButton
                toastOptions={{
                    style: {
                        fontSize: '0.875rem',
                        fontWeight: '600',
                    },
                }}
            />
            <Tooltip />
            <AISettingsProvider>
                <ResumeContext.Provider value={currentContext}>
                    <MainLayout
                        className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900"
                        excludeFooterFromPrint
                    >
                        <div className="relative flex flex-1 flex-col md:grid md:grid-cols-[1fr_auto]">
                            <div id="print-button" className="exclude-print fixed right-8 bottom-8 z-50 md:top-8 md:bottom-auto">
                                <PrintButton
                                    name={mode === 'resume' ? resumeData.name : coverLetterData.name}
                                    position={mode === 'resume' ? resumeData.position : coverLetterData.position}
                                    documentType={mode === 'resume' ? 'Resume' : 'CoverLetter'}
                                    resumeData={mode === 'resume' ? resumeData : (coverLetterData as ResumeData)}
                                />
                            </div>

                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="exclude-print flex-1 space-y-4 overflow-y-scroll p-4 md:h-0 md:min-h-full md:flex-none md:space-y-5 md:p-6 lg:p-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30 [&::-webkit-scrollbar-track]:bg-white/5"
                            >
                                <div id="editor-header" className="space-y-3 border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
                                            <span className="text-xl">🎯</span>
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-white">AI Resume Builder</h1>
                                            <p className="text-xs text-white/60">Tailor Resumes to Any Job Description</p>
                                        </div>
                                    </div>

                                    <div id="mode-switcher" className="flex overflow-hidden rounded-lg bg-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setMode('resume')}
                                            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${mode === 'resume' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/80'}`}
                                        >
                                            <span>📄</span> Resume
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode('coverLetter')}
                                            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all ${mode === 'coverLetter' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/80'}`}
                                        >
                                            <span>✉️</span> Cover Letter
                                        </button>
                                    </div>
                                </div>

                                <div id="section-import-export">
                                    <CollapsibleSection
                                        title="Import / Export"
                                        icon={<ArrowDownUp className="h-4 w-4 text-amber-400" />}
                                        isExpanded={expandedSection === 'import-export'}
                                        onToggle={createToggleHandler('import-export')}
                                        variant="utility"
                                        tooltip={tooltips.sections.importExport}
                                    >
                                        <ImportExport preserveContent={mode === 'coverLetter'} />
                                    </CollapsibleSection>
                                </div>

                                <div id="section-ai-settings">
                                    <CollapsibleSection
                                        title="Generative AI Settings"
                                        icon={<Sparkles className="h-4 w-4 text-amber-400" />}
                                        isExpanded={expandedSection === 'ai-settings'}
                                        onToggle={createToggleHandler('ai-settings')}
                                        action={<AISettingsStatusIndicator />}
                                        variant="utility"
                                        tooltip={tooltips.sections.aiSettings}
                                    >
                                        <AISettings />
                                    </CollapsibleSection>
                                </div>

                                <div id="section-personal-info">
                                    <CollapsibleSection
                                        title="Personal Information"
                                        icon={<User className="h-4 w-4 text-blue-400" />}
                                        isExpanded={expandedSection === 'personal-info'}
                                        onToggle={createToggleHandler('personal-info')}
                                        tooltip={tooltips.sections.personalInfo}
                                    >
                                        <PersonalInformation />
                                    </CollapsibleSection>
                                </div>

                                <div id="section-social-media">
                                    <CollapsibleSection
                                        title="Social Media"
                                        icon={<Share2 className="h-4 w-4 text-blue-400" />}
                                        isExpanded={expandedSection === 'social-media'}
                                        onToggle={createToggleHandler('social-media')}
                                        tooltip={tooltips.sections.socialMedia}
                                    >
                                        <SocialMedia />
                                    </CollapsibleSection>
                                </div>

                                {mode === 'resume' && (
                                    <>
                                        <CollapsibleSection
                                            title="Summary"
                                            icon={<FileText className="h-4 w-4 text-blue-400" />}
                                            isExpanded={expandedSection === 'summary'}
                                            onToggle={createToggleHandler('summary')}
                                            tooltip={tooltips.sections.summary}
                                        >
                                            <Summary />
                                        </CollapsibleSection>

                                        <div id="section-education">
                                            <CollapsibleSection
                                                title="Education"
                                                icon={<GraduationCap className="h-4 w-4 text-blue-400" />}
                                                isExpanded={expandedSection === 'education'}
                                                onToggle={createToggleHandler('education')}
                                                tooltip={tooltips.sections.education}
                                            >
                                                <Education />
                                            </CollapsibleSection>
                                        </div>

                                        <div id="section-work-experience">
                                            <CollapsibleSection
                                                title="Experience"
                                                icon={<Briefcase className="h-4 w-4 text-blue-400" />}
                                                isExpanded={expandedSection === 'work-experience'}
                                                onToggle={createToggleHandler('work-experience')}
                                                tooltip={tooltips.sections.workExperience}
                                            >
                                                <WorkExperience />
                                            </CollapsibleSection>
                                        </div>

                                        <div id="section-skills">
                                            <CollapsibleSection
                                                title="Skills"
                                                icon={<Code className="h-4 w-4 text-blue-400" />}
                                                isExpanded={expandedSection === 'skills'}
                                                onToggle={createToggleHandler('skills')}
                                                tooltip={tooltips.sections.skills}
                                            >
                                                <SkillsSection />
                                            </CollapsibleSection>
                                        </div>

                                        <div id="section-projects">
                                            <CollapsibleSection
                                                title="Featured Projects"
                                                icon={<Briefcase className="h-4 w-4 text-blue-400" />}
                                                isExpanded={expandedSection === 'projects'}
                                                onToggle={createToggleHandler('projects')}
                                                tooltip={tooltips.sections.projects}
                                            >
                                                <Projects />
                                            </CollapsibleSection>
                                        </div>

                                        <div id="section-additional-info">
                                            <CollapsibleSection
                                                title="Additional Info"
                                                icon={<Layers className="h-4 w-4 text-blue-400" />}
                                                isExpanded={expandedSection === 'additional-info'}
                                                onToggle={createToggleHandler('additional-info')}
                                                tooltip={tooltips.sections.additionalInfo}
                                            >
                                                <AdditionalSections />
                                            </CollapsibleSection>
                                        </div>
                                    </>
                                )}

                                {mode === 'coverLetter' && (
                                    <CollapsibleSection
                                        title="Content"
                                        icon={<Mail className="h-4 w-4 text-blue-400" />}
                                        isExpanded={expandedSection === 'cover-letter'}
                                        onToggle={createToggleHandler('cover-letter')}
                                        tooltip={tooltips.sections.coverLetterContent}
                                    >
                                        <ResumeContext.Provider
                                            value={{
                                                resumeData: coverLetterData as ResumeData,
                                                setResumeData: setCoverLetterData as React.Dispatch<React.SetStateAction<ResumeData>>,
                                                handleProfilePicture: coverLetterHandlers.handleProfilePicture,
                                                handleChange: coverLetterHandlers.handleChange,
                                            }}
                                        >
                                            <CoverLetterContent />
                                        </ResumeContext.Provider>
                                    </CollapsibleSection>
                                )}
                            </form>

                            <div id="preview-pane" className="flex flex-col md:w-[8.5in]">
                                <ScaledPreviewWrapper>
                                    <ResumeContext.Provider
                                        value={{
                                            resumeData,
                                            setResumeData,
                                            handleProfilePicture: resumeHandlers.handleProfilePicture,
                                            handleChange: resumeHandlers.handleChange,
                                        }}
                                    >
                                        <div className={mode === 'resume' ? 'block' : 'hidden'}>
                                            <Preview />
                                        </div>
                                    </ResumeContext.Provider>
                                    <ResumeContext.Provider
                                        value={{
                                            resumeData: coverLetterData as ResumeData,
                                            setResumeData: setCoverLetterData as React.Dispatch<React.SetStateAction<ResumeData>>,
                                            handleProfilePicture: coverLetterHandlers.handleProfilePicture,
                                            handleChange: coverLetterHandlers.handleChange,
                                        }}
                                    >
                                        <div className={mode === 'coverLetter' ? 'block' : 'hidden'}>
                                            <CoverLetterPreview />
                                        </div>
                                    </ResumeContext.Provider>
                                </ScaledPreviewWrapper>
                            </div>
                        </div>
                    </MainLayout>
                </ResumeContext.Provider>
            </AISettingsProvider>
        </>
    )
}
