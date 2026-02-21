import { runAIGenerationPipeline } from '@/lib/ai/strands/pipeline'
import { analyzeJobDescriptionGraph } from '@/lib/ai/strands/jd-refinement-graph'
import { generateJobTitleGraph } from '@/lib/ai/strands/job-title-graph'
import { generateSummaryGraph } from '@/lib/ai/strands/summary-graph'
import { tailorExperienceToJDGraph } from '@/lib/ai/strands/experience-tailoring-graph'
import { sortSkillsGraph } from '@/lib/ai/strands/skills-sorting-graph'
import { extractSkillsGraph } from '@/lib/ai/strands/skills-extraction-graph'
import { generateCoverLetterGraph } from '@/lib/ai/strands/cover-letter-graph'
import type { AgentConfig } from '@/lib/ai/strands/types'
import type { ResumeData } from '@/types'

jest.mock('../jd-refinement-graph', () => ({
  analyzeJobDescriptionGraph: jest.fn(),
}))

jest.mock('../job-title-graph', () => ({
  generateJobTitleGraph: jest.fn(),
}))

jest.mock('../summary-graph', () => ({
  generateSummaryGraph: jest.fn(),
}))

jest.mock('../experience-tailoring-graph', () => ({
  tailorExperienceToJDGraph: jest.fn(),
}))

jest.mock('../skills-sorting-graph', () => ({
  sortSkillsGraph: jest.fn(),
}))

jest.mock('../skills-extraction-graph', () => ({
  extractSkillsGraph: jest.fn(),
}))

jest.mock('../cover-letter-graph', () => ({
  generateCoverLetterGraph: jest.fn(),
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
      },
    ],
    education: [],
    skills: [{ title: 'Tech', skills: [{ text: 'React' }] }],
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
    const mockJobTitle = 'Senior Developer'
    const mockTailoredExp = {
      description: 'Polished dev work',
      achievements: ['Won hackathon'],
      techStack: ['Next.js', 'TRPC'],
    }
    const mockSortedSkills = {
      groupOrder: ['Tech'],
      skillOrder: { Tech: ['React'] },
    }
    const mockExtractedKeywords = ['Next.js']
    const mockCoverLetter = 'Dear Hiring Manager...'

    // Setup mocks
    ;(analyzeJobDescriptionGraph as jest.Mock).mockImplementation(async (jd, config, onProgress) => {
      onProgress({ content: 'Analyzing JD...', done: false })
      return mockRefinedJD
    })
    ;(generateJobTitleGraph as jest.Mock).mockImplementation(async (data, jd, config, onProgress) => {
      onProgress({ content: 'Crafting Job Title...', done: false })
      return mockJobTitle
    })
    ;(generateSummaryGraph as jest.Mock).mockImplementation(async (data, jd, config, onProgress) => {
      onProgress({ content: 'Writing Summary...', done: false })
      return mockSummary
    })
    ;(tailorExperienceToJDGraph as jest.Mock).mockImplementation(
      async (desc, ach, title, org, jd, tech, config, onProgress) => {
        onProgress({ content: 'Tailoring experience...', done: false })
        return mockTailoredExp
      }
    )
    ;(sortSkillsGraph as jest.Mock).mockImplementation(async (skills, jd, config, onProgress) => {
      onProgress({ content: 'Sorting skills...', done: false })
      return mockSortedSkills
    })
    ;(extractSkillsGraph as jest.Mock).mockImplementation(async (jd, config, onProgress) => {
      onProgress({ content: 'Extracting keywords...', done: false })
      return mockExtractedKeywords
    })
    ;(generateCoverLetterGraph as jest.Mock).mockImplementation(async (data, jd, config, onProgress) => {
      onProgress({ content: 'Drafting Cover Letter...', done: false })
      return mockCoverLetter
    })

    const onProgress = jest.fn()

    const result = await runAIGenerationPipeline(mockResumeData, mockJobDescription, mockConfig, onProgress)

    // Assert the result structure
    expect(result).toEqual({
      refinedJD: mockRefinedJD,
      jobTitle: mockJobTitle,
      summary: mockSummary,
      workExperiences: [
        {
          ...mockResumeData.workExperience[0],
          description: mockTailoredExp.description,
          keyAchievements: mockTailoredExp.achievements.map((text) => ({ text })),
          technologies: mockTailoredExp.techStack,
        },
      ],
      skills: [
        {
          title: 'Tech',
          skills: [{ text: 'React', highlight: undefined }],
        },
      ],
      coverLetter: mockCoverLetter,
    })

    // Assert graph functions were called correctly
    expect(analyzeJobDescriptionGraph).toHaveBeenCalledWith(mockJobDescription, mockConfig, expect.any(Function))
    expect(generateJobTitleGraph).toHaveBeenCalledWith(mockResumeData, mockRefinedJD, mockConfig, expect.any(Function))
    expect(generateSummaryGraph).toHaveBeenCalledWith(mockResumeData, mockRefinedJD, mockConfig, expect.any(Function))

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
  })

  it('runs successfully without an onProgress callback', async () => {
    ;(analyzeJobDescriptionGraph as jest.Mock).mockResolvedValue('JD')
    ;(generateJobTitleGraph as jest.Mock).mockResolvedValue('Title')
    ;(generateSummaryGraph as jest.Mock).mockResolvedValue('Summary')
    ;(tailorExperienceToJDGraph as jest.Mock).mockResolvedValue({
      description: 'Desc',
      achievements: ['Ach'],
      techStack: ['Tech'],
    })
    ;(sortSkillsGraph as jest.Mock).mockResolvedValue({ groupOrder: [], skillOrder: {} })
    ;(extractSkillsGraph as jest.Mock).mockResolvedValue(['Keyword'])
    ;(generateCoverLetterGraph as jest.Mock).mockResolvedValue('Letter')

    const result = await runAIGenerationPipeline(mockResumeData, mockJobDescription, mockConfig)

    expect(result.refinedJD).toBe('JD')
    expect(result.summary).toBe('Summary')
  })

  it('handles missing workExperience gracefully', async () => {
    const resumeWithoutExp = {
      ...mockResumeData,
      workExperience: undefined,
    } as unknown as ResumeData
    ;(analyzeJobDescriptionGraph as jest.Mock).mockResolvedValue('JD')
    ;(generateJobTitleGraph as jest.Mock).mockResolvedValue('Title')
    ;(generateSummaryGraph as jest.Mock).mockResolvedValue('Summary')
    ;(tailorExperienceToJDGraph as jest.Mock).mockResolvedValue({
      description: 'Desc',
      achievements: ['Ach'],
      techStack: ['Tech'],
    })
    ;(sortSkillsGraph as jest.Mock).mockResolvedValue({ groupOrder: [], skillOrder: {} })
    ;(extractSkillsGraph as jest.Mock).mockResolvedValue(['Keyword'])
    ;(generateCoverLetterGraph as jest.Mock).mockResolvedValue('Letter')

    const result = await runAIGenerationPipeline(resumeWithoutExp, mockJobDescription, mockConfig)

    expect(result.workExperiences).toEqual([])
  })

  it('checks coverage for onProgress skips (done: true or no content)', async () => {
    ;(analyzeJobDescriptionGraph as jest.Mock).mockImplementation(async (jd, config, onProgress) => {
      onProgress({ done: true }) // No content, should skip updating the progress callback
      return 'JD'
    })
    ;(generateJobTitleGraph as jest.Mock).mockResolvedValue('Title')
    ;(generateSummaryGraph as jest.Mock).mockImplementation(async (data, jd, config, onProgress) => {
      onProgress({ content: 'Done writing!', done: true }) // Done is true, should skip updating the progress callback
      return 'Summary'
    })
    ;(tailorExperienceToJDGraph as jest.Mock).mockResolvedValue({
      description: 'Desc',
      achievements: ['Ach'],
      techStack: ['Tech'],
    })
    ;(sortSkillsGraph as jest.Mock).mockResolvedValue({ groupOrder: [], skillOrder: {} })
    ;(extractSkillsGraph as jest.Mock).mockResolvedValue(['Keyword'])
    ;(generateCoverLetterGraph as jest.Mock).mockResolvedValue('Letter')

    const onProgress = jest.fn()

    await runAIGenerationPipeline(mockResumeData, mockJobDescription, mockConfig, onProgress)

    expect(onProgress).not.toHaveBeenCalledWith(expect.objectContaining({ message: 'Done writing!' }))
  })
})
