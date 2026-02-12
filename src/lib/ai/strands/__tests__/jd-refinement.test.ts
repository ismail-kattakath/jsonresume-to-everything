import { analyzeJobDescription, analyzeJobDescriptionGraph } from '../jd-refinement'
import { Agent } from '@strands-agents/sdk'

// Mock the Strands SDK
jest.mock('@strands-agents/sdk', () => {
    return {
        Agent: jest.fn().mockImplementation(() => ({
            invoke: jest.fn(),
            stream: jest.fn(),
        })),
    }
})

jest.mock('@strands-agents/sdk/openai', () => {
    return {
        OpenAIModel: jest.fn().mockImplementation(() => ({})),
    }
})

describe('JD Refinement', () => {
    const mockConfig: any = {
        apiUrl: 'http://localhost:1234/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerType: 'openai-compatible',
    }

    const mockJD =
        'Looking for a Senior React Developer with experience in Next.js.'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('analyzeJobDescription', () => {
        it('uses invoke when no onProgress is provided', async () => {
            const mockInvoke = jest.fn().mockResolvedValue({
                toString: () => 'Improved JD text',
            })
                ; (Agent as jest.Mock).mockImplementation(() => ({
                    invoke: mockInvoke,
                }))

            const result = await analyzeJobDescription(mockJD, mockConfig)

            expect(Agent).toHaveBeenCalled()
            expect(mockInvoke).toHaveBeenCalledWith(mockJD)
            expect(result).toBe('Improved JD text')
        })

        it('uses stream when onProgress is provided', async () => {
            const mockStream = async function* () {
                yield {
                    type: 'modelContentBlockDeltaEvent',
                    delta: { text: 'Streamed ' },
                }
                yield {
                    type: 'modelContentBlockDeltaEvent',
                    delta: { text: 'content' },
                }
            }
            const onProgress = jest.fn()
                ; (Agent as jest.Mock).mockImplementation(() => ({
                    stream: mockStream,
                }))

            const result = await analyzeJobDescription(mockJD, mockConfig, onProgress)

            expect(Agent).toHaveBeenCalled()
            expect(onProgress).toHaveBeenCalledWith({
                content: 'Streamed ',
                done: false,
            })
            expect(onProgress).toHaveBeenCalledWith({
                content: 'content',
                done: false,
            })
            expect(onProgress).toHaveBeenCalledWith({ content: '', done: true })
            expect(result).toBe('Streamed content')
        })
    })

    describe('analyzeJobDescriptionGraph', () => {
        it('refines and returns JD if approved immediately', async () => {
            const mockRefinedJD =
                '# position-title\nSenior React Developer\n\n# core-responsibilities\n- Build UI\n\n# desired-qualifications\n- 5 years exp\n\n# required-skills\n- React, TypeScript'
            const mockRefinerInvoke = jest
                .fn()
                .mockResolvedValue({ toString: () => mockRefinedJD })
            const mockReviewerInvoke = jest
                .fn()
                .mockResolvedValue({ toString: () => 'APPROVED: Highly professional' })

            let agentCount = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    agentCount++
                    return {
                        invoke: agentCount === 1 ? mockRefinerInvoke : mockReviewerInvoke,
                    }
                })

            const onProgress = jest.fn()
            const result = await analyzeJobDescriptionGraph(
                mockJD,
                mockConfig,
                onProgress
            )

            expect(Agent).toHaveBeenCalledTimes(2) // Refiner and Reviewer
            expect(mockRefinerInvoke).toHaveBeenCalled()
            expect(mockReviewerInvoke).toHaveBeenCalledWith(
                expect.stringContaining('# position-title')
            )
            expect(onProgress).toHaveBeenCalledWith(
                expect.objectContaining({
                    content: expect.stringContaining('Approved by Reviewer'),
                })
            )
            expect(result).toBe(mockRefinedJD)
        })

        it('iterates if reviewer provides critiques', async () => {
            const mockRefiner1Value = { toString: () => 'JD V1' }
            const mockRefiner2Value = { toString: () => 'JD V2' }
            const mockReviewer1Value = { toString: () => 'CRITIQUE: Too short' }
            const mockReviewer2Value = { toString: () => 'APPROVED' }

            const mockRefineInvoke = jest
                .fn()
                .mockResolvedValueOnce(mockRefiner1Value)
                .mockResolvedValueOnce(mockRefiner2Value)

            const mockReviewInvoke = jest
                .fn()
                .mockResolvedValueOnce(mockReviewer1Value)
                .mockResolvedValueOnce(mockReviewer2Value)

            let agentCount = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    agentCount++
                    return {
                        invoke: agentCount === 1 ? mockRefineInvoke : mockReviewInvoke,
                    }
                })

            const result = await analyzeJobDescriptionGraph(mockJD, mockConfig)

            expect(mockRefineInvoke).toHaveBeenCalledTimes(2)
            expect(mockReviewInvoke).toHaveBeenCalledTimes(2)
            expect(mockRefineInvoke).toHaveBeenLastCalledWith(
                expect.stringContaining('CRITIQUE: Too short')
            )
            expect(result).toBe('JD V2')
        })

        it('stops at max iterations', async () => {
            const mockRefineInvoke = jest
                .fn()
                .mockResolvedValue({ toString: () => 'Always Same' })
            const mockReviewInvoke = jest
                .fn()
                .mockResolvedValue({ toString: () => 'CRITIQUE: Loop' })

            let agentCount = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    agentCount++
                    return {
                        invoke: agentCount === 1 ? mockRefineInvoke : mockReviewInvoke,
                    }
                })

            const result = await analyzeJobDescriptionGraph(mockJD, mockConfig)

            expect(mockRefineInvoke).toHaveBeenCalledTimes(3)
            expect(mockReviewInvoke).toHaveBeenCalledTimes(3)
            expect(result).toBe('Always Same')
        })
    })
})
