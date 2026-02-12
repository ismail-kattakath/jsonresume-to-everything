import { sortSkillsGraph } from '../skills-sorting'
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

describe('Skills Sorting', () => {
    const mockConfig: any = {
        apiUrl: 'http://localhost:1234/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerType: 'openai-compatible',
    }

    const mockJD = 'Looking for a Senior React Developer.'

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('sortSkillsGraph', () => {
        const mockSkills = [
            { title: 'Programming', skills: [{ text: 'React' }, { text: 'JS' }] },
        ]

        it('sorts and returns validated JSON result via three-agent flow', async () => {
            const mockAnalysis = 'Brain says: Sort JS first and add Next.js'
            const mockResult = {
                groupOrder: ['Programming'],
                skillOrder: { Programming: ['JS', 'React', 'Next.js'] },
            }

            const mockBrainInvoke = jest.fn().mockResolvedValue({ toString: () => mockAnalysis })
            const mockScribeInvoke = jest.fn().mockResolvedValue({ toString: () => JSON.stringify(mockResult) })
            const mockEditorInvoke = jest.fn().mockResolvedValue({ toString: () => 'APPROVED' })

            let agentCallCount = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    agentCallCount++
                    return {
                        invoke: agentCallCount === 1 ? mockBrainInvoke :
                            agentCallCount === 2 ? mockScribeInvoke : mockEditorInvoke,
                    }
                })

            const result = await sortSkillsGraph(mockSkills, mockJD, mockConfig)

            expect(Agent).toHaveBeenCalledTimes(3) // Brain, Scribe, Editor
            expect(mockBrainInvoke).toHaveBeenCalled()
            expect(mockScribeInvoke).toHaveBeenCalledWith(expect.stringContaining(mockAnalysis))
            expect(result).toEqual(mockResult)
        })

        it('retries Scribe when Editor provides critique', async () => {
            const mockAnalysis = 'Brain says: Good'
            const mockResult = {
                groupOrder: ['Programming'],
                skillOrder: { Programming: ['JS', 'React'] },
            }

            const mockBrainInvoke = jest.fn().mockResolvedValue({ toString: () => mockAnalysis })
            const mockScribeInvoke = jest
                .fn()
                .mockResolvedValueOnce({ toString: () => 'invalid-json' })
                .mockResolvedValueOnce({ toString: () => JSON.stringify(mockResult) })

            const mockEditorInvoke = jest
                .fn()
                .mockResolvedValueOnce({ toString: () => 'CRITIQUE: Bad JSON' })
                .mockResolvedValueOnce({ toString: () => 'APPROVED' })

            let callSequence = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    callSequence++
                    const localSeq = callSequence // closure
                    return {
                        invoke: (prompt: string) => {
                            if (localSeq === 1) return mockBrainInvoke(prompt)
                            if (localSeq === 2) return mockScribeInvoke(prompt)
                            if (localSeq === 3) return mockEditorInvoke(prompt)
                            return Promise.resolve({ toString: () => '' })
                        }
                    }
                })

            const result = await sortSkillsGraph(mockSkills, mockJD, mockConfig)

            expect(mockBrainInvoke).toHaveBeenCalledTimes(1)
            expect(mockScribeInvoke).toHaveBeenCalledTimes(2)
            expect(mockEditorInvoke).toHaveBeenCalledTimes(2)
            expect(result).toEqual(mockResult)
        })

        it('falls back to parsing last result on error after max iterations', async () => {
            const mockResult = {
                groupOrder: ['Programming'],
                skillOrder: { Programming: ['React'] },
            }
            const mockAnalysis = 'Brain says: Never perfect'
            const mockBrainInvoke = jest.fn().mockResolvedValue({ toString: () => mockAnalysis })
            const mockScribeInvoke = jest
                .fn()
                .mockResolvedValue({ toString: () => JSON.stringify(mockResult) })
            const mockEditorInvoke = jest
                .fn()
                .mockResolvedValue({ toString: () => 'CRITIQUE: Never perfect' })

            let callSequence = 0
                ; (Agent as jest.Mock).mockImplementation(() => {
                    callSequence++
                    const localSeq = callSequence
                    return {
                        invoke: (prompt: string) => {
                            if (localSeq === 1) return mockBrainInvoke(prompt)
                            if (localSeq === 2) return mockScribeInvoke(prompt)
                            if (localSeq === 3) return mockEditorInvoke(prompt)
                            return Promise.resolve({ toString: () => '' })
                        }
                    }
                })

            const result = await sortSkillsGraph(mockSkills, mockJD, mockConfig)

            expect(mockBrainInvoke).toHaveBeenCalledTimes(1)
            expect(mockScribeInvoke).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
            expect(mockEditorInvoke).toHaveBeenCalledTimes(3) // 1 initial + 2 retries
            expect(result).toEqual(mockResult)
        })
    })
})
