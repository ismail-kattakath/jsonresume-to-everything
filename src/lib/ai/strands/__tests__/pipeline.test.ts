import { runAIGenerationPipeline, PipelineProgress, PipelineResult } from '../pipeline'
import { analyzeJobDescriptionGraph } from '../jd-refinement-graph'
import { generateSummaryGraph } from '../summary-graph'
import type { AgentConfig } from '../types'
import type { ResumeData } from '@/types'

jest.mock('../jd-refinement-graph', () => ({
    analyzeJobDescriptionGraph: jest.fn(),
}))

jest.mock('../summary-graph', () => ({
    generateSummaryGraph: jest.fn(),
}))

describe('runAIGenerationPipeline', () => {
    const mockConfig: AgentConfig = {
        apiKey: 'test-key',
        model: 'gpt-4o-mini',
        apiUrl: 'https://api.openai.com',
        providerType: 'openai-compatible',
    }

    const mockResumeData: ResumeData = {
        name: 'John Doe',
        position: 'Developer',
        email: 'john@example.com',
        contactInformation: '',
        address: '',
        summary: 'Old summary',
        workExperience: [
            {
                organization: 'Corp',
                url: '',
                position: 'Dev',
                startYear: '2020',
                endYear: '2021',
                description: 'Did stuff',
                keyAchievements: [],
            }
        ],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
        socialMedia: [],
        profilePicture: '',
    }

    const mockJobDescription = 'Seeking a great developer'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('runs the pipeline and returns refined JD and summary', async () => {
        const mockRefinedJD = 'Refined job description: Seeking a great developer.'
        const mockSummary = 'New professional summary tailored to JD.'

            // Setup mocks
            ; (analyzeJobDescriptionGraph as jest.Mock).mockImplementation(async (jd, config, onProgress) => {
                onProgress({ content: 'Analyzing JD...', done: false })
                return mockRefinedJD
            })

            ; (generateSummaryGraph as jest.Mock).mockImplementation(async (data, jd, config, onProgress) => {
                onProgress({ content: 'Writing Summary...', done: false })
                return mockSummary
            })

        const onProgress = jest.fn()

        const result = await runAIGenerationPipeline(
            mockResumeData,
            mockJobDescription,
            mockConfig,
            onProgress
        )

        // Assert the result structure
        expect(result).toEqual({
            refinedJD: mockRefinedJD,
            summary: mockSummary,
            workExperiences: mockResumeData.workExperience, // Remains unchanged since it's disabled
        })

        // Assert graph functions were called correctly
        expect(analyzeJobDescriptionGraph).toHaveBeenCalledWith(
            mockJobDescription,
            mockConfig,
            expect.any(Function)
        )

        expect(generateSummaryGraph).toHaveBeenCalledWith(
            mockResumeData,
            mockRefinedJD,
            mockConfig,
            expect.any(Function)
        )

        // Assert progress callbacks occurred
        expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Refining job description...',
            })
        )
        expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Analyzing JD...',
            })
        )
        expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Writing Summary...',
            })
        )
        expect(onProgress).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'AI optimization complete!',
                done: true,
            })
        )
    })

    it('runs successfully without an onProgress callback', async () => {
        ; (analyzeJobDescriptionGraph as jest.Mock).mockResolvedValue('JD')
            ; (generateSummaryGraph as jest.Mock).mockResolvedValue('Summary')

        const result = await runAIGenerationPipeline(
            mockResumeData,
            mockJobDescription,
            mockConfig
        )

        expect(result.refinedJD).toBe('JD')
        expect(result.summary).toBe('Summary')
    })

    it('handles missing workExperience gracefully', async () => {
        const resumeWithoutExp = { ...mockResumeData, workExperience: undefined } as any
            ; (analyzeJobDescriptionGraph as jest.Mock).mockResolvedValue('JD')
            ; (generateSummaryGraph as jest.Mock).mockResolvedValue('Summary')

        const result = await runAIGenerationPipeline(
            resumeWithoutExp,
            mockJobDescription,
            mockConfig
        )

        expect(result.workExperiences).toEqual([])
    })

    it('checks coverage for onProgress skips (done: true or no content)', async () => {
        ; (analyzeJobDescriptionGraph as jest.Mock).mockImplementation(async (jd, config, onProgress) => {
            onProgress({ done: true }) // No content, should skip updating the progress callback
            return 'JD'
        })
            ; (generateSummaryGraph as jest.Mock).mockImplementation(async (data, jd, config, onProgress) => {
                onProgress({ content: 'Done writing!', done: true }) // Done is true, should skip updating the progress callback
                return 'Summary'
            })

        const onProgress = jest.fn()

        await runAIGenerationPipeline(
            mockResumeData,
            mockJobDescription,
            mockConfig,
            onProgress
        )

        expect(onProgress).not.toHaveBeenCalledWith(expect.objectContaining({ message: 'Done writing!' }))
    })
})
