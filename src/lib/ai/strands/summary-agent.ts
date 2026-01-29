/**
 * Summary Agent using Strands Agents SDK
 *
 * Implements a multi-agent pattern for generating and validating
 * professional summaries with fabrication detection.
 *
 * @see https://github.com/strands-agents/sdk-typescript
 */

import { Agent } from '@strands-agents/sdk'
import { OpenAIModel } from '@strands-agents/sdk/openai'
import { tool } from '@strands-agents/sdk'
import { z } from 'zod'
import type { ResumeData } from '@/types'

/**
 * Configuration for the Summary Agent (BYOK - Bring Your Own Key)
 */
export interface SummaryAgentConfig {
  apiKey: string
  baseURL: string
  model: string
  temperature?: number
  maxTokens?: number
}

/**
 * Result from summary generation
 */
export interface SummaryResult {
  summary: string
  fabricationsDetected: string[]
  iterationsUsed: number
  isValid: boolean
}

/**
 * Creates a tool for validating skills in generated content
 * against the candidate's actual resume skills
 */
function createValidateSkillsTool(allowedSkills: string[]) {
  // Normalize skills for comparison
  const normalizedAllowed = new Set(
    allowedSkills.map((s) => s.toLowerCase().trim())
  )

  return tool({
    name: 'validate_skills',
    description:
      'Validates that a generated summary only mentions technologies and skills that are in the candidate resume. Returns any fabrications found.',
    inputSchema: z.object({
      summary: z.string().describe('The generated summary text to validate'),
    }),
    callback: (input: { summary: string }) => {
      // Common technologies that might be fabricated from job descriptions
      const techPatterns = [
        // AI/ML platforms not in resume
        'aws bedrock',
        'bedrock',
        'langchain',
        'llamaindex',
        'llama index',
        'pinecone',
        'milvus',
        'weaviate',
        'pgvector',
        'openai',
        'azure openai',
        'anthropic',
        'cohere',
        // Other common fabrications
        'grpc',
        'kafka',
        'spark',
        'hadoop',
        'snowflake',
        'databricks',
      ]

      const summaryLower = input.summary.toLowerCase()
      const fabrications: string[] = []

      for (const tech of techPatterns) {
        if (
          summaryLower.includes(tech) &&
          !normalizedAllowed.has(tech.toLowerCase())
        ) {
          fabrications.push(tech)
        }
      }

      if (fabrications.length === 0) {
        return JSON.stringify({
          valid: true,
          message:
            'No fabrications detected. Summary uses only allowed skills.',
          fabrications: [],
        })
      }

      return JSON.stringify({
        valid: false,
        message: `Found ${fabrications.length} potential fabrication(s): ${fabrications.join(', ')}. Please regenerate without these technologies.`,
        fabrications,
      })
    },
  })
}

/**
 * Creates the Summary Agent with BYOK configuration
 */
export function createSummaryAgent(
  config: SummaryAgentConfig,
  allowedSkills: string[]
): Agent {
  const model = new OpenAIModel({
    apiKey: config.apiKey,
    clientConfig: {
      baseURL: config.baseURL,
    },
    modelId: config.model,
    maxTokens: config.maxTokens ?? 300,
    temperature: config.temperature ?? 0.5,
  })

  const validateSkillsTool = createValidateSkillsTool(allowedSkills)

  return new Agent({
    model,
    tools: [validateSkillsTool],
    systemPrompt: `You are a professional resume writer. Your task is to generate concise, accurate professional summaries.

CRITICAL RULES:
1. ONLY use skills/technologies from the provided allowed skills list
2. NEVER mention technologies not in the allowed list, even if they appear in the job description
3. If you're unsure about a technology, use the validate_skills tool to check
4. After generating a summary, ALWAYS use validate_skills to verify before responding
5. If validation fails, regenerate without the flagged technologies

OUTPUT: Single paragraph, 400-550 characters, third-person voice.`,
  })
}

/**
 * Generates a validated summary using the multi-agent pattern
 */
export async function generateValidatedSummary(
  config: SummaryAgentConfig,
  resumeData: ResumeData,
  jobDescription: string,
  _onProgress?: (chunk: string) => void // TODO: Implement streaming
): Promise<SummaryResult> {
  // Extract all skills from resume
  const allowedSkills =
    resumeData.skills?.flatMap((group) => group.skills.map((s) => s.text)) || []

  // Calculate years of experience
  const workExp = resumeData.workExperience
  const lastJob = workExp?.[workExp.length - 1]
  const firstJobYear = lastJob?.startYear
    ? new Date(lastJob.startYear).getFullYear()
    : null
  const yearsExperience = firstJobYear
    ? new Date().getFullYear() - firstJobYear
    : null

  // Extract key achievements with metrics
  const topAchievements =
    workExp
      ?.slice(0, 3)
      .flatMap((exp) =>
        exp.keyAchievements
          ?.filter((a) => /\d+%|\d+ (hours?|minutes?|users?)/.test(a.text))
          .slice(0, 2)
          .map((a) => `• ${a.text}`)
      )
      .filter(Boolean)
      .slice(0, 4)
      .join('\n') || 'No achievements provided'

  const currentRole = workExp?.[0]
    ? `${workExp[0].position} at ${workExp[0].organization}`
    : resumeData.position

  // Create the agent
  const agent = createSummaryAgent(config, allowedSkills)

  const prompt = `Generate a professional summary for this candidate targeting the job below.

CANDIDATE:
- Name: ${resumeData.name}
- Experience: ${yearsExperience ? `${yearsExperience}+` : 'extensive'} years
- Current: ${currentRole}

KEY ACHIEVEMENTS:
${topAchievements}

ALLOWED SKILLS (ONLY use these):
${allowedSkills.join(', ')}

TARGET JOB:
${jobDescription.slice(0, 1000)}

After generating, use the validate_skills tool to verify, then provide the final summary.`

  try {
    const response = await agent.invoke(prompt)

    // Extract the summary from the response using toString()
    const responseText = response.toString()

    // Check for fabrications in final output using a simple validation function
    const validationResult = validateSkillsInSummary(
      responseText,
      allowedSkills
    )

    return {
      summary: responseText,
      fabricationsDetected: validationResult.fabrications,
      iterationsUsed: 1, // TODO: Track actual iterations
      isValid: validationResult.valid,
    }
  } catch (error) {
    console.error('Summary agent error:', error)
    throw error
  }
}

/**
 * Validates skills in a summary against allowed skills list
 */
function validateSkillsInSummary(
  summary: string,
  allowedSkills: string[]
): { valid: boolean; fabrications: string[] } {
  const normalizedAllowed = new Set(
    allowedSkills.map((s) => s.toLowerCase().trim())
  )

  // Common technologies that might be fabricated
  const techPatterns = [
    'aws bedrock',
    'bedrock',
    'langchain',
    'llamaindex',
    'pinecone',
    'milvus',
    'weaviate',
    'pgvector',
    'openai',
    'azure openai',
    'anthropic',
    'cohere',
    'grpc',
  ]

  const summaryLower = summary.toLowerCase()
  const fabrications: string[] = []

  for (const tech of techPatterns) {
    if (
      summaryLower.includes(tech) &&
      !normalizedAllowed.has(tech.toLowerCase())
    ) {
      fabrications.push(tech)
    }
  }

  return {
    valid: fabrications.length === 0,
    fabrications,
  }
}

/**
 * Checks if the Strands SDK is available in the current environment
 */
export function isStrandsSdkAvailable(): boolean {
  try {
    // Check if the SDK modules are loadable
    return typeof Agent === 'function' && typeof OpenAIModel === 'function'
  } catch {
    return false
  }
}
