import { extractSkillsGraph } from '../skills-extraction'
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

describe('Skills Extraction', () => {
    const mockConfig = {
        apiUrl: 'http://localhost:1234/v1',
        apiKey: 'test-key',
        model: 'test-model',
    }

    const mockJD = 'Looking for a React developer with Postgres experience.'
    const mockResumeData = {
        skills: [
            { title: 'Frontend', skills: [{ text: 'React.js' }] },
            { title: 'Backend', skills: [{ text: 'PostgreSQL' }] },
        ],
    } as any

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('extractSkillsGraph', () => {
        it('extracts, aligns, and returns a comma-separated list of skills', async () => {
            const mockExtraction = 'React, Postgres'
            const mockAlignment = 'React.js, PostgreSQL'

            const mockExtractorInvoke = jest.fn().mockResolvedValue({ toString: () => mockExtraction })
            const mockMatcherInvoke = jest.fn().mockResolvedValue({ toString: () => mockAlignment })
            const mockEvaluatorInvoke = jest.fn().mockResolvedValue({ toString: () => 'APPROVED' })

            let agentCallCount = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    agentCallCount++
                    return {
                        invoke: agentCallCount === 1 ? mockExtractorInvoke :
                            agentCallCount === 2 ? mockMatcherInvoke : mockEvaluatorInvoke,
                    }
                })

            const onProgress = jest.fn()
            const result = await extractSkillsGraph(mockJD, mockResumeData, mockConfig, onProgress)

            expect(Agent).toHaveBeenCalledTimes(3) // Extractor, Matcher, Evaluator
            expect(mockExtractorInvoke).toHaveBeenCalledWith(expect.stringContaining(mockJD))
            expect(mockMatcherInvoke).toHaveBeenCalledWith(expect.stringContaining(mockExtraction))
            expect(mockMatcherInvoke).toHaveBeenCalledWith(expect.stringContaining('React.js, PostgreSQL'))
            expect(result).toBe(mockAlignment)
            expect(onProgress).toHaveBeenCalledWith(expect.objectContaining({ done: true }))
        })

        it('fixes formatting if the evaluator reyects the list', async () => {
            const mockExtraction = 'React, Postgres'
            const mockAlignment = '1. React.js, 2. PostgreSQL'
            const mockFixed = 'React.js, PostgreSQL'

            const mockExtractorInvoke = jest.fn().mockResolvedValue({ toString: () => mockExtraction })

            // Scribe/Matcher will be called twice (index 2 and index 4 in total sequence)
            const mockMatcherInvoke = jest
                .fn()
                .mockResolvedValueOnce({ toString: () => mockAlignment }) // 1st alignment (bad format)
                .mockResolvedValueOnce({ toString: () => mockFixed })     // 2nd alignment (fix)

            const mockEvaluatorInvoke = jest.fn().mockResolvedValue({ toString: () => 'CRITIQUE: No numbers please' })

            let agentCount = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    agentCount++
                    const currentId = agentCount
                    return {
                        invoke: (prompt: string) => {
                            if (currentId === 1) return mockExtractorInvoke(prompt)
                            if (currentId === 2) return mockMatcherInvoke(prompt)
                            if (currentId === 3) return mockEvaluatorInvoke(prompt)
                            return Promise.resolve({ toString: () => '' })
                        }
                    }
                })

            const result = await extractSkillsGraph(mockJD, mockResumeData, mockConfig)

            expect(mockMatcherInvoke).toHaveBeenCalledTimes(2)
            expect(result).toBe(mockFixed)
        })
    })
})
