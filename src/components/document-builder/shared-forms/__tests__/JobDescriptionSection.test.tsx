// @ts-nocheck
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import JobDescriptionSection from '../JobDescriptionSection'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { analyzeJobDescriptionGraph, runAIGenerationPipeline } from '@/lib/ai/strands/agent'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/contexts/AISettingsContext')
jest.mock('@/lib/ai/strands/agent')
jest.mock('sonner', () => {
    const m = jest.fn() as any
    m.success = jest.fn()
    m.error = jest.fn()
    m.promise = jest.fn()
    m.dismiss = jest.fn()
    m.loading = jest.fn()
    return { toast: m }
})

const mockToast = toast as any
const mockUseAISettings = useAISettings as jest.MockedFunction<typeof useAISettings>

describe('JobDescriptionSection Component', () => {
    const mockUpdateSettings = jest.fn()
    const mockSetResumeData = jest.fn()
    const mockResumeData = {
        name: 'Test User',
        summary: '',
        workExperience: [],
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAISettings.mockReturnValue({
            settings: {
                apiUrl: 'https://api.openai.com/v1',
                apiKey: 'test-key',
                model: 'gpt-4o-mini',
                jobDescription: '',
            },
            updateSettings: mockUpdateSettings,
            isConfigured: true,
            isPipelineActive: false,
            setIsPipelineActive: jest.fn(),
        })
    })

    const renderComponent = () => {
        return render(
            <ResumeContext.Provider value={{ resumeData: mockResumeData, setResumeData: mockSetResumeData }}>
                <JobDescriptionSection />
            </ResumeContext.Provider>
        )
    }

    describe('Job Description Input', () => {
        it('renders job description textarea', () => {
            renderComponent()
            expect(screen.getByLabelText('Job Description')).toBeInTheDocument()
        })

        it('updates settings when job description changes', () => {
            renderComponent()
            const textarea = screen.getByLabelText('Job Description')

            fireEvent.change(textarea, {
                target: { value: 'Looking for a React developer' },
            })

            expect(mockUpdateSettings).toHaveBeenCalledWith({
                jobDescription: 'Looking for a React developer',
            })
        })
    })

    describe('Job Description Refinement', () => {
        it('shows error toast if job description is too short', async () => {
            mockUseAISettings.mockReturnValue({
                settings: {
                    apiUrl: 'url',
                    apiKey: 'key',
                    model: 'model',
                    jobDescription: 'Too short',
                },
                updateSettings: mockUpdateSettings,
                isConfigured: true,
                isPipelineActive: false,
                setIsPipelineActive: jest.fn(),
            })

            renderComponent()
            const refineButton = screen.getByTitle('Refine with AI').closest('button')!
            fireEvent.click(refineButton)

            expect(mockToast.error).toHaveBeenCalledWith(expect.stringContaining('min 50 chars'))
        })

        it('triggers refinement flow', async () => {
            const longJD = 'This is a sufficiently long job description for testing purposes.'.repeat(5)
            mockUseAISettings.mockReturnValue({
                settings: {
                    apiUrl: 'url',
                    apiKey: 'key',
                    model: 'model',
                    jobDescription: longJD,
                },
                updateSettings: mockUpdateSettings,
                isConfigured: true,
                isPipelineActive: false,
                setIsPipelineActive: jest.fn(),
            })

            analyzeJobDescriptionGraph.mockResolvedValue('Refined JD')

            renderComponent()
            const refineButton = screen.getByTitle('Refine with AI').closest('button')!
            fireEvent.click(refineButton)

            await waitFor(() => {
                expect(analyzeJobDescriptionGraph).toHaveBeenCalled()
                expect(mockUpdateSettings).toHaveBeenCalledWith({
                    jobDescription: 'Refined JD',
                })
                expect(mockToast.success).toHaveBeenCalled()
            })
        })
    })

    describe('Resume Optimization Pipeline', () => {
        it('triggers optimization pipeline', async () => {
            const longJD = 'This is a sufficiently long job description for testing purposes.'.repeat(5)
            mockUseAISettings.mockReturnValue({
                settings: {
                    apiUrl: 'url',
                    apiKey: 'key',
                    model: 'model',
                    jobDescription: longJD,
                },
                updateSettings: mockUpdateSettings,
                isConfigured: true,
                isPipelineActive: false,
                setIsPipelineActive: jest.fn(),
            })

            const mockResult = {
                summary: 'Optimized Summary',
                workExperiences: [{ company: 'Test' }],
            }
            runAIGenerationPipeline.mockResolvedValue(mockResult)

            renderComponent()
            const optimizeButton = screen.getByText('Optimize by JD').closest('button')!
            fireEvent.click(optimizeButton)

            await waitFor(() => {
                expect(runAIGenerationPipeline).toHaveBeenCalled()
                expect(mockSetResumeData).toHaveBeenCalledWith(expect.objectContaining({
                    summary: 'Optimized Summary',
                    workExperience: mockResult.workExperiences,
                }))
                expect(mockToast.success).toHaveBeenCalled()
            })
        })
    })
})
